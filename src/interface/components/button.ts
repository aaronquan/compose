import * as WebGL from "./../../WebGL/globals";

type Int32 = number;
type Float = number;
type VoidFunction = () => void;
const EmptyFunction = () => {};

export interface Point{
  x: Int32;
  y: Int32;
  equals:(p:Point) => boolean;
}

export const ButtonStateEnum = {
  Off: 0,
  Disabled: 1,
  Hovered: 2,
  Pressed: 3,
  PressedHovered: 4,
  Selected: 5,
} as const;



export type ButtonState = (typeof ButtonStateEnum)[keyof typeof ButtonStateEnum];

export class BasicButton{
  x: Int32;
  y: Int32;
  text: string;
  width: Int32;
  height: Int32;
  text_size: Int32;

  state: ButtonState;

  colours: Map<ButtonState, WebGL.Colour.ColourRGB>;
  text_colour: WebGL.Colour.ColourRGB;
  onHoveredOver: VoidFunction;
  onHoveredOut: VoidFunction;
  onPressed: VoidFunction;
  onPressedOut: VoidFunction;

  constructor(x: Int32, y: Int32, w: Int32, h: Int32){
    this.text = "";
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.text_size = 13;
    this.state = ButtonStateEnum.Off;
    this.colours = new Map();
    this.colours.set(ButtonStateEnum.Off, WebGL.Colour.ColourUtils.blue());
    this.colours.set(ButtonStateEnum.Hovered, WebGL.Colour.ColourUtils.red());
    this.colours.set(ButtonStateEnum.Pressed, WebGL.Colour.ColourUtils.green());
    this.colours.set(ButtonStateEnum.PressedHovered, WebGL.Colour.ColourUtils.cyan());
    this.text_colour = WebGL.Colour.ColourUtils.white();
    this.onHoveredOver = EmptyFunction;
    this.onHoveredOut = EmptyFunction;
    this.onPressed = EmptyFunction;
    this.onPressedOut = EmptyFunction;
  }
  setTextColour(colour: WebGL.Colour.ColourRGB){

  }
  setButtonColour(){

  }
  private isInside(x: Int32, y: Int32): boolean{
    const sx = x - this.x;
    const sy = y - this.y;
    return 0 < sx && sx < this.width && 0 < sy && sy < this.height;
  }
  mouseDown(){
    if(this.state == ButtonStateEnum.Hovered){
      this.state = ButtonStateEnum.PressedHovered;
      this.onPressed();
    }
  }
  mouseUp(){
    if(this.state === ButtonStateEnum.Pressed){
      this.state = ButtonStateEnum.Off;
      this.onPressedOut();
    }else if(this.state === ButtonStateEnum.PressedHovered){
      this.state = ButtonStateEnum.Hovered;
      this.onPressedOut();
    }
  }
  updateMouse(point: Point){
    if(this.isInside(point.x, point.y)){
      if(this.state == ButtonStateEnum.Off){
        this.state = ButtonStateEnum.Hovered;
      }else if(this.state == ButtonStateEnum.Pressed){
        this.state = ButtonStateEnum.PressedHovered;
      }
      this.onHoveredOver();
    }else{
      if(this.state === ButtonStateEnum.Hovered){
        this.state = ButtonStateEnum.Off;
      }else if(this.state === ButtonStateEnum.PressedHovered){
        this.state = ButtonStateEnum.Pressed;
      }
      this.onHoveredOut();
    }
  }
  draw(vp: WebGL.Matrix.TransformationMatrix3x3, colour_shader: WebGL.Shader.MVPColourProgram, text_drawer: WebGL.TextDrawer){
    colour_shader.use();
    const transformation = WebGL.WebGL.rectangleModel(this.x, this.y, this.width, this.height);
    colour_shader.setMvp(vp.multiplyCopy(transformation));
    if(this.colours.has(this.state)){
      colour_shader.setColourFromColourRGB(this.colours.get(this.state)!);
    }
    WebGL.Shapes.Quad.draw();

    if(this.text.length > 0){
      const text_width = this.text_size*this.text.length;
      const tx = this.x + (this.width/2) - (text_width/2);
      const ty = this.y + (this.height/2) - (this.text_size/2);
      text_drawer.drawTextColour(vp, tx, ty, this.text, this.text_size, this.text_colour);
    }
  }
}

export class ButtonSet{
  buttons: BasicButton[];
  constructor(){
    this.buttons = [];
  }
  addButton(b: BasicButton){
    this.buttons.push(b);
  }
  updateMouse(pt: Point){
    for(const button of this.buttons){
      button.updateMouse(pt);
    }
  }
  mouseDown(){
    for(const button of this.buttons){
      button.mouseDown();
    }
  }
  mouseUp(){
    for(const button of this.buttons){
      button.mouseUp();
    }
  }
  draw(vp: WebGL.Matrix.TransformationMatrix3x3, colour_shader: WebGL.Shader.MVPColourProgram, text_drawer: WebGL.TextDrawer){
    for(const button of this.buttons){
      button.draw(vp, colour_shader, text_drawer);
    }
  }
}