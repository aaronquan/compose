import { loadVertexShaders } from "./Shaders/Vertex/vertex";
import { loadFragmentShaders } from "./Shaders/Fragment/fragment";
import type { ShaderProgram } from "./Shaders/shader";
import * as Shader from "./Shaders/custom";

import * as Shapes from "./Shapes/Shapes"
import * as Matrix from "./Matrix/matrix";
import * as Line from "./Shapes/Line";
import * as Colour from "./colour";
import * as Texture from "./Texture/texture"

type Float = number;
type Int32 = number;

export * as Colour from "./colour";
export * as Shapes from "./Shapes/Shapes";
export * as Matrix from "./Matrix/matrix";
export * as Texture from "./Texture/texture";
export * as Line from "./Shapes/Line";
export * as Shader from "./Shaders/custom";
export * as App from "./app";


type VoidFunction = () => void;

export class WebGL{
  static gl: WebGL2RenderingContext | null;
  static active_shader_program: ShaderProgram | null;
  private static initialised: boolean = false;
  //static buffer: WebGLBuffer | null; for testing
  static defaultError(){
    throw new Error("WebGL not initialised or null");
  }
  static initialise(canvas: HTMLCanvasElement){
    this.gl = canvas.getContext("webgl2", {alpha: false});
    this.resetViewport(canvas);
    if(this.gl && !this.initialised){
      loadVertexShaders();
      loadFragmentShaders();
      this.initialised = true;
      //this.buffer = this.gl.createBuffer();
    }
  }

  static resetViewport(canvas: HTMLCanvasElement){
    this.gl!.viewport(0, 0, canvas.width, canvas.height);
  }

  static rectangleModel(x: Float, y: Float, width: number, height: number): Matrix.TransformationMatrix3x3{
    let model = Matrix.TransformationMatrix3x3.translate(x, y);
    model.scale(width, height);
    return model;
  }
  static lineModel(x1: Float, y1: Float, x2: Float, y2: Float, lt: Float){
    const line = new Line.Line(x1, y1, x2, y2);

    let model = Matrix.TransformationMatrix3x3.identity();
    model.translate(x1, y1);
    model.rotate(-line.angleInRadians());
    model.scale(line.length(), lt);
    model.translate(0, -0.5);
    
    return model;
  }
}


//can only draw rects
export class BasicModel{
  static colour_shader: Shader.MVPColourProgram;

  static init(){
    this.colour_shader = new Shader.MVPColourProgram();
  }

  parts: BasicModelItem2D[];
  constructor(){
    this.parts = [];
  }
  colourAll(colour: Colour.ColourRGB){
    for(const part of this.parts){
      part.colour = colour;
    }
  }
  addPart(part: BasicModelItem2D){
    this.parts.push(part);
  }
  draw(p: Matrix.TransformationMatrix3x3){
    if(BasicModel.colour_shader == undefined){
      BasicModel.init();
    }
    const shader = BasicModel.colour_shader;
    shader.use();
    for(const model of this.parts){
      shader.setMvp(p.multiplyCopy(model.transformation));
      shader.setColour(model.colour.red, model.colour.green, model.colour.blue);
      Shapes.Quad.drawRelative();
    }
  }
  static drawItem(vp: Matrix.TransformationMatrix3x3, item: BasicModelItem2D){
    const shader = BasicModel.colour_shader;
    shader.use();
    shader.setColour(item.colour.red, item.colour.green, item.colour.blue);
    shader.setMvp(vp.multiplyCopy(item.transformation));
    Shapes.Quad.draw();
  }
  static defaultItem(): BasicModelItem2D{
    return {colour: Colour.ColourUtils.white(), transformation: Matrix.TransformationMatrix3x3.identity()};
  }
}

export type BasicModelItem2D = {
  colour: Colour.ColourRGB;
  transformation: Matrix.TransformationMatrix3x3;
}


export function testBasicModel(){
  const pers = Matrix.TransformationMatrix3x3.orthographic(0, 10, 10, 0);
  const s1 = WebGL.rectangleModel(0, 0, 5, 5);
  const s2 = WebGL.rectangleModel(5, 5, 5, 5);
  const bm = new BasicModel();
  BasicModel.init();

  const white = {red: 1, green: 1, blue: 1};
  const blue = {red: 0, green: 0, blue: 1};
  bm.addPart({colour: white, transformation: s1});
  bm.addPart({colour: white, transformation: s2});


  const s3 = WebGL.rectangleModel(3, 5, 2, 2);
  const s4 = WebGL.rectangleModel(5,3, 2, 2);
  bm.addPart({colour: blue, transformation: s3});
  bm.addPart({colour: blue, transformation: s4});


  bm.draw(pers);
  //Shapes.Quad.draw();
}

export class FontLoader{
  private fonts: Map<string, Texture.CustomFont>;
  loaded: Int32;
  loading: boolean; // prevention measure for loading while another load is active
  to_load: Texture.CustomFont[];
  finished_loading: Int32;
  constructor(){
    this.fonts = new Map();
    this.loaded = 0;
    this.loading = false;
    this.to_load = [];
    this.finished_loading = 0;
  }
  addFont(name: string): boolean{
    if(this.loading) return false;
    const font = new Texture.CustomFont(name);
    this.fonts.set(name, font);
    return true;
  }
  loadFonts(onAllLoaded: () => void) {
    function finishLoading(fl: FontLoader){
      if(fl.finished_loading == fl.to_load.length){
        console.log("end loading");
        onAllLoaded();
        fl.loading = false;
      }
    }
    if(!this.loading){
      console.log("start loading fonts");
      this.loading = true;
      this.to_load = [];
      for(const [name, font] of this.fonts){
        this.to_load.push(font);
      }
      console.log(this.to_load);

      for(const font of this.to_load){
        console.log(font);
        font.load(() => {
          this.loaded++;
          this.finished_loading++;
          console.log(`finished ${font.font_name}`);
          finishLoading(this);
        },
        (e) => {
          console.log(`error loading ${font.font_name} - ${e}`);
          this.finished_loading++;
          finishLoading(this);
        });
      }
    }
  }
  getFont(name: string): Texture.CustomFont | undefined{
    return this.fonts.get(name);
  }
}

export class TextDrawer{
  sprite_sheet_shader: Shader.MVPSpriteSheetProgram;
  colour_sheet_shader: Shader.MVPSpriteSheetColourProgram;
  font?: Texture.CustomFont;
  constructor(){
    this.sprite_sheet_shader = new Shader.MVPSpriteSheetProgram();
    this.colour_sheet_shader = new Shader.MVPSpriteSheetColourProgram();
  }
  setFont(font: Texture.CustomFont){
    this.font = font;
  }
  loadFont(onLoaded:()=>void=()=>{}){
  }

  drawTextModelColour(mat: Matrix.TransformationMatrix3x3, text: string, size: Float, colour: Colour.ColourRGB){
    if(this.font){
      this.colour_sheet_shader.use();
      this.colour_sheet_shader.setColourFromColourRGB(colour);
      this.font.active(0);
      this.colour_sheet_shader.setTextureId(0);
      const scale = Matrix.TransformationMatrix3x3.scale(size, size);
      const gl = WebGL.gl!;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for(let i = 0; i < text.length; i++){
        if(text[i] == ' ') continue;
        const tr = Matrix.TransformationMatrix3x3.translate(size*i,0);
        const matrix = mat.multiplyCopy(tr.multiplyCopy(scale));
        this.colour_sheet_shader.setMvp(matrix);
        this.font.setChar(this.colour_sheet_shader, text[i]);
        Shapes.Quad.drawRelative();
      }

      gl.disable(gl.BLEND);
    }

  }
  drawText(vp: Matrix.TransformationMatrix3x3, x: Float, y: Float, text: string, size: Float){
    if(this.font){
      const gl = WebGL.gl!;
      this.sprite_sheet_shader.use();
      this.font.active(1);
      this.sprite_sheet_shader.setTextureId(1);
      const scale = Matrix.TransformationMatrix3x3.scale(size, size);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for(let i = 0; i < text.length; i++){
        if(text[i] == ' ') continue;
        const cx = x+i*size;
        const tr = Matrix.TransformationMatrix3x3.translate(cx, y);
        const model = tr.multiplyCopy(scale);
        this.sprite_sheet_shader.setMvp(vp.multiplyCopy(model));
        this.font.setChar(this.sprite_sheet_shader, text[i]);
        Shapes.Quad.drawRelative();
      }
      gl.disable(gl.BLEND);
    }else{
      throw "TextDrawer: No font set";
    }
  }
  drawTextModel(mat: Matrix.TransformationMatrix3x3, text: string, size: Float){
    if(this.font){
      const gl = WebGL.gl!;
      this.sprite_sheet_shader.use();
      this.font.active(1);
      this.sprite_sheet_shader.setTextureId(1);
      const scale = Matrix.TransformationMatrix3x3.scale(size, size);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for(let i = 0; i < text.length; i++){
        if(text[i] == ' ') continue;
        const tr = Matrix.TransformationMatrix3x3.translate(size*i,0);
        
        const matrix = mat.multiplyCopy(tr.multiplyCopy(scale));
        this.sprite_sheet_shader.setMvp(matrix);
        this.font.setChar(this.sprite_sheet_shader, text[i]);
        Shapes.Quad.drawRelative();
      }
      gl.disable(gl.BLEND);
    }
  }
  drawTextColour(vp: Matrix.TransformationMatrix3x3, x: Float, y: Float, text: string, size: Float, colour: Colour.ColourRGB){
    if(this.font){
      const gl = WebGL.gl!;
      this.colour_sheet_shader.use();
      this.colour_sheet_shader.setColourFromColourRGB(colour);
      this.font.active(1);
      this.colour_sheet_shader.setTextureId(1);
      const scale = Matrix.TransformationMatrix3x3.scale(size, size);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for(let i = 0; i < text.length; i++){
        if(text[i] == ' ') continue;
        const cx = x+i*size;
        const tr = Matrix.TransformationMatrix3x3.translate(cx, y);
        const model = tr.multiplyCopy(scale);
        this.colour_sheet_shader.setMvp(vp.multiplyCopy(model));
        this.font.setChar(this.colour_sheet_shader, text[i]);
        Shapes.Quad.drawRelative();
      }
      gl.disable(gl.BLEND);
    }else{
      throw "TextDrawer: No font set";
    }
  }
  //expects that all characters are of same width
  getTextWidth(text: string, size: Float): Float{
    return text.length*size;
  }
}

export default WebGL;