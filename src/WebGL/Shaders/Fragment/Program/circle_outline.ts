import CircleOutline from './../Source/circle_outline.frag?raw';
import * as Shader from './../../shader';

export class CircleOutlineFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(CircleOutline)){
        console.log('CircleOutline: fragment source not added');
      }
    }
  }
}

export function CircleOutlineShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class CircleOutline extends Base{
    private declare centre_uniform_location: WebGLUniformLocation | null;
    private declare radius_uniform_location: WebGLUniformLocation | null;
    private declare outline_radius_uniform_location: WebGLUniformLocation | null;
    private declare outline_colour_uniform_location: WebGLUniformLocation | null;
    private declare background_colour_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'CircleOutlineShader';
      if(CircleOutlineFragmentShader.shader){
        this.program.addFragment(CircleOutlineFragmentShader.shader)
      }else{
        throw new Error(`${this.fragment_name} not loaded`);
      }
    }
    protected override addFragmentUniformLocations(): void{
      this.centre_uniform_location = this.program.getUniformLocation('u_centre');
      this.radius_uniform_location = this.program.getUniformLocation('u_radius');
      this.outline_radius_uniform_location = this.program.getUniformLocation('u_outline_radius');
      this.outline_colour_uniform_location = this.program.getUniformLocation('u_outline_colour');
      this.background_colour_uniform_location = this.program.getUniformLocation('u_background_colour');
    }
    setCentre(a: GLfloat, b: GLfloat){
      this.program.setFloat2(this.centre_uniform_location!, a, b);
    }
    setRadius(a: GLfloat){
      this.program.setFloat(this.radius_uniform_location!, a);
    }
    setOutlineRadius(a: GLfloat){
      this.program.setFloat(this.outline_radius_uniform_location!, a);
    }
    setOutlineColour(a: GLfloat, b: GLfloat, c: GLfloat, d: GLfloat){
      this.program.setFloat4(this.outline_colour_uniform_location!, a, b, c, d);
    }
    setBackgroundColour(a: GLfloat, b: GLfloat, c: GLfloat, d: GLfloat){
      this.program.setFloat4(this.background_colour_uniform_location!, a, b, c, d);
    }
  }
}
