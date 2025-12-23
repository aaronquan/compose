import Line from './../Source/line.frag?raw';
import * as Shader from './../../shader';

export class LineFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(Line)){
        console.log('Line: fragment source not added');
      }
    }
  }
}

export function LineShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Line extends Base{
    private declare thickness_uniform_location: WebGLUniformLocation | null;
    private declare equation_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'LineShader';
      if(LineFragmentShader.shader){
        this.program.addFragment(LineFragmentShader.shader)
      }else{
        throw new Error(`${this.fragment_name} not loaded`);
      }
    }
    protected override addFragmentUniformLocations(): void{
      this.thickness_uniform_location = this.program.getUniformLocation('u_thickness');
      this.equation_uniform_location = this.program.getUniformLocation('u_equation');
    }
    setThickness(a: GLfloat){
      this.program.setFloat(this.thickness_uniform_location!, a);
    }
    setEquation(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.equation_uniform_location!, a, b, c);
    }
  }
}
