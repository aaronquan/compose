
import { useRef, useEffect, useState } from "react";

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
  useEffect(() => {
    const c = canvas.current;
    if(c != null){
      c.width = w;
      c.height = h;
      WebGL.initialise(c);
      piano_renderer.current = new PianoRenderer.StaticPianoRenderer(w, h);
      //drawGrid();
      //drawPiano();
      //WebGLGeneral.testBasicModel();
      WebGLGeneral.BasicModel.init();
      PianoRenderer.PianoModelGenerator.modelTest2();
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
  return (
    <canvas ref={canvas} width={200} height={200}/>
  );
}