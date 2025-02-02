import { ComposeBeatInterface } from "../interface/ComposeWorkspace";
import {Chord, stringToChord} from "./chord";

/*
type ComposeBeat = {
  chord: Chord | null,
  lyric: string | null
*/

export class ComposeBeat{
  chord: Chord | null;
  lyric: string | null;
  constructor(){
    this.chord = null;
    this.lyric = null;
  }
  toString(): string{
    const chord_string = this.chord ? this.chord.valueOf() : "";
    const lyric_string = this.lyric ? this.lyric : "";
    //console.log(`${lyric_string}`);
    return `Chord: ${chord_string} Lyric:  ${lyric_string}`;
  }
}

function getBarIntervalMilliseconds(tempo: number, beatsPerBar: number): number{
  return ((1000*60)/tempo)*beatsPerBar;
}

function getBeatIntervalMilliseconds(tempo: number): number{
  return (1000*60)/tempo;
}

export class WorkspaceState{
  private tempo: number;
  private beats: ComposeBeat[];
  private number_of_bars: number;
  private beats_per_bar: number;
  private beat_millisecond_interval: number;
  private current_view_beat: number;
  constructor(tempo: number, nbars: number){
    this.beats_per_bar = 4;
    //this.play_state = PlayState.Stopped;
    this.tempo = tempo;
    this.number_of_bars = nbars;
    this.beats = [...Array(nbars*this.beats_per_bar)].map(() => new ComposeBeat());
    this.beat_millisecond_interval = this.calculateBeatMillisecondInterval();
    this.current_view_beat = 0;
  }

  private calculateBarMillisecondInterval(): number{
    return this.calculateBeatMillisecondInterval()*this.beats_per_bar;
  }
  private calculateBeatMillisecondInterval(): number{
    return 60000/this.tempo;
  }

  nextViewBeat(){
    this.current_view_beat++;
    console.log(this.current_view_beat);
  }
  resetViewBeat(){
    this.current_view_beat = 0;
  }
  isNextViewBeatLast(): boolean{
    return this.current_view_beat + 1 >= this.getNumberOfBeats(); 
  }


  getBarTitleNumber(beat:number): number | undefined{
    if(beat % this.beats_per_bar == 0){
      return beat / this.beats_per_bar;
    }
    return undefined;
  }

  getBarNumber(beat:number): number{
    return Math.floor(beat / this.beats_per_bar);
  }

  getNumberOfBeats(){
    return this.number_of_bars * this.beats_per_bar;
  }

  setBeatsPerBar(bpb: number){
    this.beats_per_bar = bpb;
    //calculate bar interval
  }
  setTempo(tempo: number){
    if(tempo <= 0) return;
    this.tempo = tempo;
    this.beat_millisecond_interval = this.calculateBeatMillisecondInterval();
  }

  setNumberOfBars(nbars:number){
    if(nbars <= 0){
      return;
    }
    this.number_of_bars = nbars;
  }

  setBeatChord(chord_string: string | null, beat_index: number){
    if(beat_index >= this.beats.length){
      return;
    }
    this.beats[beat_index].chord = chord_string ? stringToChord(chord_string) : null;
  }

  setBeatLyric(lyric: string | null, beat_index: number){
    if(beat_index >= this.beats.length){
      return;
    }
    this.beats[beat_index].lyric = lyric ? lyric : null;
  }

  generateInitialInterfaceComposeBeats():ComposeBeatInterface[]{
    const interface_compose_beats = [];
    for(const beat of this.beats){
      interface_compose_beats.push({chord: beat.chord == null ? null : stringToChord(beat.chord), lyric: beat.lyric})
    }
    return interface_compose_beats;
  }

  //generates bars as arrays of arrays
  generateBars(){
  }
  /*
  isPlaying(): boolean{
    return this.play_state == PlayState.Playing;
  }*/
  getBeatMillisecondInterval(): number{
    return this.beat_millisecond_interval;
  }
  printBeats(){
    for(const beat of this.beats){
      console.log(beat.toString());
    }
  }
}