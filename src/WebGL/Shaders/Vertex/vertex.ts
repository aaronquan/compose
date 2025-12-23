import * as Shader from './../shader';
import * as Mvp2d from './Program/mvp2d';
import * as Transform2d from './Program/transform2d';

export function loadVertexShaders(){
  Mvp2d.Mvp2dVertexShader.load();
  Transform2d.Transform2dVertexShader.load();
}
export const Mvp2dMixin = Mvp2d.Mvp2dShaderProgramMix(Shader.ShaderProgramMixin);
export const Transform2dMixin = Transform2d.Transform2dShaderProgramMix(Shader.ShaderProgramMixin);
