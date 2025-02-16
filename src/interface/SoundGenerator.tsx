import { AToneFrequency, shiftTone, noteToneMap } from "../compose/note";
import {useEffect, useRef, useState} from "react";

export function SineGenerator(){
  const [isPlaying, setIsPlaying] = useState(false);
  const osc = useRef<OscillatorNode | null>(null);
  const audio_context = useRef<AudioContext>(new AudioContext());
  const frequency = useRef(440);
  function handlePlayWave(){
    if(osc.current){
      if(isPlaying){
        //osc.current.stop();
        setIsPlaying(false);
        osc.current.disconnect(audio_context.current.destination);
      }else{
        //osc.current.start();
        setIsPlaying(true);
        osc.current.connect(audio_context.current.destination);
      }
    }else{
      const audioContext = audio_context.current;
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency.current, audioContext.currentTime);
      oscillator.connect(audioContext.destination);
      oscillator.start(0);
      console.log("starting sound");
      setIsPlaying(true);
      osc.current = oscillator;
    }
  }
  function handleHigher(){
    if(osc.current){
      const next_frequency = shiftTone(frequency.current, 1);
      osc.current.frequency.setValueAtTime(next_frequency, audio_context.current.currentTime);
      frequency.current = next_frequency;
    }
  }
  function handleLower(){
    if(osc.current){
      frequency.current = shiftTone(frequency.current, -1);
      osc.current.frequency.setValueAtTime(frequency.current, audio_context.current.currentTime);
    }
  }
  return( 
  <>

    <button onClick={handlePlayWave}>
      {isPlaying ? "Stop" : "Play Wave"}
    </button>
    <button onClick={handleHigher}>Higher</button>
    <button onClick={handleLower}>Lower</button>
  </>
  )
}