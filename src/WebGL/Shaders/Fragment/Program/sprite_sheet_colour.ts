import SpriteSheetColour from './../Source/sprite_sheet_colour.frag?raw';
import * as Shader from './../../shader';
import * as WebGL from './../../../globals';

export class SpriteSheetColourFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(SpriteSheetColour)){
        console.log('SpriteSheetColour: fragment source not added');
      }
    }
  }
}

export function SpriteSheetColourShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class SpriteSheetColour extends Base{
    private declare texture_id_uniform_location: WebGLUniformLocation | null;
    private declare width_uniform_location: WebGLUniformLocation | null;
    private declare height_uniform_location: WebGLUniformLocation | null;
    private declare x_uniform_location: WebGLUniformLocation | null;
    private declare y_uniform_location: WebGLUniformLocation | null;
    private declare colour_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'SpriteSheetColourShader';
      if(!SpriteSheetColourFragmentShader.shader){
        SpriteSheetColourFragmentShader.load();
      }
      this.program.addFragment(SpriteSheetColourFragmentShader.shader!);
    }
    protected override addFragmentUniformLocations(): void{
      this.texture_id_uniform_location = this.program.getUniformLocation('u_texture_id');
      this.width_uniform_location = this.program.getUniformLocation('u_width');
      this.height_uniform_location = this.program.getUniformLocation('u_height');
      this.x_uniform_location = this.program.getUniformLocation('u_x');
      this.y_uniform_location = this.program.getUniformLocation('u_y');
      this.colour_uniform_location = this.program.getUniformLocation('u_colour');
    }
    setTextureId(i: GLint){
      this.program.setInt(this.texture_id_uniform_location!, i);
    }
    setWidth(a: GLfloat){
      this.program.setFloat(this.width_uniform_location!, a);
    }
    setHeight(a: GLfloat){
      this.program.setFloat(this.height_uniform_location!, a);
    }
    setX(a: GLfloat){
      this.program.setFloat(this.x_uniform_location!, a);
    }
    setY(a: GLfloat){
      this.program.setFloat(this.y_uniform_location!, a);
    }
    setColour(a: GLfloat, b: GLfloat, c: GLfloat){
      this.program.setFloat3(this.colour_uniform_location!, a, b, c);
    }
    setColourFromColourRGB(colour: WebGL.Colour.ColourRGB){
      this.program.setFloat3(this.colour_uniform_location!, colour.red, colour.green, colour.blue);
    }
  }
}
