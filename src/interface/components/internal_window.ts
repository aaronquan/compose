import * as WebGL from "./../../WebGL/globals";

type Int32 = number;
type Float = number;

export class InternalWindow{
  x: Int32;
  y: Int32;
  header_height: Int32;
  width: Int32;
  height: Int32;
  hover_header: boolean;
  dragged_header: boolean;
  header_offset_x: Int32;
  header_offset_y: Int32;

  can_close: boolean;
  visible: boolean;
  constructor(x: Int32, y: Int32, width: Int32, height: Int32){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.header_height = 15;
    this.hover_header = false;
    this.dragged_header = false;
    this.header_offset_x = 0;
    this.header_offset_y = 0;
    this.can_close = true;
    this.visible = true;
  }
  getInternalY(): Int32{ // where the internal window starts
    return this.y+this.header_height;
  }
  isInsideHeader(pos: WebGL.Matrix.Point2D): boolean{
    const inside_x = this.x < pos.x && pos.x < this.x + this.width;
    const inside_y = this.y < pos.y && pos.y < this.y + this.header_height;
    return inside_x && inside_y;
  }
  isInsideClose(pos: WebGL.Matrix.Point2D): boolean{
    const inside_x = this.x+this.width-this.header_height < pos.x && pos.x < this.x+this.width;
    const inside_y = this.y < pos.y && pos.y < this.y + this.header_height;
    return inside_x && inside_y;
  }
  getWindowPosition(): WebGL.Matrix.Point2D{
    return new WebGL.Matrix.Point2D(this.x, this.y+this.header_height);
  }
  mouseMove(global_position: WebGL.Matrix.Point2D){
    if(!this.visible) return;
    this.hover_header = this.isInsideHeader(global_position);
    if(this.dragged_header){
      this.x = global_position.x + this.header_offset_x;
      this.y = global_position.y + this.header_offset_y;
    }
  }
  mouseDown(global_position: WebGL.Matrix.Point2D){
    if(this.isInsideClose(global_position)){
      this.visible = false;
    }
    if(this.hover_header){
      this.dragged_header = true;
      this.header_offset_x = this.x - global_position.x;
      this.header_offset_y = this.y - global_position.y;
    }
  }
  mouseUp(){
    this.dragged_header = false;
  }
  draw(vp: WebGL.Matrix.TransformationMatrix3x3, solid_shader: WebGL.Shader.MVPColourProgram){
    if(this.visible){
      //draw header
      solid_shader.use();
      const header_model = WebGL.WebGL.rectangleModel(this.x, this.y, this.width, this.header_height);
      solid_shader.setColourFromColourRGB(WebGL.Colour.ColourUtils.grey());
      solid_shader.setMvp(vp.multiplyCopy(header_model));
      WebGL.Shapes.Quad.draw();

      //window background
      const back_model = WebGL.WebGL.rectangleModel(this.x, this.y+this.header_height, this.width, this.height);
      solid_shader.setColourFromColourRGB(WebGL.Colour.ColourUtils.white());
      solid_shader.setMvp(vp.multiplyCopy(back_model));
      WebGL.Shapes.Quad.draw();

      //close header
      if(this.can_close){
        const close_model = WebGL.WebGL.rectangleModel(this.x+this.width-this.header_height, this.y, this.header_height, this.header_height);
        solid_shader.setColourFromColourRGB(WebGL.Colour.ColourUtils.grey(0.75));
        solid_shader.setMvp(vp.multiplyCopy(close_model));
        WebGL.Shapes.Quad.draw();
      }
    }
  } 

}