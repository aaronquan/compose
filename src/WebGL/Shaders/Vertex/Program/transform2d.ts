import Transform2d from './../Source/transform2d.vert?raw';
import * as Matrix from './../../../Matrix/matrix';
import * as Shader from './../../shader';

export class Transform2dVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(Transform2d)){
        console.log('Transform2d: vertex source not added');
      }
    }
  }
}

export function Transform2dShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Transform2d extends Base{
    private declare position_attribute_location: GLint | null;
    private declare matrix_uniform_location: WebGLUniformLocation | null;
    protected override setupVertex(){
      this.vertex_name = 'Transform2dShader';
      if(Transform2dVertexShader.shader){
        this.program.addVertex(Transform2dVertexShader.shader)
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    protected override addVertexAttributeLocations(): void{
      this.position_attribute_location = this.program.getAttributeLocation('position');
    }
    protected override addVertexUniformLocations(): void{
      this.matrix_uniform_location = this.program.getUniformLocation('u_matrix');
    }
    setMatrix(mat: Matrix.Matrix3x3){
      this.program.setMat3(this.matrix_uniform_location!, mat.matrix);
    }
  }
}
