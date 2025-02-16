import {useRef, useEffect} from "react";
import { noteToneMap } from "../compose/note";
import { Oscillator, SingleNoteOscillatorPlayer } from "../compose/audio";

const keyWidth = 20;
const keyHeight = 20;

function PianoKeys(){
  const oscillator = useRef<Oscillator | null>(null);
  const notePlayer = useRef<SingleNoteOscillatorPlayer>(new SingleNoteOscillatorPlayer());
  useEffect(() => {
    const np = notePlayer.current;
    const a = noteToneMap.get(0)!;
    const as = noteToneMap.get(1)!;
    np.addNote(a, 1);
    np.addNote(as, 1);
    //initiateOscillator();
  },[]);
  function initiateOscillator(){
    if(!oscillator.current){
      oscillator.current = new Oscillator();
    }
  }
  function playNote(frequency: number){
    oscillator.current!.setFrequency(frequency);
    oscillator.current!.play();
  }
  function handleClickRed(){
    initiateOscillator();
    playNote(noteToneMap.get(0)!.frequency);
    //oscillator.current!.setFrequency(noteToneMap.get(0)!.frequency);
    //oscillator.current!.play();
    console.log("A");
  }
  function handleClickBlue(){
    //initiateOscillator();
    playNote(noteToneMap.get(2)!.frequency);
  }
  function handleStop(){
    console.log("stop");
    if(oscillator.current) oscillator.current.stop();
  }
  function handleNoteKeyPress(i:number){
    console.log("setting function "+i);
    return function(){
      console.log(i);
      initiateOscillator();
      if(noteToneMap.has(i))
        playNote(noteToneMap.get(i)!.frequency);
    }
  }
  function handlePlayNotes(){
    initiateOscillator();
    notePlayer.current.playNotes(oscillator.current!);
  }
  return (
  <>
  <button onClick={handlePlayNotes}>Play Notes</button>
  <svg width={600} height={200}>
    {[...Array(30).keys()].map((_, i) => 
      <rect key={i} onMouseDown={handleNoteKeyPress(i-15)}
      onMouseUp={handleStop}
      width={keyWidth} height={keyHeight} x={i*keyWidth} y={0} fill={i % 2 == 0 ? "red" : "blue"}/>
    )}
    {/*
    <rect onMouseDown={handleClickRed} onMouseUp={handleStop} width={100} height={200} x={0} y={0} fill={"red"}/>
    <rect onMouseDown={handleClickBlue} onMouseUp={handleStop} width={100} height={200} x={100} y={0} fill={"blue"}/>
    */}
  </svg>
  </>
  );
}

export default PianoKeys;