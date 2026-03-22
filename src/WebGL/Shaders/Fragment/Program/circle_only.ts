import CircleOnly from './../Source/circle_only.frag?raw';
import * as Shader from './../../shader';
import * as WebGL from './../../../globals';

export class CircleOnlyFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(CircleOnly)){
        console.log('CircleOnly: fragment source not added');
      }
    }
  }
}

export function CircleOnlyShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class CircleOnly extends Base{
    private declare centre_uniform_location: WebGLUniformLocation | null;
    private declare radius_uniform_location: WebGLUniformLocation | null;
    private declare circle_colour_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'CircleOnlyShader';
      if(!CircleOnlyFragmentShader.shader){
        CircleOnlyFragmentShader.load();
      }
      this.program.addFragment(CircleOnlyFragmentShader.shader!);
    }
    protected override addFragmentUniformLocations(): void{
      this.centre_uniform_location = this.program.getUniformLocation('u_centre');
      this.radius_uniform_location = this.program.getUniformLocation('u_radius');
      this.circle_colour_uniform_location = this.program.getUniformLocation('u_circle_colour');
    }
    setCentre(a: GLfloat, b: GLfloat){
      this.program.setFloat2(this.centre_uniform_location!, a, b);
    }
    setRadius(a: GLfloat){
      this.program.setFloat(this.radius_uniform_location!, a);
    }
    setCircleColour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.circle_colour_uniform_location!, a, b, c);
    }
    setCircleColourFromColourRGB(colour: WebGL.Colour.ColourRGB){
      this.program.setFloat3(this.circle_colour_uniform_location!, colour.red, colour.green, colour.blue);
    }
  }
}
