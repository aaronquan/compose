import { Oscillator } from "./audio";

const millisecondsPerMinute = 60*1000;

export type RhythmNote = {
  length: number, //in beats
  is_rest: boolean
}

export function getBeatIntervalMilliseconds(tempo: number): number{
  return (millisecondsPerMinute)/tempo;
}

export class Rhythm{
  notes: RhythmNote[];

  constructor(){
    this.notes = [];
  }
  addNote(note:RhythmNote){
    this.notes.push(note);
  }
  addRNote(length:number, is_rest:boolean=false){
    this.notes.push({length, is_rest});
  }
  getNote(i: number): RhythmNote | null{
    if(i >= this.notes.length || i < 0){
      return null;
    }
    return this.notes[i];
  }
  getNumBeats(): number{
    let n_beats = 0;
    for(const beat of this.notes){
      n_beats += beat.length;
    }
    return n_beats;
  }
  getRhythmBeatLengths(): number[]{
    const lens = [];
    let x: number = 0;
    for(const beat of this.notes){
      lens.push(x)
      x += beat.length;
    }
    return lens;
  }
  joinRhythm(rhy: RhythmNote[]){
    for(const note of rhy){
      this.notes.push(note);
    }
  }
  condenseRests(){
    const new_notes = [];
    let current_rest: RhythmNote | null = null;
    for(const note of this.notes){
      if(note.is_rest){
        if(current_rest == null){
          current_rest = {length: note.length, is_rest: true}
        }else{
          current_rest.length += note.length;
        }
      }else{
        if(current_rest != null){
          new_notes.push(current_rest);
          current_rest = null;
        }
        new_notes.push(note);
      }
    }
    if(current_rest != null){
      new_notes.push(current_rest);
    }
    console.log(new_notes);
    this.notes = new_notes;
  }
}

export class RhythmPlayer{
  rhythm: Rhythm | null;
  current_beat: number;
  is_playing: boolean;
  current_rhythm_note: number;
  timeout_id: number;
  //gain: GainNode;
  constructor(){
    this.rhythm = null;
    this.current_beat = 0;
    this.is_playing = false;
    this.current_rhythm_note = 0;
    this.timeout_id = -1;
  }
  playRhythm(tempo: number, oscillator: Oscillator){
    if(this.is_playing) return;
    if(this.rhythm){
      this.nextBeat(tempo, this.getNumBeats());
      this.playNextRhythmNote(tempo, oscillator);
      this.is_playing = true;
    }
  }

  getNumBeats(){
    if(this.rhythm == null) return 0;
    return this.rhythm.getNumBeats();
  }
  private playNextRhythmNote(tempo: number, oscillator: Oscillator){
    if(this.rhythm == null) return;
    if(this.current_rhythm_note >= this.rhythm?.notes.length){
      this.current_rhythm_note = 0;
      console.log("finished");
      oscillator.stop();
      this.is_playing = false;
      return;
    }
    const note = this.rhythm.notes[this.current_rhythm_note];
    console.log(note);
    if(!note.is_rest){
      oscillator.setFrequency(440);
      oscillator.play();
    }else{
      oscillator.stop();
    }
    this.current_rhythm_note += 1;
    this.timeout_id = setTimeout(() => {
      this.playNextRhythmNote(tempo, oscillator)
    }, note.length*getBeatIntervalMilliseconds(tempo));
  }
  private nextBeat(tempo: number, nbeats: number){
    this.current_beat += 1;
    if(nbeats < this.current_beat){
      setTimeout(() => {
        this.nextBeat(tempo, nbeats);
      }, getBeatIntervalMilliseconds(tempo));
    }
  }
}