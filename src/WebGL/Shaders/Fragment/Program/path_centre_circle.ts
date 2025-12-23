import PathCentreCircle from './../Source/path_centre_circle.frag?raw';
import * as Shader from './../../shader';

export class PathCentreCircleFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(PathCentreCircle)){
        console.log('PathCentreCircle: fragment source not added');
      }
    }
  }
}

export function PathCentreCircleShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class PathCentreCircle extends Base{
    private declare left_uniform_location: WebGLUniformLocation | null;
    private declare right_uniform_location: WebGLUniformLocation | null;
    private declare top_uniform_location: WebGLUniformLocation | null;
    private declare bot_uniform_location: WebGLUniformLocation | null;
    private declare circle_radius_uniform_location: WebGLUniformLocation | null;
    private declare size_uniform_location: WebGLUniformLocation | null;
    private declare colour_uniform_location: WebGLUniformLocation | null;
    private declare background_colour_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'PathCentreCircleShader';
      if(PathCentreCircleFragmentShader.shader){
        this.program.addFragment(PathCentreCircleFragmentShader.shader)
      }else{
        throw new Error(`${this.fragment_name} not loaded`);
      }
    }
    protected override addFragmentUniformLocations(): void{
      this.left_uniform_location = this.program.getUniformLocation('u_left');
      this.right_uniform_location = this.program.getUniformLocation('u_right');
      this.top_uniform_location = this.program.getUniformLocation('u_top');
      this.bot_uniform_location = this.program.getUniformLocation('u_bot');
      this.circle_radius_uniform_location = this.program.getUniformLocation('u_circle_radius');
      this.size_uniform_location = this.program.getUniformLocation('u_size');
      this.colour_uniform_location = this.program.getUniformLocation('u_colour');
      this.background_colour_uniform_location = this.program.getUniformLocation('u_background_colour');
    }
    setLeft(a: GLfloat){
      this.program.setFloat(this.left_uniform_location!, a);
    }
    setRight(a: GLfloat){
      this.program.setFloat(this.right_uniform_location!, a);
    }
    setTop(a: GLfloat){
      this.program.setFloat(this.top_uniform_location!, a);
    }
    setBot(a: GLfloat){
      this.program.setFloat(this.bot_uniform_location!, a);
    }
    setCircleRadius(a: GLfloat){
      this.program.setFloat(this.circle_radius_uniform_location!, a);
    }
    setSize(a: GLfloat){
      this.program.setFloat(this.size_uniform_location!, a);
    }
    setColour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.colour_uniform_location!, a, b, c);
    }
    setBackgroundColour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.background_colour_uniform_location!, a, b, c);
    }
  }
}
