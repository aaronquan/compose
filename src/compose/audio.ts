import { noteToneMap,NoteTone } from "./note";


export class Oscillator{
  audio_context: AudioContext;
  oscillator: OscillatorNode;
  constructor(){
    this.audio_context = new AudioContext();
    this.oscillator = this.audio_context.createOscillator();
    this.oscillator.type = "sine";
    this.oscillator.frequency.setValueAtTime(440, this.audio_context.currentTime);
    this.oscillator.connect(this.audio_context.destination);
    this.oscillator.start(0);
    this.oscillator.disconnect(this.audio_context.destination);
    //console.log("setup osc");
  }
  setFrequency(freq:number){
    this.oscillator.frequency.setValueAtTime(freq, this.audio_context.currentTime);
  }
  play(){
    this.oscillator.connect(this.audio_context.destination);
  }
  stop(){
    this.oscillator.disconnect(this.audio_context.destination);
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