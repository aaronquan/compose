import { loadVertexShaders } from "./Shaders/Vertex/vertex";
import { loadFragmentShaders } from "./Shaders/Fragment/fragment";
import type { ShaderProgram } from "./Shaders/shader";
import * as Shader from "./Shaders/custom";

import * as Shapes from "./Shapes/Shapes"
import * as Matrix from "./Matrix/matrix";
import * as Line from "./Shapes/Line"

type Float = number;

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
    if(this.gl && !this.initialised){
      loadVertexShaders();
      loadFragmentShaders();
      this.initialised = true;
      //this.buffer = this.gl.createBuffer();
    }
  }

  static rectangleModel(x: Float, y: Float, width: number, height: number): Matrix.TransformationMatrix3x3{
    let model = Matrix.TransformationMatrix3x3.translate(x, y);
    model = model.multiplyCopy(Matrix.TransformationMatrix3x3.scale(width, height));
    return model;
  }
  static lineModel(x1: Float, y1: Float, x2: Float, y2: Float, lt: Float){
    const line = new Line.Line(x1, y1, x2, y2);

    let model = Matrix.TransformationMatrix3x3.identity();
    //let model = Matrix.TransformationMatrix3x3.translate(0.5, 0);
    //model = model.multiplyCopy(Matrix.TransformationMatrix3x3.rotate(line.angleInRadians()-Math.PI/2));
    model = model.multiplyCopy(Matrix.TransformationMatrix3x3.translate(x1, y1));
    model = model.multiplyCopy(Matrix.TransformationMatrix3x3.rotate(line.angleInRadians()));
    model = model.multiplyCopy(Matrix.TransformationMatrix3x3.scale(line.length(), lt));
    model = model.multiplyCopy(Matrix.TransformationMatrix3x3.translate(0.5, 0));
    
    return model;
  }

  //static drawBasicModel(tm: Matrix.TransformationMatrix3x3): BasicModelItem[]{

  //}
}

type BasicModelType = "Rect" | "Line";

class BasicModel{
  static colour_shader: Shader.MVPColourProgram;


  static init(){
    this.colour_shader = new Shader.MVPColourProgram();
  }

  parts: Matrix.TransformationMatrix3x3[];
  constructor(){
    this.parts = [];
  }
  addPart(part: Matrix.TransformationMatrix3x3){
    this.parts.push(part);
  }
  draw(p: Matrix.TransformationMatrix3x3){
    const shader = BasicModel.colour_shader;
    shader.use();
    shader.setColour(1, 1, 1);
    for(const model of this.parts){
      shader.setMvp(p.multiplyCopy(model));
      //shader.setMvp(model.multiplyCopy(p));
      Shapes.Quad.drawRelative();
    }
  }
}

export type ModelItem = {
  colour: {r: Float, g: Float, b: Float};
  model: Matrix.TransformationMatrix3x3;
}

class BasicModelItem{
  type: BasicModelType;
  model: Matrix.TransformationMatrix3x3;
  constructor(type: BasicModelType, model: Matrix.TransformationMatrix3x3){
    this.type = type;
    this.model = model;
  }
  getModel(){
    switch(this.type){
      case "Rect":

      case "Line":
        
    }
  }
  draw(tm: Matrix.TransformationMatrix3x3){

    const m = this.model.multiplyCopy(tm);

  }
}

export function testBasicModel(){
  const pers = Matrix.TransformationMatrix3x3.orthographic(0, 10, 10, 0);
  const view = Matrix.TransformationMatrix3x3.identity();
  view.multiply(Matrix.TransformationMatrix3x3.translate(1, 1));

  const vp = pers.multiplyCopy(view);
  const s1 = WebGL.rectangleModel(0, 0, 5, 5);
  const s2 = WebGL.rectangleModel(5, 5, 5, 5);
  console.log(vp);
  const bm = new BasicModel();
  BasicModel.init();
  bm.addPart(s1);
  bm.addPart(s2);
  bm.draw(vp);
  //Shapes.Quad.draw();
}

export default WebGL;