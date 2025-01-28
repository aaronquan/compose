import {useState, useEffect, useRef} from "react";
import { Chord, chord_choices, default_chord, stringToChord } from "../compose/chord";
import { WorkspaceState } from "../compose/workspace";
import update from "immutability-helper";

enum PlayState{
  Stopped, Playing
}

export type ComposeBeatInterface = {
  chord: string | null,
  lyric: string | null
}

type ComposeBeat = {
  chord: Chord | null,
  lyric: string | null
}

type ComposeBar = {
  beats: ComposeBeat[],
  //chord: Chord | null,
  //lyric: string | null
}

type ComposeStructure = {
  bars: ComposeBeat[]
}

const beatsPerbar = 4;

function breakIntoBeats(composeBeats: ComposeBeat[], beatsPerBar: number): ComposeBar[]{
  const bars = [];
  let currentBar = [];
  let i = 0;
  for(const beat of composeBeats){
    currentBar.push(beat);
    if(i == beatsPerBar){
      bars.push({beats: currentBar});
      currentBar = [];
    }
  }
  return bars;
}

function parseIntNum(s: string): number{
  if(isNaN(s as any)){
    return 0;
  }
  return parseInt(s);
}

const initialData = {
  tempo: 120,
  bars: 5
}

function ComposeWorkspace(){
  const [tempoInput, setTempoInput] = useState(initialData.tempo.toString());
  const [barsInput, setBarsInput] = useState(initialData.bars.toString());
  const [playState, setPlayState] = useState(PlayState.Stopped);
  const [barViewIndex, setBarViewIndex] = useState<number>(0);

  const workspace_state = useRef(new WorkspaceState(initialData.tempo, initialData.bars));
  const state = workspace_state.current;

  const next_beat_timeout = useRef<number | null>(null)

  function handleChangeTempo(e: React.ChangeEvent<HTMLInputElement>){
    const num = parseIntNum(e.target.value);
    if(num <= 0) return;
    state.setNumberOfBars(num);
    setTempoInput(e.target.value);

  }

  function handleBarNumberChange(e: React.ChangeEvent<HTMLInputElement>){
    const num = parseIntNum(e.target.value);
    if(num <= 0) return; 
    state.setNumberOfBars(num);
    setBarsInput(e.target.value);
    //workspaceState.current.tempo = num;
    //setBars(parseInt(e.target.value));

  }
  function handleClickPlay(){
    if(playState == PlayState.Playing){
      setPlayState(PlayState.Stopped);
      clearTimeout(next_beat_timeout.current!);
    }else if(playState == PlayState.Stopped){
      setPlayState(PlayState.Playing);
      runBeatTimer();
    }
    setBarViewIndex(0);
    
  }
  function runBeatTimer(){
    next_beat_timeout.current = setTimeout(nextBeat, state.getBeatMillisecondInterval());
  }
  function nextBeat(){
    //console.log(barViewIndex);
    if(state.isNextViewBeatLast()){
      setBarViewIndex(0);
      state.resetViewBeat();
      console.log("finished");
      return;
    }else{
      setBarViewIndex((index) => index + 1);
      state.nextViewBeat();
    }
    runBeatTimer(); 
  }
  function handleChangeChord(i:number){
    return function(chord_string: string|null){
      state.setBeatChord(chord_string, i);
    }
  }
  function handleChangeLyric(i:number){
    return function(lyric: string | null){
      state.setBeatLyric(lyric, i);
    }
  }
  function handlePrintBeats(){
    state.printBeats();
  }
  function isPlaying(){
    return playState == PlayState.Playing;
  }
  return <>
  <div>
  <input type="number" disabled={isPlaying()} value={tempoInput} onChange={handleChangeTempo}/>
  <input type="number" disabled={isPlaying()} value={barsInput} onChange={handleBarNumberChange}/>
  <button onClick={handlePrintBeats}>Print Beats</button>
  </div>
  <div style={{display: "flex", flexDirection: "row"}}>
    {[...Array(state.getNumberOfBeats())].map((_, i) => 
      <ComposeBeat key={i} barNumber={state.getBarTitleNumber(i)} 
      playingBeat={i == barViewIndex}
      onChangeLyric={handleChangeLyric(i)}
      onChangeChord={handleChangeChord(i)}/>
    )}
  </div>
  <button onClick={handleClickPlay}>{playState == PlayState.Stopped ? "Play" : "Stop"}</button>
  </>
}

type ComposeBeatProps = {
  barNumber: number | undefined;
  playingBeat: boolean;
  onChangeChord: (chord_string: string|null) => void;
  onChangeLyric: (lyric: string|null) => void;
  //onDeleteChord?: () => void;
}

function ComposeBeat(props:ComposeBeatProps){
  const [mouseOver, setMouseOver] = useState(false);
  const [chordString, setChordString] = useState<string | null>(null);
  const [lyric, setLyric] = useState<string | null>();

  function handleMouseEnter(){
    setMouseOver(true);
  }
  function handleMouseLeave(){
    setMouseOver(false);
  }
  function handleClick(){
    const chord = default_chord.valueOf();
    setChordString(chord);
    props.onChangeChord(chord);
  }
  function handleChordChange(chord_string: string){
    setChordString(chord_string);
    props.onChangeChord(chord_string);
  }
  function handleRemoveChord(){
    setChordString(null);
    props.onChangeChord(null);
  }
  function handleAddLyric(){
    setLyric("");
  }
  function handleLyricChange(e:React.ChangeEvent<HTMLInputElement>){
    setLyric(e.target.value);
  }
  return(
  <>
  {props.barNumber}
  <div onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}
  style={
    {backgroundColor: mouseOver?"red":"green", width:100, minWidth: 100, height: 50, 
    borderLeft: props.playingBeat ? "2px solid white" :"1px solid blue"}
  }>
    <div>
    {(chordString == null) ? 
    (mouseOver ? <button onClick={handleClick}>Add Chord</button> : <></>) :
    <>
      <ChordSelect chord={chordString} onChangeChord={handleChordChange}/>
      <button onClick={handleRemoveChord}>X</button>
    </>}
    </div>
    <div>
      {lyric == null ? 
        (mouseOver ? 
        <button onClick={handleAddLyric}>Add Lyric</button> : <></>) : 
        <input type="text" value={lyric} onChange={handleLyricChange}/>
      }
    </div>
  </div>
  </>
  );
}



type ChordSelectProps = {
  chord: string;
  onChangeChord?: (chord_string: string) => void;
}

function ChordSelect(props:ChordSelectProps){
  //const [selectedChordString, setSelectedChordString] = useState(default_chord.valueOf()); 
  function handleChangeChord(e: React.ChangeEvent<HTMLSelectElement>){
    //setSelectedChordString(e.target.value);
    if(props.onChangeChord) props.onChangeChord(e.target.value);
  }

  return <select value={props.chord} onChange={handleChangeChord}>
    {chord_choices.map((chord, i) => <option key={i} value={chord}>{chord}</option>)}
  </select>;
}

export default ComposeWorkspace;