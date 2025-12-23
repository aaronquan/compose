import RectOutline from './../Source/rect_outline.frag?raw';
import * as Shader from './../../shader';

export class RectOutlineFragmentShader{
  static shader?: Shader.FragmentShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.FragmentShader();
      if(!this.shader.addSource(RectOutline)){
        console.log('RectOutline: fragment source not added');
      }
    }
  }
}

export function RectOutlineShaderProgramMix<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class RectOutline extends Base{
    private declare outline_colour_uniform_location: WebGLUniformLocation | null;
    private declare outline_ratio_uniform_location: WebGLUniformLocation | null;
    protected override setupFragment(){
      this.fragment_name = 'RectOutlineShader';
      if(RectOutlineFragmentShader.shader){
        this.program.addFragment(RectOutlineFragmentShader.shader)
      }else{
        throw new Error(`${this.fragment_name} not loaded`);
      }
    }
    protected override addFragmentUniformLocations(): void{
      this.outline_colour_uniform_location = this.program.getUniformLocation('u_outline_colour');
      this.outline_ratio_uniform_location = this.program.getUniformLocation('u_outline_ratio');
    }
    setOutline_colour(a: GLfloat, b: GLfloat, c: GLfloat, d: GLfloat){
      this.program.setFloat4(this.outline_colour_uniform_location!, a, b, c, d);
    }
    setOutline_ratio(a: GLfloat){
      this.program.setFloat(this.outline_ratio_uniform_location!, a);
    }
  }
}
