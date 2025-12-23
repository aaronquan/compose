import * as Shader from './../shader';
import * as Circle from './Program/circle';
import * as CircleOutline from './Program/circle_outline';
import * as Colour from './Program/colour';
import * as Line from './Program/line';
import * as PathCentreCircle from './Program/path_centre_circle';
import * as RectOutline from './Program/rect_outline';
import * as SolidPath from './Program/solid_path';

export function loadFragmentShaders(){
  Circle.CircleFragmentShader.load();
  CircleOutline.CircleOutlineFragmentShader.load();
  Colour.ColourFragmentShader.load();
  Line.LineFragmentShader.load();
  PathCentreCircle.PathCentreCircleFragmentShader.load();
  RectOutline.RectOutlineFragmentShader.load();
  SolidPath.SolidPathFragmentShader.load();
}
export const CircleMixin = Circle.CircleShaderProgramMix;
export const CircleOutlineMixin = CircleOutline.CircleOutlineShaderProgramMix;
export const ColourMixin = Colour.ColourShaderProgramMix;
export const LineMixin = Line.LineShaderProgramMix;
export const PathCentreCircleMixin = PathCentreCircle.PathCentreCircleShaderProgramMix;
export const RectOutlineMixin = RectOutline.RectOutlineShaderProgramMix;
export const SolidPathMixin = SolidPath.SolidPathShaderProgramMix;
