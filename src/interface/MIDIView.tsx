
import { useRef, useEffect, useState, MouseEvent } from "react";

import WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";
import * as PianoRenderer from "../renderers/piano";
import * as Note from "./../compose/note";

import * as WebGLGeneral from "./../WebGL/globals";

type Double = number;

const default_piano_props = {
  white_keys: 29,
  starting_note: Note.Note.C,
  black_key_width_ratio: 0.7,
  black_key_height_ratio: 0.6,
  key_width: 30,
  key_height: 100
}

type MIDIViewProps = {
  start_id: number;
  end_id: number;

}

export function MIDIView(props: MIDIViewProps){
  const w = 800;
  const h = 200;
  const octave = useRef();
  const canvas = useRef<HTMLCanvasElement>(null);
  const piano_renderer = useRef<PianoRenderer.StaticPianoRenderer | undefined>();
  const piano_model_props = {
    white_keys: 28,
    starting_note: Note.Note.A,
  }
  const piano_model = useRef<PianoRenderer.BasePianoModel>(PianoRenderer.PianoModelGenerator.generateModel(piano_model_props.white_keys, piano_model_props.starting_note));
  const vp = Matrix.TransformationMatrix3x3.orthographic(0, 1, 1, 0);
  useEffect(() => {
    const c = canvas.current;
    //piano_model.current = PianoRenderer.PianoModelGenerator.generateModel(piano_model_props.white_keys, piano_model_props.starting_note);
    if(c != null){
      c.width = w;
      c.height = h;
      WebGL.initialise(c);
      piano_renderer.current = new PianoRenderer.StaticPianoRenderer(w, h);
      //drawGrid();
      //drawPiano();
      //WebGLGeneral.testBasicModel();
      WebGLGeneral.BasicModel.init();
      const vp = Matrix.TransformationMatrix3x3.orthographic(0, 1, 1, 0);
      piano_model.current.draw(vp);
      //PianoRenderer.PianoModelGenerator.modelTest2();
    }
  }, []);
  function drawGrid(){
    const shader = new Shader.MVPColourProgram();
    const vp = Matrix.TransformationMatrix3x3.orthographic(0, w, h, 0);
    const model = WebGL.rectangleModel(10, 10, 50, 80);
    shader.use();
    shader.setMvp(vp.multiplyCopy(model));
    shader.setColour(0.5, 0.1, 0.7);
    Shapes.Quad.draw();

    const l_model = WebGL.lineModel(10, 10, 50+10, 80+10, 3);
    console.log(l_model);
    shader.setColour(0.2, 0.9, 0.3);
    shader.setMvp(vp.multiplyCopy(l_model));
    Shapes.CenterQuad.draw();
    //Shapes.Quad.draw();
  }
  function drawPiano(){
    if(piano_renderer.current != undefined){
      const piano_props = {
        x: 0, y: 0,
        ...default_piano_props,
        orientation: "up" as PianoRenderer.PianoOrientation
      }
      piano_renderer.current.draw(piano_props);
    }
  }
  function handleMouseMove(e: MouseEvent<HTMLCanvasElement>){
    const c = e.target as HTMLCanvasElement;
    const rect = c.getBoundingClientRect();
    //console.log(rect);
    const cx = e.clientX - rect.x;
    const cy = e.clientY - rect.y;
    //console.log(`${cx}, ${cy}`);
    const ox = cx*(1/rect.width);
    const oy = cy*(1/rect.height);
    getPianoKeyFromModel(ox, oy);
  }
  function getPianoKeyFromModel(x: Double, y: Double){
    if(x > 0){
      console.log(`${x}, ${y}`);
      const ratio = piano_model.current.white_scale;
      const start_note = piano_model.current.start_note;
      const white_key_x = x / ratio;
      const white_key = Math.floor(white_key_x);
      const note_id = (white_key+start_note);
      const octave = Math.floor(note_id / 7);
      const note = note_id % 7;

      //check black key hover
      const black_width_ratio = piano_model.current.black_key_width_ratio;
      const black_height_ratio = piano_model.current.black_key_height_ratio;
      const white_key_edge = white_key_x % 1;
      const bottom_edge = white_key_edge <= 0.5;
      const edge_distance = bottom_edge ? white_key_edge : 1 - white_key_edge;

      const is_black_y = y <= black_height_ratio;
      const is_black_x = edge_distance < (black_width_ratio/2);
      const acc_note = bottom_edge ? (note+6)%7 : note;
      const accidental = is_black_x && is_black_y && Note.hasSharp(acc_note) ? Note.Accidental.Sharp : Note.Accidental.None;
      //const white_key = Math.floor(x/ratio);
      const note_adj = accidental == Note.Accidental.Sharp ? acc_note : note;
      //const has_black_key = Note.white_keys_with_black_keys[(start_note+)%7];
      console.log(piano_model.current.black_key_fills);
      if(accidental === Note.Accidental.Sharp){
        const bk = bottom_edge ? white_key : white_key+1;
        if(bk >= 0){
          //console.log(bk);
          piano_model.current.active_white_keys.clear();
          piano_model.current.clearBlacks();
          piano_model.current.setBlackKey(bk);
          piano_model.current.draw(vp);
        }
      }else{
        piano_model.current.active_white_keys.clear();
        piano_model.current.clearBlacks();
        piano_model.current.setWhiteKey(white_key);
        piano_model.current.draw(vp);
      }
      //const black_id = 
      //console.log(has_black_key);
      //console.log(wk);
      /*
      if(!piano_model.current.active_white_keys.has(wk)){
        piano_model.current.active_white_keys.clear();
        piano_model.current.setWhiteKey(wk);
        piano_model.current.draw(vp);
      }*/
    }
  }
  function handleMouseOut(e: MouseEvent<HTMLCanvasElement>){
    piano_model.current.active_white_keys.clear();
    piano_model.current.draw(vp);
  }
  return (
    <canvas ref={canvas} width={200} height={200} onMouseMove={handleMouseMove} onMouseLeave={handleMouseOut}/>
  );
}