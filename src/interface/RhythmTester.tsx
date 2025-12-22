import { useEffect, useRef, useState } from "react";
import { Rhythm, RhythmNote, RhythmPlayer, getBeatIntervalMilliseconds} from "../compose/rhythm";
import { Oscillator, TickOscillator } from "../compose/audio";

import { claveBar, doubleClaveBar, fourBeatBar, halfNoteBeatBar, mixedRest, offBeatRestBar, triplet, uncondensedRest } from "../compose/test_rhythms";

import { useRhythmPlayer } from "../hooks/useRhythmPlayer";

import update from "immutability-helper";
import { NumberInput } from "./components/NumberInput";

type RhythmTesterProps = {
  audio_context: AudioContext;
}

function RhythmTester(props: RhythmTesterProps){
  const rhythm = useRef(new Rhythm());

  const ticker = useRef(new TickOscillator(props.audio_context));

  const once = useRef(false);
  const [updater, setUpdater] = useState(0);
  useEffect(() => {
    if(!once.current){
      const r = rhythm.current;
      rhythm.current = fourBeatBar;
      rhythm.current = halfNoteBeatBar;
      //rhythm.current = offBeatRestBar;
      //rhythm.current = claveBar;
      //rhythm.current = doubleClaveBar;
      //rhythm.current.joinRhythm(offBeatRestBar.notes);
      //rhythm.current = triplet;
      //rhythm.current = uncondensedRest;
      //uncondensedRest.condenseRests();
      //rhythm.current = mixedRest;
      /*
      r.addRNote(0.2);
      r.addRNote(0.8, true);
      r.addRNote(0.2);
      r.addRNote(0.8, true);
      r.addRNote(0.2);
      r.addRNote(0.8+0.5, true);
      r.addRNote(0.2);
      r.addRNote(0.3, true);
      */
      

      //console.log()
      setUpdater(1);
      once.current = true;
    }
  }, []);

  function testClick(){
    ticker.current.tick();
  }

  return (
    <>
    <RhythmDisplay beat_width={100} rhythm={rhythm.current} audio_context={props.audio_context}/>
    <button onClick={testClick}>Test</button>
    </>
  );
}

type RhythmDisplayProps = {
  audio_context: AudioContext,
  rhythm: Rhythm,
  beat_width: number
}

function RhythmDisplay(props: RhythmDisplayProps){
  const height = 100;
  //const tempo = 100;
  //console.log(props.rhythm);
  const [tempo, setTempo] = useState(100);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [testPlaying, testBeat, testNote, onPlay, onStop] = useRhythmPlayer({
    rhythm: props.rhythm, 
    tempo: tempo, onFinished, 
    audio_context: props.audio_context,
    repeating: isRepeating
  });

  const nbeats = props.rhythm.getNumBeats();
  //console.log(nbeats);
  const oscillator = useRef(new Oscillator(props.audio_context));
  const player = useRef(new RhythmPlayer());

  const beatIntervalId = useRef<number | null>(null);
  const repeatTimerId = useRef<number | null>(null);

  function onFinished(){
    console.log("finished");
  }

  function handlePlay(){
    if(!testPlaying){
      onPlay();
    }
    else{
      onStop();
    }
    /*
    console.log("playing");
    if(player.current.rhythm == null){
      player.current.rhythm = props.rhythm;
    }
    if(player.current.is_playing){
      player.current.playRhythm(tempo, oscillator.current);
    }
    if(isRepeating){
      repeatTimerId.current = setTimeout(() => {
        handlePlay();
      }, getBeatIntervalMilliseconds(tempo)*props.rhythm.getNumBeats());
    }
    setCurrentBeat(0);
    nextCurrentBeat();
    */
  }
  const display_beat_x = Math.floor(testBeat)*props.beat_width;
  const rhythm_lengths: number[] = props.rhythm.getRhythmBeatLengths();

  useEffect(() => {
    if(currentBeat >= nbeats){
      if(beatIntervalId.current != null){
        clearInterval(beatIntervalId.current);
        setCurrentBeat(0);
      }
    }
  }, [currentBeat]);
  function nextCurrentBeat(){
    beatIntervalId.current = setInterval(() => {
      setCurrentBeat(currentBeat => currentBeat+1);
    }, getBeatIntervalMilliseconds(tempo));
  }
  function handleRepeatToggle(){
    if(isRepeating && repeatTimerId.current != null){
      clearInterval(repeatTimerId.current);
    }
    setIsRepeating(!isRepeating);
  }
  function handleChangeTempo(num:number){
    setTempo(num);
  }
  return(
    <>

      <svg width={500} height={100}>
        {
        props.rhythm.notes.map((note, i) => {
          return <BeatRect key={i} beat_width={props.beat_width} start_length={rhythm_lengths[i]} beat_length={note.length} is_rest={!note.is_rest} height={height}
          active={i==testNote && testPlaying}/>
          //return <rect key={i} x={rhythm_lengths[i]*props.beat_width} width={props.beat_width*note.length} height={height} fill={"red"}/>
        })}
        {[...Array(Math.ceil(nbeats)).keys()].map((i) => <line key={i} x1={i*props.beat_width} y1={0} x2={i*props.beat_width} y2={10} 
        style={{stroke:"white",strokeWidth:2}}
        />)}
        <line x1={display_beat_x} y1={0} x2={display_beat_x} y2={height} style={{stroke: "grey", strokeWidth: 3}}/>
      </svg>
      <span>{testPlaying ? "play" : "not playing"} {testBeat} {testNote}</span>
      <button onClick={handlePlay}>{testPlaying ? "Stop" : "Play"}</button>
      <button onClick={handleRepeatToggle} style={{backgroundColor: isRepeating ? "grey" : "black"}}>Repeat</button>
      <NumberInput onChange={handleChangeTempo} initial={tempo}/>
    </>
  );
}

type BeatRectProps = {
  beat_width: number;
  start_length: number;
  beat_length: number;
  height: number;
  is_rest: boolean;
  active: boolean;
}

function BeatRect(props: BeatRectProps){
  return (
    <>
      <rect x={props.start_length*props.beat_width} y={0} width={props.beat_width*props.beat_length} height={props.height} 
      fill={props.is_rest ? (props.active ? "red" : "orange"): "blue"} style={{stroke:"red", strokeWidth:2}}
      />
    </>
  );
}

export default RhythmTester;