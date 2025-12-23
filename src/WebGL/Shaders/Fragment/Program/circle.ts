import Circle from './../Source/circle.frag?raw';
import * as Shader from './../../shader';

export class CircleFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(Circle)){
        console.log('Circle: fragment source not added');
      }
    }
  }
}

export function CircleShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Circle extends Base{
    private declare centre_uniform_location: WebGLUniformLocation | null;
    private declare radius_uniform_location: WebGLUniformLocation | null;
    private declare circle_colour_uniform_location: WebGLUniformLocation | null;
    private declare background_colour_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'CircleShader';
      if(CircleFragmentShader.shader){
        this.program.addFragment(CircleFragmentShader.shader)
      }else{
        throw new Error(`${this.fragment_name} not loaded`);
      }
    }
    protected override addFragmentUniformLocations(): void{
      this.centre_uniform_location = this.program.getUniformLocation('u_centre');
      this.radius_uniform_location = this.program.getUniformLocation('u_radius');
      this.circle_colour_uniform_location = this.program.getUniformLocation('u_circle_colour');
      this.background_colour_uniform_location = this.program.getUniformLocation('u_background_colour');
    }
    setCentre(a: GLfloat, b: GLfloat){
      this.program.setFloat2(this.centre_uniform_location!, a, b);
    }
    setRadius(a: GLfloat){
      this.program.setFloat(this.radius_uniform_location!, a);
    }
    setCircle_colour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.circle_colour_uniform_location!, a, b, c);
    }
    setBackground_colour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.background_colour_uniform_location!, a, b, c);
    }
  }
}
