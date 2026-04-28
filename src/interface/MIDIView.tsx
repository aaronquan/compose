
import { useRef, useEffect, useState, MouseEvent } from "react";

import WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";
import * as PianoRenderer from "../renderers/piano";
import * as Note from "./../compose/note";

import * as WebGLGeneral from "./../WebGL/globals";

import {MIDIRenderer} from "./../renderers/midi";
import { MIDIEngine } from "../engine/engine";

type Double = number;
type Int32 = number;

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
  audio_context: AudioContext;
}


function positionPianoMatrix(top_left: Matrix.Point2D, width: Int32, height: Int32, orientation: PianoRenderer.PianoOrientation): Matrix.TransformationMatrix3x3{
  const matrix = Matrix.TransformationMatrix3x3.identity();
  switch(orientation){
    case "down":
      matrix.translate(top_left.x, top_left.y);
      matrix.rotate(0);
      break;
    case "left":
      matrix.translate(top_left.x+height, top_left.y);
      matrix.rotate(Math.PI*0.5);
      break;
    case "up":
      matrix.translate(top_left.x+width, top_left.y+height);
      matrix.rotate(Math.PI);
      break;
    case "right":
      matrix.translate(top_left.x, top_left.y+width);
      matrix.rotate(Math.PI*1.5);
      break;
  }
  matrix.scale(width, height);
  return matrix;
}

const vert_test = Matrix.TransformationMatrix3x3.identity();
//module.trans

export function MIDIView(props: MIDIViewProps){
  const w = window.innerWidth;
  const h = window.innerHeight;
  const starting_octave = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const piano_renderer = useRef<PianoRenderer.StaticPianoRenderer | undefined>();
  const piano_model_props = {
    white_keys: 28,
    starting_note: Note.Note.A,
  }
  const piano_model = useRef<PianoRenderer.BasePianoModel>(PianoRenderer.PianoModelGenerator.generateModel(piano_model_props.white_keys, piano_model_props.starting_note));
  //const vp = Matrix.TransformationMatrix3x3.orthographic(0, 1, 1, 0);
  const perspective = Matrix.TransformationMatrix3x3.orthographic(0, w, h, 0);
  const pw = 650;
  const ph = 200;
  const top_left = new Matrix.Point2D(30, 50);
  const orientation: PianoRenderer.PianoOrientation = "left";
  const model = positionPianoMatrix(top_left, pw, ph, orientation);
  //model.rotate(0.1);

  const vp = perspective.multiplyCopy(model);

  const engine = useRef<MIDIEngine | undefined>();
  const renderer = useRef<MIDIRenderer | undefined>();
  const midi_app = useRef<WebGLGeneral.App.App<MIDIEngine> | undefined>();
  const loaded = useRef<boolean>(false);

  useEffect(() => {
    if(loaded.current) return;
    loaded.current = true;
    const c = canvas.current;
    //piano_model.current = PianoRenderer.PianoModelGenerator.generateModel(piano_model_props.white_keys, piano_model_props.starting_note);
    if(c != null){
      c.width = w;
      c.height = h;
      WebGL.initialise(c);
      piano_renderer.current = new PianoRenderer.StaticPianoRenderer(w, h);
      engine.current = new MIDIEngine(w, h, c, props.audio_context);
      renderer.current = new MIDIRenderer();
      //drawGrid();
      //drawPiano();
      //WebGLGeneral.testBasicModel();
      WebGLGeneral.BasicModel.init();
      midi_app.current = new WebGLGeneral.App.App(engine.current, renderer.current);
      midi_app.current.loadResources(
        () => {
          renderer.current!.setup(engine.current!);
          midi_app.current!.initApp();
        }
      );
      //model.rotate(Math.PI/2)
      //const vp = Matrix.TransformationMatrix3x3.orthographic(0, 1, 1, 0);
      //piano_model.current.draw(vp);
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
    const px = cx - top_left.x;
    const py = cy - top_left.y;
    let ox = px*(1/pw);
    let oy = py*(1/ph);
    switch(orientation){
      case "up":
        oy = 1-oy;
        ox = 1 - ox;
        break;
      case "left":
        oy = 1-px*(1/ph);
        ox = py*(1/pw);
        break;
      case "right":
        oy = px*(1/ph);
        ox = 1-py*(1/pw);
        break;
    }
    if(ox >= 0 && ox < 1 && oy >= 0 && oy < 1){
      getPianoKeyFromModel(ox, oy);
    }
    //console.log(`${ox}, ${oy}`);
  }
  function getPianoKeyFromModel(x: Double, y: Double){
    if(x > 0){
      //console.log(`${x}, ${y}`);
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
      const is_sharp = accidental === Note.Accidental.Sharp;
      const note_adj = is_sharp ? acc_note : note;
      const real_note = Note.RealNoteTone.getNoteToneFromNoteAndOctave(note_adj, accidental, octave);
      const vis_id = is_sharp && !bottom_edge ? Math.floor(white_key)+1 : Math.floor(white_key);
      const visual = {is_black: is_sharp, id: vis_id};
      //const has_black_key = Note.white_keys_with_black_keys[(start_note+)%7];
      //console.log(piano_model.current.black_key_fills);


      const vp = perspective.multiplyCopy(model);
      if(accidental === Note.Accidental.Sharp){
        const bk = bottom_edge ? white_key : white_key+1;
        if(bk >= 0 && bk < piano_model.current.black_key_fills.length){
          //console.log(bk);
          piano_model.current.active_white_keys.clear();
          piano_model.current.clearBlacks();
          piano_model.current.setBlackKey(bk);
          //piano_model.current.draw(vp);
        }
      }else{
        piano_model.current.active_white_keys.clear();
        piano_model.current.clearBlacks();
        piano_model.current.setWhiteKey(white_key);
        //piano_model.current.draw(vp);
      }
      return {
        note_tone: real_note,
        visual_note: visual,
      };
    }
  }
  function highlightKey(){

  }
  function handleMouseDown(e: MouseEvent<HTMLCanvasElement>){

  }
  function handleMouseOut(e: MouseEvent<HTMLCanvasElement>){
    piano_model.current.active_white_keys.clear();
    //piano_model.current.draw(vp);
  }
  return (
    <canvas ref={canvas} width={200} height={200} onMouseMove={handleMouseMove} onMouseLeave={handleMouseOut}/>
  );
}