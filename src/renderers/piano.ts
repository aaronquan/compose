import { PianoDrawProps, VisualNoteFind } from "../interface/PianoView";
import * as WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";
import * as Note from "../compose/note";
import * as Colour from "./../WebGL/colour";

type Float = number;

export type PianoDrawInteractiveProps = PianoDrawProps & {
  mouse_down: VisualNoteFind | null;
  mouse_over: VisualNoteFind | null;
}

export class PianoState{
  mouse_down: VisualNoteFind | null;
  mouse_over: VisualNoteFind | null;
  constructor(){
    this.mouse_down = null;
    this.mouse_over = null;
  }
}

export class PianoRenderer{
  colour_shader: Shader.MVPColourProgram;
  vp: Matrix.TransformationMatrix3x3;
  constructor(width: number, height: number){
    this.colour_shader = new Shader.MVPColourProgram();
    this.vp = Matrix.TransformationMatrix3x3.orthographic(0, width, height, 0);
  }
  draw(props: PianoDrawInteractiveProps, piano_state: PianoState){
    const gl = WebGL.WebGL;
    const shader = new Shader.MVPColourProgram();
    const vp = this.vp;

    //white key block
    const block_width = props.key_width*props.white_keys;
    const block_height = props.key_height;
    const w_block_model = Matrix.TransformationMatrix3x3.scale(block_width, block_height);
    const mvp = vp.multiplyCopy(w_block_model);
    shader.use();
    shader.setMvp(mvp);
    shader.setColour(1.0, 1.0, 1.0);
    Shapes.Quad.draw();

    //const mo = props.mouse_over;
    const mo = piano_state.mouse_over;
    const md = piano_state.mouse_down;

    //draw white key hovers
    if(md && !md.visual_note.is_black){
      const x = props.key_width*md.visual_note.id;
      shader.setColour(0, 1, 0);
      const model = gl.rectangleModel(x, 0, props.key_width, props.key_height);
      shader.setMvp(vp.multiplyCopy(model));
      Shapes.Quad.draw();
    }else if(mo && !mo.visual_note.is_black){
      const x = mo.visual_note.id*props.key_width;
      shader.setColour(1, 0, 0);
      const model = gl.rectangleModel(x, 0, props.key_width, props.key_height);
      shader.setMvp(vp.multiplyCopy(model));
      Shapes.Quad.draw();
    }

    //midi white keys
    shader.setColour(0, 1, 0);
    for(let i = 0; i < props.white_keys; i++){
      if(props.white_notes_down[i]){
        const x = props.key_width*i;
        const model = gl.rectangleModel(x, 0, props.key_width, props.key_height);
        shader.setMvp(vp.multiplyCopy(model));
        Shapes.Quad.draw();
      }
    }

    const line_thickness = 2;
    const half_line_thickness = line_thickness/2;

    //white lines 
    shader.setColour(1, 0, 0);
    for(let i = 1; i < props.white_keys; i++){
        const x = props.key_width*i-half_line_thickness;
        const model = gl.rectangleModel(x, 0, line_thickness, props.key_height);
        shader.setMvp(vp.multiplyCopy(model));
        Shapes.Quad.draw();
    }

    //draw black keys
    const black_key_height = props.black_key_height_ratio*props.key_height;
    const black_key_width = props.black_key_width_ratio*props.key_width;

    shader.setColour(0,0,0);
    for(let i = 0; i < props.white_keys; i++){
      const has_black_key = i !== 0 && Note.white_keys_with_black_keys[(i+(props.starting_note ? props.starting_note.valueOf() : 0))%Note.white_keys_with_black_keys.length];
      if(has_black_key){
        if(props.mouse_down && props.mouse_down.visual_note.id == i && props.mouse_down.visual_note.is_black){
          shader.setColour(0, 1, 0);
        }else if(props.black_notes_down[i] || 
          (props.mouse_over && props.mouse_over.visual_note.id == i && props.mouse_over.visual_note.is_black)){
          shader.setColour(1, 0, 0);
        }else{
          shader.setColour(0, 0, 0);
        }
        const x = i*props.key_width-(black_key_width/2);
        const model = gl.rectangleModel(x, 0, black_key_width, black_key_height);
        shader.setMvp(vp.multiplyCopy(model));
        Shapes.Quad.draw();
      }
    }

    requestAnimationFrame(() => this.draw(props, piano_state));
  }

}

type Int32 = number;
type Double = number;


//black keys are facing direction
export type PianoOrientation = "left" | "up" | "right" | "down";


type StaticPianoDrawProps = {
  x: Int32;
  y: Int32;
  white_keys: Int32;
  key_width: Int32;
  key_height: Int32;
  black_key_width_ratio: Double;
  black_key_height_ratio: Double;
  starting_note: Note.Note;
  orientation: PianoOrientation;
};

type ActiveKey = {
  id: Int32,
  colour: Colour.ColourRGB
}

export class BasePianoModel{
  start_note: Note.Note;
  white_scale: Double; // thickness of generated note
  black_key_height_ratio: Double;

  bg: WebGL.BasicModelItem2D;

  black_key_fills: WebGL.BasicModel;
  white_key_lines: WebGL.BasicModel;

  black_key_lines: WebGL.BasicModel[];

  white_key_highlight_models: WebGL.BasicModel;
  active_white_keys: Map<Int32, Colour.ColourRGB>;

  constructor(){
    this.start_note = Note.Note.A;
    this.white_scale = 0.5;
    this.black_key_height_ratio = 0.5;
    this.black_key_fills = new WebGL.BasicModel();
    this.bg = WebGL.BasicModel.defaultItem();
    this.white_key_lines = new WebGL.BasicModel();
    this.black_key_lines = [];

    this.white_key_highlight_models = new WebGL.BasicModel();
    this.active_white_keys = new Map();

  }

  setWhiteKey(id: Int32){
    this.active_white_keys.set(id, Colour.ColourUtils.cyan());
  }
  removeActiveWhiteKey(id: Int32){
    this.active_white_keys.delete(id);
  }

  draw(vp: Matrix.TransformationMatrix3x3){
    console.log(this.bg);
    WebGL.BasicModel.drawItem(vp, this.bg);
    for(const [id, colour] of this.active_white_keys){
      console.log(colour);
      const model = this.white_key_highlight_models.parts[id];
      model.colour = colour;
      WebGL.BasicModel.drawItem(vp, model);
    }
    this.white_key_lines.draw(vp);
    this.black_key_fills.draw(vp);
    for(const line of this.black_key_lines){
      line.draw(vp);
    }
  }

  //keys: WebGL.BasicModel;
}

export class PianoModelGenerator{
  static modelTest(){
    const piano_model = PianoModelGenerator.generateModel(28, Note.Note.A);
    const vp = Matrix.TransformationMatrix3x3.orthographic(0, 1, 1, 0);
    //piano_model.model.draw(vp);
  }

  static modelTest2(){
    const piano_model = PianoModelGenerator.generateModel(28, Note.Note.A);
    const vp = Matrix.TransformationMatrix3x3.orthographic(0, 1, 1, 0);
    piano_model.draw(vp);
  }


  //model of piano with rects


  //model is size 1*1
  static generateModel(white_keys: Int32, starting_note: Note.Note, 
    black_key_height_ratio: Double=0.6, black_key_width_ratio: Double=0.7): BasePianoModel {
    const piano_model = new BasePianoModel();
    const model = new WebGL.BasicModel();
    //model is drawn in order also replace type with proper type
    const block = WebGL.WebGL.rectangleModel(0, 0, 1, 1);
    const white = Colour.ColourUtils.white();
    const black = Colour.ColourUtils.black();
    const grey = Colour.ColourUtils.fromRGB(0.5, 0.5, 0.5);
    const red = Colour.ColourUtils.red();
    const blue = Colour.ColourUtils.blue();
    const green = Colour.ColourUtils.green();
    //model.push({white, model: block});
    model.addPart({colour: white, transformation: block});
    piano_model.bg = {colour: white, transformation: block};
    piano_model.black_key_height_ratio = black_key_height_ratio;

    const white_scale = 1.0/white_keys;
    piano_model.white_scale = white_scale;

    const black_key_width = black_key_width_ratio*white_scale;
    const black_key_height = black_key_height_ratio;

    //vertical lines
    const line_scale = 0.20*white_scale;
    const half_line = line_scale*0.5;
    for(let i = 0; i < white_keys; i++){
      const x = i*white_scale - half_line;
      const line_model = WebGL.WebGL.rectangleModel(x, 0, line_scale, 1);
      const part = {colour: grey, transformation: line_model};
      model.addPart(part);
      piano_model.white_key_lines.addPart(part);

      //white key models (for active keys)
      const key_model = WebGL.WebGL.rectangleModel(x, 0, white_scale, 1);
      piano_model.white_key_highlight_models.addPart({colour: white, transformation: key_model});
    }
    const end_line_part = {colour: grey, transformation: WebGL.WebGL.rectangleModel(1 - half_line, 0, line_scale, 1)};
    piano_model.white_key_lines.addPart(end_line_part);

    const line = 0;

    //black keys
    for(let i = 0; i < white_keys; i++){
      const has_black_key = i !== 0 && Note.white_keys_with_black_keys[(i+starting_note.valueOf())%Note.white_keys_with_black_keys.length];
      if(has_black_key){
        //key fill
        const x = white_scale*i-(black_key_width/2);
        const b_key_model = WebGL.WebGL.rectangleModel(x, 0, black_key_width, black_key_height);
        const part = {colour: black, transformation: b_key_model};
        model.addPart(part);
        piano_model.black_key_fills.addPart(part);

        const black_line_model = new WebGL.BasicModel();
        //key border lines
        const vleft_key_model = WebGL.WebGL.rectangleModel(x-half_line, 0, line_scale, black_key_height);
        const vl_key_part = {colour: red, transformation: vleft_key_model};
        model.addPart(vl_key_part);
        black_line_model.addPart(vl_key_part);

        const vright_key_model = WebGL.WebGL.rectangleModel(x-half_line+black_key_width, 0, line_scale, black_key_height);
        const vr_key_part = {colour: blue, transformation: vright_key_model};
        model.addPart(vr_key_part);
        black_line_model.addPart(vr_key_part);

        // add line thickness for smooth border lines
        const vbot_key_model = WebGL.WebGL.rectangleModel(x-half_line, 0, black_key_width, line_scale);
        const vb_key_part = {colour: red, transformation: vbot_key_model};
        model.addPart(vb_key_part);
        black_line_model.addPart(vb_key_part);

        const vtop_key_model = WebGL.WebGL.rectangleModel(x-half_line, black_key_height, black_key_width, line_scale);
        const vt_key_part = {colour: red, transformation: vtop_key_model};
        model.addPart(vt_key_part);
        black_line_model.addPart(vt_key_part);

        piano_model.black_key_lines.push(black_line_model);
      }

    }

    //horizontal lines
    const top_line_model = WebGL.WebGL.rectangleModel(0, 0, 1, half_line);
    model.addPart({colour: red, transformation: top_line_model});
    const bot_line_model = WebGL.WebGL.rectangleModel(0, 1-half_line, 1, half_line);
    model.addPart({colour: red, transformation: bot_line_model});

    piano_model.setWhiteKey(2);
    
    return piano_model;
    //return {white_scale, model};
  }
}

export class StaticPianoRenderer{
  colour_shader: Shader.MVPColourProgram;
  vp: Matrix.TransformationMatrix3x3;
  constructor(width: number, height: number){
    this.vp = Matrix.TransformationMatrix3x3.orthographic(0, width, height, 0);
    this.colour_shader = new Shader.MVPColourProgram();
  }
  draw(props: StaticPianoDrawProps){
    const gl = WebGL.WebGL;
    if(gl == undefined) return;
    const is_left_right = props.orientation == "left" || props.orientation == "right";
    const block_width = is_left_right ? props.white_keys*props.key_width : props.key_height;
    const block_height = is_left_right ? props.key_height : props.white_keys*props.key_width;

    this.colour_shader.use();
    this.colour_shader.setColour(1, 1, 1);
    const block_model = gl.rectangleModel(props.x, props.y, block_width, block_height);
    this.colour_shader.setMvp(this.vp.multiplyCopy(block_model));
    Shapes.Quad.draw();

  }
}