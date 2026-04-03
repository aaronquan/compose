import * as WebGL from "./../../WebGL/globals";

type Int32 = number;
type Float = number;
type VoidFunction = () => void;

export interface Point{
  x: Int32;
  y: Int32;
  equals:(p:Point) => boolean;
}

const SliderStateEnum = {
  Default: 0,
  Hovered: 1,
  Selected: 2
} as const;

type SliderState = (typeof SliderStateEnum)[keyof typeof SliderStateEnum];

export class HorizontalSlider{
  knob_radius: Float;
  slider_height: Float;
  slider_width: Float;
  x: Float; // left of knob radius with slider fully left
  y: Float; // top of knob radius with slider fully left
  value: Float; // between 0 and 1
  onChange: (val: Float) => void;
  state: SliderState;

  select_offset: Float;

  constructor(){

    this.knob_radius = 15;
    this.slider_height = 10;
    this.slider_width = 100;
    this.x = 200;
    this.y = 10;

    this.value = 0;

    this.onChange = (v) => {};
    this.state = SliderStateEnum.Default;

    this.select_offset = 0;
  }
  mouseDown(point: Point){
    if(this.state == SliderStateEnum.Hovered){
      this.state = SliderStateEnum.Selected;
      const center_knob = this.knobCenterX();
      this.select_offset = point.x - center_knob;
    }
  }
  pointInsideKnob(point: Point): boolean{
    //rectangle knob
    const knob_left = this.knobLeft();
    return knob_left <= point.x && point.x <= knob_left+this.knob_radius 
    && this.y <= point.y && point.y <= this.y+this.knob_radius;
  }
  mouseUp(point: Point){
    const mouse_in_knob = this.pointInsideKnob(point);
    if(mouse_in_knob){
      this.state = SliderStateEnum.Hovered;
    }else{
      this.state = SliderStateEnum.Default;
    }
  }
  sliderBarLeft(): Float{
    return this.x + (this.knob_radius*0.5); 
  }
  sliderBarTop(){
    return this.y + (this.knob_radius*0.5) - (this.slider_height*0.5);
  }
  knobLeft(): Float{
    return this.x + (this.value*this.slider_width);
  }
  knobCenterX(): Float{
    return this.knobLeft() + (this.knob_radius*0.5);
  }
  updateMouse(point: Point){
    //for rectangle knob
    const mouse_in_knob = this.pointInsideKnob(point);
    if(mouse_in_knob){
      if(this.state != SliderStateEnum.Selected){
        this.state = SliderStateEnum.Hovered;
      }
    }else{
      if(this.state != SliderStateEnum.Selected){
        this.state = SliderStateEnum.Default;
      }
    }

    if(this.state === SliderStateEnum.Selected){
      const slider_x = point.x - this.sliderBarLeft() - this.select_offset;
      if(slider_x < 0){
        this.value = 0;
      }else if(slider_x > this.slider_width){
        this.value = 1;
      }else{
        this.value = slider_x/this.slider_width;
      }
      this.onChange(this.value);
    }
  }
  draw(perspective: WebGL.Matrix.TransformationMatrix3x3, colour_shader: WebGL.Shader.MVPColourProgram){
    colour_shader.use();
    colour_shader.setColour(1, 1, 1);
    const slider_model = WebGL.WebGL.rectangleModel(this.sliderBarLeft(), this.sliderBarTop(), this.slider_width, this.slider_height);
    colour_shader.setMvp(perspective.multiplyCopy(slider_model));
    WebGL.Shapes.Quad.draw();

    //set knob colour to blue
    if(this.state === SliderStateEnum.Default){
      colour_shader.setColour(0, 0, 1);
    }else if(this.state === SliderStateEnum.Hovered){
      colour_shader.setColour(0, 1, 0);
    }else{
      colour_shader.setColour(1, 0, 0);
    }
    const knob_model = WebGL.WebGL.rectangleModel(this.knobLeft(), this.y, this.knob_radius, this.knob_radius);
    colour_shader.setMvp(perspective.multiplyCopy(knob_model));
    WebGL.Shapes.Quad.draw();
  }

}