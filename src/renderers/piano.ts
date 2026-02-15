import { PianoDrawProps, VisualNoteFind } from "../interface/PianoView";
import * as WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";
import * as Note from "../compose/note";

export type PianoDrawInteractiveProps = PianoDrawProps & {
  mouse_down: VisualNoteFind | null;
  mouse_over: VisualNoteFind | null;
}

export class PianoState{
  mouse_down: VisualNoteFind | null;
  mouse_over: VisualNoteFind | null;
  constructor(){
    this.mouse_down = null;
    this.mouse_over = null;
  }
}

export class PianoRenderer{
  colour_shader: Shader.MVPColourProgram;
  vp: Matrix.TransformationMatrix3x3;
  constructor(width: number, height: number){
    this.colour_shader = new Shader.MVPColourProgram();
    this.vp = Matrix.TransformationMatrix3x3.orthographic(0, width, height, 0);
  }
  draw(props: PianoDrawInteractiveProps, piano_state: PianoState){
    const gl = WebGL.WebGL;
    const shader = new Shader.MVPColourProgram();
    const vp = this.vp;

    //white key block
    const block_width = props.key_width*props.white_keys;
    const block_height = props.key_height;
    const w_block_model = Matrix.TransformationMatrix3x3.scale(block_width, block_height);
    const mvp = vp.multiplyCopy(w_block_model);
    shader.use();
    shader.setMvp(mvp);
    shader.setColour(1.0, 1.0, 1.0);
    Shapes.Quad.draw();

    //const mo = props.mouse_over;
    const mo = piano_state.mouse_over;
    const md = piano_state.mouse_down;

    //draw white key hovers
    if(md && !md.visual_note.is_black){
      const x = props.key_width*md.visual_note.id;
      shader.setColour(0, 1, 0);
      const model = gl.rectangleModel(x, 0, props.key_width, props.key_height);
      shader.setMvp(vp.multiplyCopy(model));
      Shapes.Quad.draw();
    }else if(mo && !mo.visual_note.is_black){
      const x = mo.visual_note.id*props.key_width;
      shader.setColour(1, 0, 0);
      const model = gl.rectangleModel(x, 0, props.key_width, props.key_height);
      shader.setMvp(vp.multiplyCopy(model));
      Shapes.Quad.draw();
    }

    //midi white keys
    shader.setColour(0, 1, 0);
    for(let i = 0; i < props.white_keys; i++){
      if(props.white_notes_down[i]){
        const x = props.key_width*i;
        const model = gl.rectangleModel(x, 0, props.key_width, props.key_height);
        shader.setMvp(vp.multiplyCopy(model));
        Shapes.Quad.draw();
      }
    }

    const line_thickness = 2;
    const half_line_thickness = line_thickness/2;

    //white lines 
    shader.setColour(1, 0, 0);
    for(let i = 1; i < props.white_keys; i++){
        const x = props.key_width*i-half_line_thickness;
        const model = gl.rectangleModel(x, 0, line_thickness, props.key_height);
        shader.setMvp(vp.multiplyCopy(model));
        Shapes.Quad.draw();
    }

    //draw black keys
    const black_key_height = props.black_key_height_ratio*props.key_height;
    const black_key_width = props.black_key_width_ratio*props.key_width;

    shader.setColour(0,0,0);
    for(let i = 0; i < props.white_keys; i++){
      const has_black_key = i !== 0 && Note.black_keys[(i+(props.starting_note ? props.starting_note.valueOf() : 0))%Note.black_keys.length];
      if(has_black_key){
        if(props.mouse_down && props.mouse_down.visual_note.id == i && props.mouse_down.visual_note.is_black){
          shader.setColour(0, 1, 0);
        }else if(props.black_notes_down[i] || 
          (props.mouse_over && props.mouse_over.visual_note.id == i && props.mouse_over.visual_note.is_black)){
          shader.setColour(1, 0, 0);
        }else{
          shader.setColour(0, 0, 0);
        }
        const x = i*props.key_width-(black_key_width/2);
        const model = gl.rectangleModel(x, 0, black_key_width, black_key_height);
        shader.setMvp(vp.multiplyCopy(model));
        Shapes.Quad.draw();
      }
    }

    requestAnimationFrame(() => this.draw(props, piano_state));
  }

}

type Int32 = number;
type Double = number;


//black keys are facing direction
export type PianoOrientation = "left" | "up" | "right" | "down";


type StaticPianoDrawProps = {
  x: Int32;
  y: Int32;
  white_keys: Int32;
  key_width: Int32;
  key_height: Int32;
  black_key_width_ratio: Double;
  black_key_height_ratio: Double;
  starting_note: Note.Note;
  orientation: PianoOrientation;
};

export class PianoModel{
  //model of piano with rects


  //model is size 1*1
  static generateModel(white_keys: Int32, starting_note: Note.Note, 
    black_key_height_ratio: Double=0.5, black_key_width_ratio: Double=0.5): WebGL.ModelItem[] {
    const model = [];
    //model is drawn in order also replace type with proper type
    const block = WebGL.WebGL.rectangleModel(0, 0, 1, 1);
    const white = {colour: {r: 1, g: 1, b: 1}};
    const black = {colour: {r: 0, g: 0, b: 0}};
    model.push({white, model: block});

    const white_scale = 1.0/white_keys;

    //black keys
    for(let i = 0; i < white_keys; i++){
      const has_black_key = i !== 0 && Note.white_keys_with_black_keys[(i+starting_note.valueOf())%7];
      if(has_black_key){
        white_scale*black
      }
    }

    
    return model;
  }
}

export class StaticPianoRenderer{
  colour_shader: Shader.MVPColourProgram;
  vp: Matrix.TransformationMatrix3x3;
  constructor(width: number, height: number){
    this.vp = Matrix.TransformationMatrix3x3.orthographic(0, width, height, 0);
    this.colour_shader = new Shader.MVPColourProgram();
  }
  draw(props: StaticPianoDrawProps){
    const gl = WebGL.WebGL;
    if(gl == undefined) return;
    const is_left_right = props.orientation == "left" || props.orientation == "right";
    const block_width = is_left_right ? props.white_keys*props.key_width : props.key_height;
    const block_height = is_left_right ? props.key_height : props.white_keys*props.key_width;

    this.colour_shader.use();
    this.colour_shader.setColour(1, 1, 1);
    const block_model = gl.rectangleModel(props.x, props.y, block_width, block_height);
    this.colour_shader.setMvp(this.vp.multiplyCopy(block_model));
    Shapes.Quad.draw();

  }
}