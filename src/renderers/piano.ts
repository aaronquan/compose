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

    //console.log(props.mouse_over);

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