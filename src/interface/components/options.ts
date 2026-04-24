
import * as WebGL from "./../../WebGL/globals";
import * as ArrayUtils from "./../../utils/array";

type Int32 = number;

export class SingleSelectOptions{
  selected: Int32;
  options: string[];
  x: Int32;
  y: Int32;
  width: Int32;
  height: Int32;
  text_size: Int32;
  padding: Int32;

  background_colour: WebGL.Colour.ColourRGB;
  text_colour: WebGL.Colour.ColourRGB;
  selected_colour: WebGL.Colour.ColourRGB;

  hover_colour: WebGL.Colour.ColourRGB;

  mouse_over_option: Int32 | undefined;

  onSelected: (id: Int32, opt: string) => void;

  private dividers: Int32[];
  constructor(options: string[], x: Int32, y: Int32, height: Int32){
    this.selected = 0;
    this.x = x;
    this.y = y;
    //this.width = 40;
    this.height = height;
    this.text_size = 10;
    this.padding = 3;

    this.options = options;

    const n_chars = this.options.reduce((pv, cv) => {
      return pv + cv.length;
    }, 0);

    this.width = (this.text_size*n_chars)+(this.padding*(this.options.length+1));
    this.dividers = this.generateDividers(this.options, this.text_size);

    this.background_colour = WebGL.Colour.ColourUtils.white();
    this.text_colour = WebGL.Colour.ColourUtils.black();
    this.selected_colour = WebGL.Colour.ColourUtils.pink();
    this.hover_colour = WebGL.Colour.ColourUtils.grey();

    this.mouse_over_option = undefined;

    this.onSelected = () => {};
  }
  generateDividers(opts: string[], ts: Int32): Int32[]{
    const divs: Int32[] = [];
    let curr = 0;
    for(const s of opts){
      divs.push(curr);
      curr += s.length*ts + this.padding;
    }
    return divs;
  }

  isInside(point: WebGL.Matrix.Point2D): boolean{
    return this.x < point.x && point.x < this.x + this.width && this.y < point.y && point.y < this.y+this.height;
  }

  onMouseDown(){
    if(this.mouse_over_option != undefined){
      this.selected = this.mouse_over_option;
      this.onSelected(this.selected, this.options[this.selected]);
    }
  }
  onMouseUp(){

  }

  onMouseMove(point: WebGL.Matrix.Point2D){
    if(this.isInside(point)){
      const x = point.x - this.x;
      // calculates dividors with padding on left (i.e. furtherest dividing line left)
      this.mouse_over_option = ArrayUtils.binarySearchLowerBound(this.dividers, (t) => x-t);
    }else{
      this.mouse_over_option = undefined;
    }
  }

  draw(vp: WebGL.Matrix.TransformationMatrix3x3, colour_shader: WebGL.Shader.MVPColourProgram, text_drawer: WebGL.TextDrawer){
    const n_chars = this.options.reduce((pv, cv) => {
      return pv + cv.length;
    }, 0);
    const padding = this.padding;
    const width = (this.width);

    //background
    colour_shader.use();
    colour_shader.setColourFromColourRGB(this.background_colour);
    const background_model = WebGL.WebGL.rectangleModel(this.x, this.y, width, this.height);
    colour_shader.setMvp(vp.multiplyCopy(background_model));
    WebGL.Shapes.Quad.draw();

    //mouse over
    if(this.mouse_over_option != undefined){
      colour_shader.setColourFromColourRGB(this.hover_colour);
      const opt_width = text_drawer.getTextWidth(this.options[this.mouse_over_option], this.text_size)+padding;
      const mouse_over_model = WebGL.WebGL.rectangleModel(this.x+this.dividers[this.mouse_over_option], this.y, opt_width, this.height);
      colour_shader.setMvp(vp.multiplyCopy(mouse_over_model));
      WebGL.Shapes.Quad.draw();
    }

    //selected
    colour_shader.setColourFromColourRGB(this.selected_colour);
    const opt_width = text_drawer.getTextWidth(this.options[this.selected], this.text_size)+padding;
    const selected_model = WebGL.WebGL.rectangleModel(this.x+this.dividers[this.selected], this.y, opt_width, this.height);
    colour_shader.setMvp(vp.multiplyCopy(selected_model));
    WebGL.Shapes.Quad.draw();

    let offset = this.x+this.padding;
    const text_y = this.y+(this.height-this.text_size)*0.5;
    const border_thickness = 3;
    for(const str of this.options){
      //draw text
      const text_width = text_drawer.getTextWidth(str, this.text_size);
      text_drawer.drawTextColour(vp, offset, text_y, str, this.text_size, this.text_colour);

      //draw divider lines

      const line_model = WebGL.WebGL.rectangleModel(offset-this.padding, this.y, border_thickness, this.height);
      colour_shader.use();
      colour_shader.setColourFromColourRGB(this.text_colour);
      colour_shader.setMvp(vp.multiplyCopy(line_model));
      WebGL.Shapes.Quad.draw();
      
      offset += this.padding+text_width;
    }
    //last line
    const line_model = WebGL.WebGL.rectangleModel(offset-this.padding, this.y, border_thickness, this.height);
    colour_shader.use();
    colour_shader.setColourFromColourRGB(this.text_colour);
    colour_shader.setMvp(vp.multiplyCopy(line_model));
    WebGL.Shapes.Quad.draw();

    //top and bottom
    const top_model = WebGL.WebGL.rectangleModel(this.x, this.y, this.width, border_thickness);
    colour_shader.setMvp(vp.multiplyCopy(top_model));
    WebGL.Shapes.Quad.draw();

    const bot_model = WebGL.WebGL.rectangleModel(this.x, this.y+this.height, this.width, border_thickness);
    colour_shader.setMvp(vp.multiplyCopy(bot_model));
    WebGL.Shapes.Quad.draw();
  }
}