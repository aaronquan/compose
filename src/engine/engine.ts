// webgl imports
import * as WebGL from "./../WebGL/globals";
import * as FileUtil from "./../WebGL/Util/file";

//engine imports 
import * as MIDIConsts from "./consts";
import * as Composition from "./composition";
import {MIDIGrid} from "./grid";

// compose imports
import * as Audio from "./../compose/audio";
import * as Note from "../compose/note";

//interface imports 
import * as TextInput from "./../interface/components/text_input";
import * as Options from "./../interface/components/options";
import * as Button from "./../interface/components/button";
import * as Slider from "./../interface/components/slider";
import * as InternalWindow from "./../interface/components/internal_window";

//utils imports
import * as Download from "./../utils/download";


type Int32 = number;
type Float = number;

type BarBeat = {
  bar: Int32;
  beat: Int32;
}

export class MIDIEngine extends WebGL.App.BaseEngine{
  bars: Int32;
  beats_per_bar: Int32;
  min_id: Int32;
  max_id: Int32;
  width: Int32;
  height: Int32;
  vp: WebGL.Matrix.TransformationMatrix3x3;
  canvas: HTMLCanvasElement;
  canvas_mouse: WebGL.Matrix.Point2D | undefined;
  global_mouse: WebGL.Matrix.Point2D | undefined;

  grid: MIDIGrid;


  last_time: Float;

  bpm: Float;


  buttons: Button.ButtonSet;
  toggle_buttons: Button.ToggleButtonSet;

  play_state: MIDIConsts.PlayState;
  play_button: Button.BasicButton;
  play_beat: Float;
  play_note_index: Int32[];

  current_playing_notes: Map<Int32, MIDIConsts.MIDINote>;

  sound_generator: Audio.OscillatorCollection;
  sound_generator_same_volume: Audio.OscillatorCollectionSameGain;

  slider_test: Slider.HorizontalSlider;

  cs_test: Audio.ConstantSourceGainTest;

  ticker: Audio.TickOscillator;
  tick_on: boolean;

  beat_snapping: boolean;
  snap_amount: Float;

  hover_animation: Int32 | undefined;
  animation_frames: Int32;

  bpm_text_input: TextInput.TextInput;

  note_snap_options: Options.SingleSelectOptions;
  note_add_options: Options.SingleSelectOptions;

  wave_window: InternalWindow.InternalWindow;

  analyser: Audio.VisualisationTest;

  constructor(width: Int32, height: Int32, canvas: HTMLCanvasElement, audio_context: AudioContext){
    super();
    this.bars = 2;
    this.beats_per_bar = 4;
    this.min_id = 35;
    this.max_id = 58;
    this.width = width;
    this.height = height;
    this.vp = WebGL.Matrix.TransformationMatrix3x3.orthographic(0, width, height, 0);
    this.canvas = canvas;
    this.canvas_mouse = undefined;
    this.global_mouse = undefined;

    this.grid = new MIDIGrid(this.bars*this.beats_per_bar, this.max_id-this.min_id+1);
    this.grid.onNewEdgeHovered = () => {
      //console.log("new note");
      this.hover_animation = 0;
    }

    this.bpm = 60;

    this.buttons = new Button.ButtonSet();

    this.play_state = MIDIConsts.PlayStateEnum.Stopped;
    this.play_button = new Button.BasicButton(10, 10, 70, 30, 15);
    this.play_button.text = "Play";
    this.play_button.onPressed = () => {
      console.log("pressed");
      this.togglePlayState();
      //this.play_button.text = "Stop";
    }
    this.buttons.addButton(this.play_button);

    const test_button = new Button.BasicButton(100, 10, 70, 30, 15);
    test_button.text = "Test";
    test_button.onPressed = () => {
      console.log("testing_sound");
      Audio.OscillatorCollection.testSound(audio_context);
    }
    this.buttons.addButton(test_button);

    this.play_beat = 0;
    this.play_note_index = Array.from({length: this.max_id-this.min_id+1}, () => 0);

    this.last_time = 0;

    this.current_playing_notes = new Map();
    this.sound_generator = new Audio.OscillatorCollection(audio_context);

    this.slider_test = new Slider.HorizontalSlider();
    this.slider_test.value = 0.5;
    this.slider_test.onChange = (v) => {
      this.cs_test.setSource(v);
      this.sound_generator_same_volume.setVolume(v);
    }

    this.cs_test = new Audio.ConstantSourceGainTest(audio_context);
  
    this.sound_generator_same_volume = new Audio.OscillatorCollectionSameGain(audio_context);
    this.sound_generator_same_volume.setVolume(this.slider_test.value);

    this.toggle_buttons = new Button.ToggleButtonSet();

    const tog1 = new Button.ToggleButton(450, 10, 90, 10);
    tog1.on_text = "Tick On";
    tog1.off_text = "Tick Off";
    tog1.state = Button.ToggleButtonStateEnum.On;
    tog1.onToggleOn = () => {
      this.tick_on = true;
    };
    tog1.onToggleOff = () => {
      this.tick_on = false;
    };
    this.toggle_buttons.addButton(tog1);

    const tog2 = new Button.ToggleButton(550, 10, 120, 10);
    tog2.on_text = "Add Note On";
    tog2.off_text = "Add Note Off";
    tog2.onToggleOn = () => {
      tog3.toggleOff();
      this.grid.edit_state = MIDIConsts.GridEditStateEnum.Adding;

    };
    tog2.onToggleOff = () => {
      this.grid.edit_state = MIDIConsts.GridEditStateEnum.Default;
    };
    this.toggle_buttons.addButton(tog2);

    const tog3 = new Button.ToggleButton(680, 10, 100, 10);
    tog3.on_text = "Remove Note On";
    tog3.off_text = "Remove Note Off";
    tog3.onToggleOn = () => {
      tog2.toggleOff();
      this.grid.edit_state = MIDIConsts.GridEditStateEnum.Deleting;
    };
    tog3.onToggleOff = () => {
      this.grid.edit_state = MIDIConsts.GridEditStateEnum.Default;
    }
    this.toggle_buttons.addButton(tog3);

    const snap_button = new Button.ToggleButton(450, 25, 90, 10);
    snap_button.on_text = "Snap on";
    snap_button.off_text = "Snap off";
    snap_button.onToggleOn = () => {
      this.beat_snapping = true;
      this.grid.note_snap = 0.5;
    }
    snap_button.onToggleOff = () => {
      this.beat_snapping = false;
      this.grid.note_snap = undefined;
    }

    this.toggle_buttons.addButton(snap_button);

    this.ticker = new Audio.TickOscillator(audio_context);
    this.tick_on = tog1.isOn();

    this.beat_snapping = false;
    this.snap_amount = 1.0;

    this.hover_animation = undefined;
    this.animation_frames = 40;
    this.bpm_text_input = new TextInput.TextInput(550, 25, 60, 25);
    this.bpm_text_input.onChange = (text) => {
      console.log(text);
      if(!Number.isNaN(text)){
        this.bpm = Number.parseInt(text)
      }
    }

    this.note_snap_options = new Options.SingleSelectOptions(["None", "1", "H", "QT"], 680, 200, 20);
    this.note_snap_options.onSelected = (id: Int32) => {
      switch(id){
        case 0:
          this.grid.note_snap = undefined;
          break;
        case 1:
          this.grid.note_snap = 1;
          break;
        case 2:
          this.grid.note_snap = 0.5;
          break;
        case 3:
          this.grid.note_snap = 0.25;
          break;
        default:
          this.grid.note_snap = undefined;
          break;
      }
    };

    this.note_add_options = new Options.SingleSelectOptions(["1", "H", "QT"], 600, 200, 20);
    this.note_add_options.onSelected = (id: Int32) => {
      switch(id){
        case 0:
          this.grid.note_add_length = 1;
          break;
        case 1:
          this.grid.note_add_length = 0.5;
          break;
        case 2:
          this.grid.note_add_length = 0.25;
          break;
      }
    };

    const save_button = new Button.BasicButton(570, 120, 100, 25);
    save_button.text = "Save";
    save_button.onPressed = () => {
      console.log("saving");
      const contents = Composition.Save.serialiseComposition(this);
      console.log(contents);
      Download.downloadTextFile("comp", contents);
      //Download.downloadTextFile("hi", "hello world");

    }
    this.buttons.addButton(save_button);

    this.wave_window = new InternalWindow.InternalWindow(0, 0, 80, 80);

    const load_button = new Button.BasicButton(680, 120, 100, 25);
    load_button.text = "Load";
    load_button.onPressed = () => {
      console.log("loading");
      FileUtil.fetchPublicFile("comp.txt", 
        (text) => {
          console.log(text);
          const engine_save = Composition.Save.deserialiseComposition(text);
          this.load(engine_save);
        },
        (e) => {
          console.log(e);
          console.log("comp.txt not here");
        }
      );
    }

    this.buttons.addButton(load_button);

    this.analyser = new Audio.VisualisationTest(audio_context);

    const analyse_button = new Button.BasicButton(570, 90, 60, 25);
    analyse_button.text = "a";
    analyse_button.onPressed = () => {
      this.analyser.analyse();
    }
    this.buttons.addButton(analyse_button);
  }
  playNote(note_tone: Note.RealNoteTone){
    console.log("playing note "+note_tone.toString());
    //this.sound_generator.play(note_tone); // old sound
    this.sound_generator_same_volume.play(note_tone.getFrequency());
  }
  stopNote(note_tone: Note.RealNoteTone){
    console.log("stopping: "+ note_tone.toString());
    this.sound_generator_same_volume.stop(note_tone.getFrequency());
  }
  checkCurrentNotes(){
    const notes = this.grid.notes;
    const active_notes: Int32[] = [];
    for(const [id, nts] of notes){
      const note_tone_id = id+this.min_id;
      const note_tone = Note.RealNoteTone.getNoteToneFromId(note_tone_id);
      if(this.play_note_index[id] < nts.size()){
        const note_arr = nts.getArray();
        let curr_note = note_arr[this.play_note_index[id]];
        while(curr_note.beat+curr_note.length < this.play_beat){
          // stop current note
          curr_note.state = MIDIConsts.NoteStateEnum.Default;
          this.current_playing_notes.delete(note_tone_id);

          this.stopNote(note_tone);
          
          this.play_note_index[id]++;
          if(this.play_note_index[id] >= nts.size()) break;
          curr_note = note_arr[this.play_note_index[id]];
        }
        if(this.play_note_index[id] >= nts.size()) continue;
        if(curr_note.state !== MIDIConsts.NoteStateEnum.Playing && curr_note.beat <= this.play_beat && this.play_beat < curr_note.beat+curr_note.length){
          //play new note (currently plays repeats for same note)

          console.log(`Playing id ${note_tone_id}`);
          curr_note.state = MIDIConsts.NoteStateEnum.Playing;
          this.current_playing_notes.set(note_tone_id, curr_note);

          if(!this.sound_generator.active_oscillators.has(note_tone_id)){
            this.playNote(note_tone);
          }
        }
      }
    }
    //console.log(active_notes);
  }
  togglePlayState(){
    if(this.play_state == MIDIConsts.PlayStateEnum.Playing){
      this.play_button.text = "Play";
      this.play_state = MIDIConsts.PlayStateEnum.Stopped;
      this.play_beat = 0;
      this.play_note_index = Array.from({length: this.max_id-this.min_id+1}, () => 0);
      for(let [curr, note] of this.current_playing_notes){
        //console.log(`cancelling ${curr}`);
        //this.sound_generator.stop(Note.RealNoteTone.getNoteToneFromId(curr));
        this.stopNote(Note.RealNoteTone.getNoteToneFromId(curr))
        note.state = MIDIConsts.NoteStateEnum.Default;
      }
      this.current_playing_notes.clear();
      //this.playAudioNotes();
    }else if(this.play_state == MIDIConsts.PlayStateEnum.Stopped){
      this.play_button.text = "Stop";
      this.play_state = MIDIConsts.PlayStateEnum.Playing;
    }
  }
  playAudioNotes(){

  }
  getTotalBeats(): Int32{
    return this.bars*this.beats_per_bar;
  }
  getBarBeatFromId(id: Int32): BarBeat{
    const bar = Math.floor(id/this.beats_per_bar);
    const beat = id % this.beats_per_bar;
    return {bar, beat};
  }
  update(t: number): void {
    const time_elapsed = t-this.last_time; // milliseconds
    //console.log(time_elapsed);
    if(this.hover_animation != undefined){
      if(this.hover_animation < this.animation_frames){
        this.hover_animation++;
      }else if(this.hover_animation == this.animation_frames){
        this.hover_animation = undefined;
      }
    }
    if(this.play_state == MIDIConsts.PlayStateEnum.Playing){
      const minutes_elapsed = time_elapsed/60000;
      const beat_progress = minutes_elapsed*this.bpm;
      const next_beat = Math.ceil(this.play_beat);
      const passed_beat = this.play_beat+beat_progress >= next_beat;
      if(passed_beat && this.tick_on){
        //play tick if tick on
        this.ticker.tick();
      }
      this.play_beat += beat_progress;
      this.checkCurrentNotes();
      if(this.play_beat > this.bars*this.beats_per_bar){
        this.togglePlayState();
      }


      // add notes to play in (done in this.checkCurrentNotes())
    }
    TextInput.TextGlobals.update(time_elapsed);


    this.last_time = t;
    //throw new Error("Method not implemented.");
  }
  protected handleKeyDown(ev: KeyboardEvent): void {
    //throw new Error("Method not implemented.");
    //this.checkCurrentNotes();
    console.log(this.current_playing_notes);
    this.bpm_text_input.onKeyDown(ev);
  }
  protected handleKeyUp(ev: KeyboardEvent): void {
    //throw new Error("Method not implemented.");
  }
  protected handleMouseMove(ev: MouseEvent): void {
    const mouse = new WebGL.Matrix.Point2D(ev.clientX, ev.clientY);
    //console.log(mouse);
    this.global_mouse = mouse;
    const rect = this.canvas.getBoundingClientRect();
    const canvas_point = new WebGL.Matrix.Point2D(mouse.x-rect.left, mouse.y-rect.top);
    //console.log(canvas_point);
    this.canvas_mouse = canvas_point;
    this.grid.mouseOver(canvas_point);

    this.buttons.updateMouse(canvas_point);
    this.slider_test.updateMouse(canvas_point);

    this.toggle_buttons.updateMouse(canvas_point);
    this.bpm_text_input.onMouseMove(canvas_point);
    this.note_snap_options.onMouseMove(canvas_point);
    this.note_add_options.onMouseMove(canvas_point);
    this.wave_window.mouseMove(canvas_point);
  }
  protected handleMouseDown(ev: MouseEvent): void {
    //console.log("click");
    if(this.canvas_mouse){
      this.grid.mouseDown(this.canvas_mouse);
      this.buttons.mouseDown();
      this.slider_test.mouseDown(this.canvas_mouse);

      this.toggle_buttons.mouseDown();
      this.bpm_text_input.onMouseDown(this.canvas_mouse);
      this.note_snap_options.onMouseDown();
      this.note_add_options.onMouseDown();
      this.wave_window.mouseDown(this.canvas_mouse);
    }
  }
  protected handleMouseUp(ev: MouseEvent): void {
    if(this.canvas_mouse){
      this.grid.mouseUp(this.canvas_mouse);
      this.buttons.mouseUp();
      this.slider_test.mouseUp(this.canvas_mouse);

      this.toggle_buttons.mouseUp();
      this.bpm_text_input.onMouseUp();
      this.note_snap_options.onMouseUp();
      this.note_add_options.onMouseUp();

      this.wave_window.mouseUp();
    }
  }
  load(save: MIDIConsts.EngineSave){
    this.min_id = save.min_id;
    this.max_id = save.max_id;
    this.grid.notes = save.notes;
  }
}