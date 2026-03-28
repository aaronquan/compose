import Colour from './../Source/colour.frag?raw';
import * as Shader from './../../shader';
import * as WebGL from './../../../globals';

export class ColourFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(Colour)){
        console.log('Colour: fragment source not added');
      }
    }
  }
}

export function ColourShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Colour extends Base{
    private declare colour_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'ColourShader';
      if(!ColourFragmentShader.shader){
        ColourFragmentShader.load();
      }
      this.program.addFragment(ColourFragmentShader.shader!);
    }
    protected override addFragmentUniformLocations(): void{
      this.colour_uniform_location = this.program.getUniformLocation('colour');
    }
    setColour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.colour_uniform_location!, a, b, c);
    }

    setColourFromColourRGB(colour: WebGL.Colour.ColourRGB){
      this.program.setFloat3(this.colour_uniform_location!, colour.red, colour.green, colour.blue);
    }

  }
}
