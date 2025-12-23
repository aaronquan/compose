import Colour from './colour.frag?raw';
import Fragment from './fragment.frag?raw';
import BasicCircle from './circle.frag?raw';
import OutlineCircle from './circle_outline.frag?raw';
import OutlineRect from './rect_outline.frag?raw';
import SolidLine from './line.frag?raw';
import SolidPath from './solid_path.frag?raw';

export const colour = Colour;
export const simple = Fragment;
export const circle = BasicCircle;
export const circle_outline = OutlineCircle;
export const rect_outline = OutlineRect;
export const solid_line = SolidLine;
export const solid_path = SolidPath;