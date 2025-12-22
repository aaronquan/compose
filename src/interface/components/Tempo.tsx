import { useState, useRef, useMemo } from "react";
import { NumberInput } from "./NumberInput";
import { getBeatIntervalMilliseconds } from "../../compose/rhythm";
import { useTempoClicker } from "../../hooks/useRhythmPlayer";


function lastNMaxMinDifference(arr: number[], n:number): number{
  let i = arr.length-1;
  if(i < 0 || n == 0) return 0;
  let max = arr[i];
  let min = arr[i];
  i--;
  while(i >= 0 && i >= arr.length-n){
    max = Math.max(max, arr[i]);
    min = Math.min(min, arr[i]);
    i--;
  }
  return max-min;
}

function lastNMaxMinDiffInRatio(arr: number[], n: number, ratio:number): boolean{
  let i = arr.length-1;
  if(i < 0 || n == 0) return false;
  let max = arr[i];
  let min = arr[i];
  i--;
  while(i >= 0 && i >= arr.length-n){
    max = Math.max(max, arr[i]);
    min = Math.min(min, arr[i]);
    i--;
  }
  //console.log(ratio*max);
  return (max-min) < ratio*max;
}

function lastNSum(arr: number[], n: number): number{
  let i = arr.length-1;
  if(i < 0 || n == 0) return 0;
  let sum = 0;
  while(i >= 0 && i >= arr.length-n){
    sum += arr[i];
    i--;
  }
  return sum;
}

type TempoClickerProps = {
  audio_context: AudioContext;
  tempo: number;
  //is_playing: boolean;
}

export function TempoClicker(props: TempoClickerProps){
  const [clicking, setClicking] = useState(false);
  //const beat_milliseconds = useMemo(() => getBeatIntervalMilliseconds(props.tempo), [props.tempo]);
  const tempoClicker = useTempoClicker({
    audio_context: props.audio_context, tempo: props.tempo, is_playing: clicking
  });
  function handleToggleClick(){
    setClicking(!clicking);
  }
  return (
    <button onClick={handleToggleClick}>Clicks{clicking ? " Off" : " On"}</button>
  );
}

type TempoSetterProps = {
  audio_context: AudioContext;
  onTempoChange: (tempo:number) => void;
};

export function TempoSetter(props: TempoSetterProps){
  const [tempo, setTempo] = useState(100);
  const clicks = useRef(0);
  const [ct, setCt] = useState(0);
  const last_time = useRef(0);
  const clicks_to_set = 4;
  const gaps = useRef<number[]>([]);

  //const [playing, setPlaying] = useState(false);
  /*
  function handleClick(){
    console.log("click");
    const diff = Date.now() - last_time.current;
    console.log(diff);
    if(last_time.current != 0){
      gaps.current.push(diff);
    }
    last_time.current = Date.now();
    if(gaps.current.length >= clicks_to_set && 
      lastNMaxMinDiffInRatio(gaps.current, clicks_to_set, 0.2)){
      last_time.current = 0;
      clicks.current = 0;
      setCt(0);
      console.log(gaps.current);
      const sum = lastNSum(gaps.current, clicks_to_set);
      const ave = sum/clicks_to_set;
      console.log(`Ave=${ave}`);
      setTempo((1000/ave)*60);
      gaps.current = [];
      window.removeEventListener("click", handleClick);
    }else{
      clicks.current += 1;
      setCt(clicks.current);
    }
  }*/
  function handleStart(){
    if(ct == 0){
      setCt(1);
    }else{
      onHit();
    }
  }
  function onHit(){
    const diff = Date.now() - last_time.current;
    if(last_time.current != 0){
      gaps.current.push(diff);
    }
    last_time.current = Date.now();
    if(gaps.current.length >= clicks_to_set && 
      lastNMaxMinDiffInRatio(gaps.current, clicks_to_set, 0.2)){
      setCt(0);
      const sum = lastNSum(gaps.current, clicks_to_set);
      const ave = sum/clicks_to_set;
      console.log(`Ave=${ave}`);
      setTempo((1000/ave)*60);
      gaps.current = [];

    }else{
      setCt(ct+1);
    }

  }
  function handleStop(){
    setCt(0);
  }
  function handleChangeTempo(t: number){
    setTempo(t);
  }
  return(
    <div>
    <NumberInput onChange={handleChangeTempo} initial={tempo}/>
    <div>{ct}</div>
    <button onClick={handleStart}>{ct == 0 ? "Start" : "Hit"}</button>
    <button onClick={handleStop} disabled={ct==0}>Stop</button>
    <TempoClicker audio_context={props.audio_context} tempo={tempo}/>
    </div>
  );
}