import { loadVertexShaders } from "./Shaders/Vertex/vertex";
import { loadFragmentShaders } from "./Shaders/Fragment/fragment";
import type { ShaderProgram } from "./Shaders/shader";

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

  static rectangleModel(x: number, y: number, width: number, height: number): Matrix.TransformationMatrix3x3{
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
}


export default WebGL;