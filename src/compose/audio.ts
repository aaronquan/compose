import { noteToneMap,NoteTone, RealNoteTone } from "./note";

//audio context for the project
//export const audio_context = new AudioContext();

export class OscillatorCollection{
  audio_context: AudioContext;
  inactive_oscillators: Oscillator[];
  active_oscillators: Map<number, Oscillator>;

  constructor(context: AudioContext){
    this.audio_context = context;
    this.inactive_oscillators = [];
    this.active_oscillators = new Map<number, Oscillator>();
  }
  toggle(real_note: RealNoteTone): boolean{
    if(!this.active_oscillators.has(real_note.id)){
      this.play(real_note);
      return true;
    }
    this.stop(real_note);
    return false;
  }
  play(real_note: RealNoteTone){
    if(this.inactive_oscillators.length == 0){
      const osc = new Oscillator(this.audio_context);
      osc.setFrequency(real_note.getFrequency());
      osc.play();
      this.active_oscillators.set(real_note.id, osc);
      console.log("create");
    }else{
      const osc = this.inactive_oscillators.pop()!;
      osc.setFrequency(real_note.getFrequency());
      osc.play();
      this.active_oscillators.set(real_note.id, osc);
      console.log("reuse");
    }
    console.log(real_note.toString());
  }
  stop(real_note: RealNoteTone){
    if(!this.active_oscillators.has(real_note.id)){
      console.log("OscillatorCollection not found note ID");
      return;
    }
    const osc = this.active_oscillators.get(real_note.id)!;
    osc.stop();
    this.inactive_oscillators.push(osc);
    this.active_oscillators.delete(real_note.id);
  }
}

export class Oscillator{
  audio_context: AudioContext;
  oscillator: OscillatorNode;
  private is_setup: boolean;
  is_playing: boolean;

  gain: GainNode;
  end_gain: GainNode;
  constructor(context: AudioContext){
    this.audio_context = context;
    this.oscillator = this.audio_context.createOscillator();
    this.is_setup = false;
    this.gain = this.audio_context.createGain();
    this.end_gain = this.audio_context.createGain();

    this.is_playing = false;
    //this.gain.gain.linearRampToValueAtTime()
  }

  private setup(){
    if(!this.is_setup){
      this.oscillator.type = "sine";
      this.gain.connect(this.audio_context.destination);
      this.oscillator.connect(this.gain);//.connect(this.audio_context.destination);
      //this.oscillator.connect(this.end_gain);
      this.oscillator.start(0);
      this.is_setup = true;
      console.log("setting up oscillator");
    }
  }
  setGain(value:number){
    this.gain.gain.setValueAtTime(value, this.audio_context.currentTime);
  }
  setFrequency(freq:number){
    console.log(freq);
    this.oscillator.frequency.setValueAtTime(freq, this.audio_context.currentTime);
  }
  play(){
    this.setup();
    this.gain.gain.value = 0;
    this.gain.gain.setTargetAtTime(0.2, this.audio_context.currentTime+0.01, 0.1);
    this.is_playing = true;
  }
  stop(){
    this.gain.gain.setTargetAtTime(0, this.audio_context.currentTime, 0.1);
    this.is_playing = false;
  }
}

export class TickOscillator{
  audio_context: AudioContext;
  oscillator: OscillatorNode;

  gain: GainNode;
  is_setup: boolean;

  constructor(context: AudioContext){
    this.audio_context = context;
    this.oscillator = context.createOscillator();
    this.gain = context.createGain();
    this.is_setup = false;
  }
  private setup(){
    if(!this.is_setup){
      this.oscillator.type = "sawtooth";
      this.oscillator.frequency.setValueAtTime(1100, this.audio_context.currentTime);
      this.gain.connect(this.audio_context.destination);
      this.oscillator.connect(this.gain);
      this.oscillator.start();
      this.is_setup = true;
    }
  }
  tick(){
    this.setup();
    this.gain.gain.setValueCurveAtTime([0.0,0.9,1.0,0.9, 0.8, 0.9, 0.8, 0.7, 0.5, 0.0], this.audio_context.currentTime, 0.006);
    //this.gain.gain.setValueCurveAtTime([0.0, 1.0, 0.0], this.audio_context.currentTime, 0.01);
  }
  disconnect(){
    this.oscillator.disconnect(this.gain);
    this.gain.disconnect(this.audio_context.destination);
  }
}

type DurationNote = {
  tone:NoteTone | null,
  beat_duration: number
};

type PlayNote = (NoteTone | null);

function getBarIntervalMilliseconds(tempo: number, beatsPerBar: number): number{
  return ((1000*60)/tempo)*beatsPerBar;
}

function getBeatIntervalMilliseconds(tempo: number): number{
  return (1000*60)/tempo;
}

export class SingleNoteOscillatorPlayer{
  notes: PlayNote[];
  duration_notes: (DurationNote)[];
  tempo: number;
  constructor(){
    this.notes = [];
    this.duration_notes = [];
    this.tempo = 100;
  }
  addNote(nt:NoteTone, beats: number){
    this.duration_notes.push({tone: nt, beat_duration: beats});
  }
  addRest(beats: number){
    this.duration_notes.push({tone: null, beat_duration: beats});
  }
  private getDuration(beats:number): number{
    return getBeatIntervalMilliseconds(this.tempo)*beats;
  }
  playNotes(oscillator:Oscillator){
    //to test
    this.playNote(0, oscillator);
  }
  private playNote(note_index: number, oscillator:Oscillator){
    console.log(note_index);
    if(note_index < this.duration_notes.length){
      const duration_note = this.duration_notes[note_index];
      if(duration_note.tone){
        oscillator.setFrequency(duration_note.tone.frequency!);
        oscillator.play();
      }else{
        oscillator.stop();
      }

      const duration = this.getDuration(duration_note.beat_duration);
      setTimeout(() => {
        this.playNote(note_index+1, oscillator);
      }, duration);
    }else{
      oscillator.stop();
    }
  }
}