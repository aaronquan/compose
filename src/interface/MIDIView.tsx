
import { useRef, useEffect, useState } from "react";

import * as WebGL from "./../WebGL/globals";
import * as Shapes from "./../WebGL/Shapes/Shapes";
import * as Shader from "./../WebGL/Shaders/custom";
import * as Matrix from "./../WebGL/Matrix/matrix";


type MIDIViewProps = {
  start_id: number;
  end_id: number;

}

export function MIDIView(props: MIDIViewProps){
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const gl = WebGL.WebGL;
    const c = canvas.current;
    if(c != null){
      WebGL.WebGL.initialise(c);
    }
  }, []);
  function drawGrid(){
    
  }
  return (
    <canvas ref={canvas}/>
  );
}