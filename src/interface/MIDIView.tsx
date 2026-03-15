
import { useRef, useEffect, useState, MouseEvent } from "react";

import WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";
import * as PianoRenderer from "../renderers/piano";
import * as Note from "./../compose/note";

import * as WebGLGeneral from "./../WebGL/globals";

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
      console.log("drawing");
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
    console.log(rect);
    const cx = e.clientX - rect.x;
    const cy = e.clientY - rect.y;
    console.log(`${cx}, ${cy}`);
    const ox = cx*(1/rect.width);
    const oy = cy*(1/rect.height);
    if(cx > 0){
      console.log(`${ox}, ${oy}`);
      const ratio = piano_model.current.white_scale;
      const wk = Math.floor(ox/ratio);
      if(!piano_model.current.active_white_keys.has(wk)){
        piano_model.current.active_white_keys.clear();
        piano_model.current.setWhiteKey(wk);
        piano_model.current.draw(vp);
      }
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