import SpriteSheet from './../Source/sprite_sheet.frag?raw';
import * as Shader from './../../shader';

export class SpriteSheetFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(SpriteSheet)){
        console.log('SpriteSheet: fragment source not added');
      }
    }
  }
}

export function SpriteSheetShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class SpriteSheet extends Base{
    private declare texture_id_uniform_location: WebGLUniformLocation | null;
    private declare width_uniform_location: WebGLUniformLocation | null;
    private declare height_uniform_location: WebGLUniformLocation | null;
    private declare x_uniform_location: WebGLUniformLocation | null;
    private declare y_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'SpriteSheetShader';
      if(!SpriteSheetFragmentShader.shader){
        SpriteSheetFragmentShader.load();
      }
      this.program.addFragment(SpriteSheetFragmentShader.shader!);
    }
    protected override addFragmentUniformLocations(): void{
      this.texture_id_uniform_location = this.program.getUniformLocation('u_texture_id');
      this.width_uniform_location = this.program.getUniformLocation('u_width');
      this.height_uniform_location = this.program.getUniformLocation('u_height');
      this.x_uniform_location = this.program.getUniformLocation('u_x');
      this.y_uniform_location = this.program.getUniformLocation('u_y');
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
  }
}
