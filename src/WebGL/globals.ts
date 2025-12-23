import { loadVertexShaders } from "./Shaders/Vertex/vertex";
import { loadFragmentShaders } from "./Shaders/Fragment/fragment";
import type { ShaderProgram } from "./Shaders/shader";
export class WebGL{
  static gl: WebGL2RenderingContext | null;
  static active_shader_program: ShaderProgram | null;
  //static buffer: WebGLBuffer | null; for testing
  static defaultError(){
    throw new Error("WebGL not initialised or null");
  }
  static initialise(canvas: HTMLCanvasElement){
    this.gl = canvas.getContext("webgl2", {alpha: false});
    if(this.gl){
      loadVertexShaders();
      loadFragmentShaders();
      //this.buffer = this.gl.createBuffer();
    }
  }
}


export default WebGL;