import { noteToneMap,NoteTone, RealNoteTone } from "./note";

type Float = number;
type Int32 = number;

//audio context for the project
//export const audio_context = new AudioContext();

export class ConstantSourceGainTest{
  source_node: ConstantSourceNode;
  gain_node: GainNode;

  osc1: OscillatorNode;
  osc2: OscillatorNode;
  context: AudioContext;
  constructor(context: AudioContext){
    this.context = context;
    this.source_node = context.createConstantSource();
    this.source_node.offset.value = 0;

    this.gain_node = context.createGain();
    this.gain_node.gain.value = 0;

    this.source_node.connect(this.gain_node.gain);
    this.source_node.start();
    this.osc1 = context.createOscillator();

    this.osc2 = context.createOscillator();

    //this.osc1.connect(this.gain_node);
    this.gain_node.connect(context.destination);
  }

  play(){
    function playOscillator(cs: ConstantSourceGainTest, osc: OscillatorNode, f: Int32){
      console.log(cs);
      osc.disconnect();
      osc = cs.context.createOscillator();
      osc.frequency.setValueAtTime(f, cs.context.currentTime);
      osc.connect(cs.gain_node);
      osc.start();
    }
    //playOscillator(this, this.o sc1, 440);
    //playOscillator(this, this.osc2, 300);

    this.osc1.disconnect();
    this.osc1 = this.context.createOscillator();
    this.osc1.frequency.setValueAtTime(440, this.context.currentTime);
    this.osc1.connect(this.gain_node);
    this.osc1.start();

    this.osc2.disconnect();
    this.osc2 = this.context.createOscillator();
    this.osc2.frequency.setValueAtTime(300, this.context.currentTime);
    this.osc2.connect(this.gain_node);
    this.osc2.start();
  }

  stop(){
    this.osc1.stop();
    this.osc1.disconnect();
    this.osc2.stop();
    this.osc2.disconnect();
  }

  setSource(v: Float){
    this.source_node.offset.value = v;
  }
}

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

  static testSound(audio_context: AudioContext){
    const source = audio_context.createConstantSource();
    const osc = audio_context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audio_context.currentTime);
    //osc.start();

    const osc2 = audio_context.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(400, audio_context.currentTime);
    //osc2.start();

    const gain = audio_context.createGain();
    gain.gain.value = 0.1;
    osc.connect(gain);
    osc2.connect(gain);

    source.connect(gain.gain);
    //source.start();

    gain.connect(audio_context.destination);
    osc.start();
    osc2.start();
  }
}

export class OscillatorCollectionSameGain{
  audio_context: AudioContext;
  active_oscillators: Map<Float, TempOscillator>; // key is frequency

  constant_source_node: ConstantSourceNode;

  constructor(audio_context: AudioContext){
    this.audio_context = audio_context;
    this.active_oscillators = new Map();
    this.constant_source_node = audio_context.createConstantSource();
    this.constant_source_node.start();
  }
  setVolume(v: Float){
    this.constant_source_node.offset.value = v;
    console.log(`setting vol: ${v}`);
  }
  play(freq: Float){
    if(this.active_oscillators.has(freq)) return;
    const osc = new TempOscillator(this.audio_context);
    osc.connectGainSource(this.constant_source_node);
    osc.play(freq);
    //console.log(osc.gain);
    this.active_oscillators.set(freq, osc);
  }
  stop(freq: Float){
    const osc = this.active_oscillators.get(freq);
    if(osc != undefined){
      osc.stop();
      this.active_oscillators.delete(freq);
    }
  }
}

export class TempOscillator{
  audio_context: AudioContext;
  oscillator: OscillatorNode;
  gain: GainNode;
  constructor(context: AudioContext){
    this.audio_context = context;
    this.oscillator = this.audio_context.createOscillator();
    this.gain = this.audio_context.createGain();
    this.gain.gain.value = 0;
  }
  connectGainSource(csn: ConstantSourceNode){
    csn.connect(this.gain.gain);
  }
  setGain(value:number){
    this.gain.gain.setValueAtTime(value, this.audio_context.currentTime);
  }
  play(freq: Float){
    this.oscillator.type = "sine";
    this.oscillator.frequency.setValueAtTime(freq, this.audio_context.currentTime);
    this.gain.connect(this.audio_context.destination);
    this.oscillator.connect(this.gain);
    this.oscillator.start();
  }
  stop(){
    this.oscillator.stop();
    this.oscillator.disconnect();
  }
}

export class Oscillator{
  audio_context: AudioContext;
  oscillator: OscillatorNode;
  private is_setup: boolean;
  is_playing: boolean;

  gain: GainNode;
  //end_gain: GainNode;
  constructor(context: AudioContext){
    this.audio_context = context;
    this.oscillator = this.audio_context.createOscillator();
    this.is_setup = false;
    this.gain = this.audio_context.createGain();
    this.gain.gain.value = 0;

    this.is_playing = false;
  }

  private setup(){
    if(!this.is_setup){
      this.oscillator.type = "sine";
      this.gain.connect(this.audio_context.destination);
      this.oscillator.connect(this.gain);
      this.oscillator.start(0);
      this.is_setup = true;
      console.log("setting up oscillator");
    }
  }
  changeType(type: OscillatorType){
    this.oscillator.type = type;
  }
  setGain(value:number){
    this.gain.gain.setValueAtTime(value, this.audio_context.currentTime);
  }
  setFrequency(freq:number){
    //console.log(freq);
    this.oscillator.frequency.setValueAtTime(freq, this.audio_context.currentTime);
  }
  play(){
    this.setup();
    this.gain.gain.value = 0;
    this.gain.gain.setTargetAtTime(0.05, this.audio_context.currentTime+0.00, 0.2);
    this.is_playing = true;
  }
  stop(){
    this.gain.gain.setTargetAtTime(0, this.audio_context.currentTime+0.00, 0.2);
    this.is_playing = false;
  }
  destroy(){
    if(this.is_playing) this.oscillator.stop();
    if(this.is_setup) this.oscillator.disconnect();
  }
  connectGainSource(csn: ConstantSourceNode){
    csn.connect(this.gain.gain);
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
      this.gain.gain.value = 0.5;
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