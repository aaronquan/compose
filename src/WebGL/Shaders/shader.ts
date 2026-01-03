import WebGL from '../globals';
import { TransformationMatrix3x3 } from '../Matrix/matrix';
import * as Mixin from '../mixin';

class RawShader{
  shader: WebGLShader;
  has_source: boolean;
  constructor(type: GLenum){
    if(WebGL.gl){
      this.shader = WebGL.gl.createShader(type)!;
      this.has_source = false;
    }else{
      throw new Error("WebGL not initialised or null");
    }
  }
  addSource(source: string): boolean{
    if(this.has_source){
      console.log("Shader already has source");
      return false;
    }
    WebGL.gl!.shaderSource(this.shader, source);
    WebGL.gl!.compileShader(this.shader);
    const success = WebGL.gl!.getShaderParameter(this.shader, WebGL.gl!.COMPILE_STATUS);
    if(success){
      this.has_source = true;
      return true;
    }
    console.log(WebGL.gl!.getShaderInfoLog(this.shader));
    return false;
  }
}

export class VertexShader extends RawShader{
  constructor(){
    super(WebGL.gl!.VERTEX_SHADER);
  }
}

export class FragmentShader extends RawShader{
  constructor(){
    super(WebGL.gl!.FRAGMENT_SHADER);
  }
}

export class ShaderProgram{
  program: WebGLProgram;
  is_linked: boolean;
  has_vertex: boolean;
  has_fragment: boolean;

  constructor(){
    if(WebGL.gl){
      this.program = WebGL.gl.createProgram();
      this.is_linked = false;
      this.has_vertex = false;
      this.has_fragment = false;
    }else{
      throw new Error("WebGL not initialised or null");
    }
  }
  addVertex(vs: VertexShader){
    if(this.has_vertex){
      console.log("Already has vertex");
      return;
    }
    WebGL.gl!.attachShader(this.program, vs.shader);
    this.has_vertex = true;
  }

  addFragment(fs: FragmentShader){
    if(this.has_fragment){
        console.log("Already has fragment");
        return;
    }
    WebGL.gl!.attachShader(this.program, fs.shader);
    this.has_fragment = true;
  }

  use(){
    WebGL.gl!.useProgram(this.program);
  }
  link(): boolean{
    if(!this.is_linked){
      WebGL.gl!.linkProgram(this.program);
      const success = WebGL.gl!.getProgramParameter(this.program, WebGL.gl!.LINK_STATUS);
      if (success) {
        this.is_linked = true;
        return true;
      }
      console.log(WebGL.gl!.getProgramInfoLog(this.program));
    }
    return false;
  }

  getAttributeLocation(attr: string): GLint{
    return WebGL.gl!.getAttribLocation(this.program, attr);
  }
  getUniformLocation(uni_name: string): WebGLUniformLocation | null{
    return WebGL.gl!.getUniformLocation(this.program, uni_name);
  }
  setFloat(uni_location: WebGLUniformLocation, value: GLfloat){
    WebGL.gl!.uniform1f(uni_location, value);
  }
  setFloat2(uni_location: WebGLUniformLocation, f1: GLfloat, f2:GLfloat){
    WebGL.gl!.uniform2f(uni_location, f1, f2);
  }
  setFloat3(uni_location: WebGLUniformLocation, f1: GLfloat, f2:GLfloat, f3: GLfloat){
    WebGL.gl!.uniform3f(uni_location, f1, f2, f3);
  }
  setFloat4(uni_location: WebGLUniformLocation, f1: GLfloat, f2:GLfloat, f3: GLfloat, f4: GLfloat){
    WebGL.gl!.uniform4f(uni_location, f1, f2, f3, f4);
  }
  setInt(uni_location: WebGLUniformLocation, value: GLint){
    WebGL.gl!.uniform1i(uni_location, value);
  }
  setMat3(uni_location: WebGLUniformLocation, matrix: Float32Array){
    WebGL.gl!.uniformMatrix3fv(uni_location, false, matrix);
  }
  setMat4(uni_location: WebGLUniformLocation, matrix: Float32Array){
    WebGL.gl!.uniformMatrix4fv(uni_location, false, matrix);
  }
}

// custom shader for inheritance
export abstract class CustomShaderProgram{
  protected program: ShaderProgram;
  protected declare name: string;
  constructor(){
    this.program = new ShaderProgram();
  }
  use(){
    if(this.program.is_linked){
      this.program.use();
    }else{
      console.log(`Cannot use: ${this.name} is not linked`);
    }
  }

  link(){
    if(!this.program.is_linked){
      this.program.link();
    }
    this.addAttributeLocations();
    this.addUniformLocations();
  }
  abstract addAttributeLocations(): void;
  abstract addUniformLocations(): void;
}

// custom shader for mixins
export class ShaderProgramMixin{
  protected program: ShaderProgram;
  protected declare vertex_name: string;
  protected declare fragment_name: string;
  constructor(){
    this.program = new ShaderProgram();
    this.setup();
    this.link();
  }
  private setup(){
    this.setupVertex();
    this.setupFragment();
  }
  use(){
    if(this.program.is_linked){
      this.program.use();
    }else{
      throw new Error(`Cannot use: ${this.vertex_name} or ${this.fragment_name} is not linked`);
    }
  }

  private link(){
    if(!this.program.is_linked){
      this.program.link();
      this.addVertexAttributeLocations();
      this.addVertexUniformLocations();
      this.addFragmentUniformLocations();
    }
  }
  protected setupVertex(): void{
    throw new Error("Setup vertex needs to be overridden");
  }
  protected setupFragment(): void{
    throw new Error("Setup fragment needs to be overridden");
  }
  protected addVertexAttributeLocations(): void{
    throw new Error("Vertex attributes need to be overridden");
  };
  protected addVertexUniformLocations(): void{
    throw new Error("Vertex uniforms need to be overridden");
  };
  protected addFragmentUniformLocations(): void{
    throw new Error("Fragment uniforms need to be overridden");
  };
}

export type CustomShaderProgramable = Mixin.GConstructor<ShaderProgramMixin>