
import { useRef, useEffect, useState } from "react";

import WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";


type MIDIViewProps = {
  start_id: number;
  end_id: number;

}

export function MIDIView(props: MIDIViewProps){
  const w = 200;
  const h = 200;
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if(c != null){
      WebGL.initialise(c);
      drawGrid();
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
  return (
    <canvas ref={canvas} width={200} height={200}/>
  );
}