
type Float = number;
type Int32 = number;
export type ColourRGB = {
  red: Float;
  green: Float;
  blue: Float;
}

export type ColourRGBA = ColourRGB & {
  alpha: Float;
}

export class ColourUtils{
  static fromRGB(red: Float, green: Float, blue: Float): ColourRGB{
    return {red, green, blue};
  }
  static toRGBA(colour: ColourRGB, alpha: Float): ColourRGBA{
    return {...colour, alpha};
  }
  static black(): ColourRGB{
    return this.fromRGB(0, 0, 0);
  }
  static white(): ColourRGB{
    return this.fromRGB(1, 1, 1);
  }
  static red():ColourRGB{
    return this.fromRGB(1, 0, 0);
  }
  static green():ColourRGB{
    return this.fromRGB(0, 1, 0);
  }
  static blue():ColourRGB{
    return this.fromRGB(0, 0, 1);
  }
  static yellow():ColourRGB{
    return this.fromRGB(1, 1, 0);
  }
  static pink():ColourRGB{
    return this.fromRGB(1, 0, 1);
  }
  static cyan():ColourRGB{
    return this.fromRGB(0, 1, 1);
  }
  static grey(a: Float=0.5): ColourRGB{
    return this.fromRGB(a, a, a);
  }
  static linearTransitionColours(c1: ColourRGB, c2: ColourRGB, n: Int32): ColourRGB[]{
    const colours: ColourRGB[] = [];
    const step_r = (c2.red-c1.red)/(n+1);
    const step_g = (c2.green-c1.green)/(n+1);
    const step_b = (c2.blue-c1.blue)/(n+1);

    for(let i = 1; i <= n; i++){
      const col = ColourUtils.fromRGB(c1.red+step_r*i, c1.green+step_g*i, c1.blue+step_b*i);
      colours.push(col);
    }

    return colours;
  }
}