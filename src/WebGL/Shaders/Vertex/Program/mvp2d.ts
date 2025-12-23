import Mvp2d from './../Source/mvp2d.vert?raw';
import * as Matrix from './../../../Matrix/matrix';
import * as Shader from './../../shader';

export class Mvp2dVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(Mvp2d)){
        console.log('Mvp2d: vertex source not added');
      }
    }
  }
}

export function Mvp2dShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Mvp2d extends Base{
    private declare position_attribute_location: GLint | null;
    private declare relative_attribute_location: GLint | null;
    private declare mvp_uniform_location: WebGLUniformLocation | null;
    protected override setupVertex(){
      this.vertex_name = 'Mvp2dShader';
      if(Mvp2dVertexShader.shader){
        this.program.addVertex(Mvp2dVertexShader.shader)
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    protected override addVertexAttributeLocations(): void{
      this.position_attribute_location = this.program.getAttributeLocation('a_position');
      this.relative_attribute_location = this.program.getAttributeLocation('a_relative');
    }
    protected override addVertexUniformLocations(): void{
      this.mvp_uniform_location = this.program.getUniformLocation('u_mvp');
    }
    setMvp(mat: Matrix.Matrix3x3){
      this.program.setMat3(this.mvp_uniform_location!, mat.matrix);
    }
  }
}
