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

interface Button{
  mouseDown: VoidFunction;
  mouseUp: VoidFunction;
  updateMouse: (point: Point) => void;
}

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

export const ToggleButtonStateEnum = {
  Off: 0,
  On: 1,
  OffHovered: 2,
  OnHovered: 3,

} as const;

type ToggleButtonState = (typeof ToggleButtonStateEnum)[keyof typeof ToggleButtonStateEnum];

export class ToggleButton implements Button{
  x: Int32;
  y: Int32;
  off_text: string;
  on_text: string;
  text: string;
  width: Int32;
  height: Int32;
  text_size: Int32;
  state: ToggleButtonState;

  colours: Map<ToggleButtonState, WebGL.Colour.ColourRGB>;

  onToggleOn: VoidFunction;
  onToggleOff: VoidFunction;

  text_colour: WebGL.Colour.ColourRGB;

  constructor(x: Int32, y: Int32, w: Int32, h: Int32){
    this.off_text = "";
    this.on_text = "";
    this.text = "";
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.text_size = 15;
    this.state = ToggleButtonStateEnum.Off;

    this.colours = new Map();
    this.colours.set(ToggleButtonStateEnum.Off, WebGL.Colour.ColourUtils.pink());
    this.colours.set(ToggleButtonStateEnum.OffHovered, WebGL.Colour.ColourUtils.blue());
    this.colours.set(ToggleButtonStateEnum.On, WebGL.Colour.ColourUtils.cyan());
    this.colours.set(ToggleButtonStateEnum.OnHovered, WebGL.Colour.ColourUtils.green());

    this.onToggleOn = () => {};
    this.onToggleOff = () => {};
    this.text_colour = WebGL.Colour.ColourUtils.white();
  }
  private isInside(x: Int32, y: Int32): boolean{
    const sx = x - this.x;
    const sy = y - this.y;
    return 0 < sx && sx < this.width && 0 < sy && sy < this.height;
  }
  isOn(): boolean{
    return this.state === ToggleButtonStateEnum.On || this.state === ToggleButtonStateEnum.OnHovered;
  }
  isOff(): boolean{
    return this.state === ToggleButtonStateEnum.Off || this.state === ToggleButtonStateEnum.OffHovered;
  }
  updateMouse(point: Point){
    //console.log(point);
    if(this.isInside(point.x, point.y)){ 
      if(this.state === ToggleButtonStateEnum.Off){
        this.state = ToggleButtonStateEnum.OffHovered;
      }else if(this.state == ToggleButtonStateEnum.On){
        this.state = ToggleButtonStateEnum.OnHovered;
      }
    }else{
      if(this.state === ToggleButtonStateEnum.OffHovered){
        this.state = ToggleButtonStateEnum.Off;
      }else if(this.state === ToggleButtonStateEnum.OnHovered){
        this.state = ToggleButtonStateEnum.On;
      }
    }
  }
  mouseDown(){
    if(this.state === ToggleButtonStateEnum.OffHovered){
      this.state = ToggleButtonStateEnum.OnHovered;
      this.onToggleOn();
    }else if(this.state === ToggleButtonStateEnum.OnHovered){
      this.state = ToggleButtonStateEnum.OffHovered;
      this.onToggleOff();
    }
  }
  mouseUp(){
  }

  draw(vp: WebGL.Matrix.TransformationMatrix3x3, colour_shader: WebGL.Shader.MVPColourProgram, text_drawer: WebGL.TextDrawer){
    colour_shader.use();
    const transformation = WebGL.WebGL.rectangleModel(this.x, this.y, this.width, this.height);
    colour_shader.setMvp(vp.multiplyCopy(transformation));
    if(this.colours.has(this.state)){
      colour_shader.setColourFromColourRGB(this.colours.get(this.state)!);
    }
    WebGL.Shapes.Quad.draw();
    const text = this.isOn() ? this.on_text : this.off_text;
    if(text.length > 0){
      const text_width = this.text_size*text.length;
      const tx = this.x + (this.width/2) - (text_width/2);
      const ty = this.y + (this.height/2) - (this.text_size/2);
      text_drawer.drawTextColour(vp, tx, ty, text, this.text_size, this.text_colour);
    }
  }
}

export class ToggleButtonSet{
  buttons: ToggleButton[];
  constructor(){
    this.buttons = [];
  }
  addButton(b: ToggleButton){
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