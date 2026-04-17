import * as WebGL from "./../../WebGL/globals";

type Int32 = number;
type Float = number;

export class TextGlobals{
  static selected_text = undefined;
  static cursor_on: boolean = false;
  static cursor_milliseconds_interval: Float = 500;
  static current_cursor_milliseconds: Float = 0;

  static update(time_elapsed: Float){
    this.current_cursor_milliseconds += time_elapsed;
    if(this.current_cursor_milliseconds > this.cursor_milliseconds_interval){
      this.current_cursor_milliseconds -= this.cursor_milliseconds_interval;
      this.cursor_on = !this.cursor_on;
    }
  }
}

const TextStatusEnum = {
  Deselected: 0,
  Selected: 1
} as const;

type TextStatus = (typeof TextStatusEnum)[keyof typeof TextStatusEnum];

export class TextInput{
  x: Int32;
  y: Int32;
  width: Int32;
  height: Int32;

  background_colour: WebGL.Colour.ColourRGB;
  text_colour: WebGL.Colour.ColourRGB;
  cursor_colour: WebGL.Colour.ColourRGB;

  text: string;

  text_offset: Int32;

  text_size: Int32;

  state: TextStatus;

  cursor_thickness: Int32;
  cursor_index: Int32;

  onChange: (text: string) => void;

  constructor(x: Int32, y: Int32, width: Int32, height: Int32, ts: Int32=height-2){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.text_offset = 2;

    this.text_size = ts;

    this.background_colour = WebGL.Colour.ColourUtils.white();
    this.text_colour = WebGL.Colour.ColourUtils.black();
    this.cursor_colour = WebGL.Colour.ColourUtils.blue();
    
    this.text = "";

    this.state = TextStatusEnum.Deselected;

    this.cursor_thickness = 1;
    this.cursor_index = 0;
    this.onChange = (_) => {};
  }
  isInside(point: WebGL.Matrix.Point2D): boolean{
    const in_x = this.x < point.x && point.x < this.x+this.width;
    const in_y = this.y < point.y && point.y < this.y+this.height;
    return in_x && in_y;
  }
  onKeyDown(ev: KeyboardEvent){
    if(this.state == TextStatusEnum.Selected){
      if(ev.key.length == 1){
        this.text = this.text.slice(0, this.cursor_index) + ev.key + this.text.slice(this.cursor_index);
        this.cursor_index++;
        this.onChange(this.text);
      }else if(ev.key === "Backspace"){
        if(this.cursor_index > 0){
          this.text = this.text.slice(0, this.cursor_index-1) + this.text.slice(this.cursor_index);
          this.cursor_index--;
          this.onChange(this.text);
        }
      }
    }
  }
  cursorIndexFromX(x: Float): Int32{
    const fl = (x-(this.x+this.text_offset))/this.text_size;
    const i = Math.round(fl);
    return i > this.text.length ? this.text.length : i;
  }
  onMouseMove(point: WebGL.Matrix.Point2D){

  }
  onMouseDown(point: WebGL.Matrix.Point2D){
    if(this.isInside(point)){
      this.state = TextStatusEnum.Selected;
      const index = this.cursorIndexFromX(point.x);
      console.log(index)
      this.cursor_index = index;
    }else{
      this.state = TextStatusEnum.Deselected;
    }
  }
  onMouseUp(){

  }

  draw(vp: WebGL.Matrix.TransformationMatrix3x3, 
    colour_shader: WebGL.Shader.MVPColourProgram, 
    text_drawer: WebGL.TextDrawer){
      //draw background
      colour_shader.use();
      colour_shader.setColourFromColourRGB(this.background_colour);
      const background_model = WebGL.WebGL.rectangleModel(this.x, this.y, this.width, this.height);
      colour_shader.setMvp(vp.multiplyCopy(background_model));
      WebGL.Shapes.Quad.draw();

      const text_height_diff = this.height - this.text_size;

      const y = this.y + (text_height_diff*0.5);

      //text cursor
      if(TextGlobals.cursor_on && this.state == TextStatusEnum.Selected){
        colour_shader.setColourFromColourRGB(this.cursor_colour);
        const cursor_model = WebGL.WebGL.rectangleModel(
          this.x+this.text_offset-this.cursor_thickness+(this.text_size*this.cursor_index),
          y, this.cursor_thickness, this.text_size
        );
        colour_shader.setMvp(vp.multiplyCopy(cursor_model));
        WebGL.Shapes.Quad.draw();
      }

      //draw text
      text_drawer.drawTextColour(vp, this.x+this.text_offset, y, this.text, this.text_size, this.text_colour);
  }
}