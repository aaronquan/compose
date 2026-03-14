
type Float = number;
export type ColourRGB = {
  red: Float;
  green: Float;
  blue: Float;
}


export class ColourUtils{
    static fromRGB(red: Float, green: Float, blue: Float): ColourRGB{
        return {red, green, blue};
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
}