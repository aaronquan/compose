import {expect, test} from 'vitest';
import * as Colour from './colour';

test("colour", () => {
  const c1 = Colour.ColourUtils.fromRGB(0.2, 0.5, 0.1);
  const c2 = Colour.ColourUtils.fromRGB(1, 1, 1);

  const lt = Colour.ColourUtils.linearTransitionColours(c1, c2, 5);
  console.log(lt);
});