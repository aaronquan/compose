
import * as WebGL from "./../WebGL/globals";
import * as ArrayUtils from "./../utils/array";
import * as Button from "./../interface/components/button";
import * as Slider from "./../interface/components/slider";
//import { Note } from "../compose/note";
import * as Note from "../compose/note";

import * as Audio from "./../compose/audio";

type Int32 = number;
type Float = number;
const EmptyFunction: VoidFunction = () => {};


type Coord = {
  x: Int32,
  y: Int32
}

const NoteStateEnum = {
  Default: 0,
  Playing: 1,
  Hovered: 2,
  Selected: 3
} as const;

type NoteState = (typeof NoteStateEnum)[keyof typeof NoteStateEnum];

type MIDINote = {
  id: Int32,
  beat: Float,
  length: Float,
  state: NoteState
}

function MIDINoteCmp(n1: MIDINote, n2: MIDINote): Int32{
  return n1.beat - n2.beat;
}

type NoteIdFloat = {
  id: Int32,
  beat_fl: Float
}

type MIDINoteEdge = {
  is_low_edge: boolean;
  note: MIDINote;
}

const GridEditStateEnum = {
  Default: 0,
  Adding: 1,
  Deleting: 2,
} as const;

type GridEditState = (typeof GridEditStateEnum)[keyof typeof GridEditStateEnum];

export class MIDIGrid{

  beat_width: Int32;
  beat_gap: Int32;
  beat_height: Int32;
  top_left: WebGL.Matrix.Point2D;
  width: Int32;
  height: Int32;

  max_display_width: Int32;
  max_display_height: Int32;

  active_coord: Coord | undefined;
  header_coord: Int32 | undefined;
  mouse_beat_float: NoteIdFloat | undefined;

  scroll_height: Int32;
  scroll: Float;
  beat_header: boolean;

  scroll_drag: boolean;

  notes: Map<Int32, ArrayUtils.SortedArray<MIDINote>>;
  hovered_note: MIDINote | undefined;
  dragged_note: MIDINote | undefined;
  dragged_note_index: Int32;
  drag_beat_offset: Float;

  dragged_note_edge: MIDINoteEdge | undefined;
  hovered_note_edge: MIDINoteEdge | undefined;

  selected_notes: Map<Int32, Set<MIDINote>>;

  edit_state: GridEditState;

  constructor(w: Int32, h: Int32){
    this.beat_width = 100;
    this.beat_gap = 0;
    this.beat_height = 30;
    this.top_left = new WebGL.Matrix.Point2D(50, 50);
    this.width = w;
    this.height = h;
    this.active_coord = undefined;
    this.header_coord = undefined;

    this.mouse_beat_float = undefined;

    this.max_display_height = 800;
    this.max_display_width = 500;

    this.scroll_height = 20;
    this.scroll = 0;
    this.beat_header = true;

    this.scroll_drag = false;

    this.notes = new Map();
    this.hovered_note = undefined;
    this.dragged_note = undefined;
    this.dragged_note_index = 0;
    this.drag_beat_offset = 0;

    this.dragged_note_edge = undefined;
    this.hovered_note_edge = undefined;

    this.selected_notes = new Map();

    this.edit_state = GridEditStateEnum.Default;
  }
  
  mouseDown(canvas_point: WebGL.Matrix.Point2D){
    const grid_point = new WebGL.Matrix.Point2D(canvas_point.x-this.top_left.x, canvas_point.y-this.top_left.y);
    const bottom = this.displayHeight();
    const sbar_width = this.max_display_width/this.displayGridRatio();
    const sbar_leftover = this.max_display_width - sbar_width;
    const sbar_x = this.scroll*sbar_leftover;
    //test mouse over scroll bar
    //note editing (edges, beat reposition)
    if(this.mouse_beat_float != undefined){
      const edge = this.noteEdge(this.mouse_beat_float);
      this.dragged_note_edge = edge;
      if(edge != undefined){
        this.drag_beat_offset = edge.is_low_edge ? 
          this.mouse_beat_float.beat_fl - edge.note.beat :
        edge.note.beat+edge.note.length - this.mouse_beat_float.beat_fl;
        this.dragged_note_index = this.closestNoteIndex(this.mouse_beat_float)!;
        //console.log(`edge ${this.dragged_note_index}`);
      }
      else if(this.hovered_note != undefined){
        this.dragged_note = this.hovered_note;
        this.drag_beat_offset = this.mouse_beat_float.beat_fl - this.dragged_note.beat;
        this.dragged_note_index = this.getHoveredNoteIndex()!;
        //console.log(this.dragged_note_index);
      }
    }

    //scroll / adding notes
    if(this.insideGrid(canvas_point)){
      if(this.insideScrollBar(grid_point)){
        if(grid_point.x > sbar_x && grid_point.x < sbar_x + sbar_width){
          this.scroll_drag = true;
        }else{
          this.setScroll(grid_point);
        }
      }else if(this.edit_state == GridEditStateEnum.Adding && this.active_coord != undefined){
        this.addNote(this.active_coord.y, this.active_coord.x);
      }
    }

    //deleting notes
    if(this.hovered_note != undefined && this.edit_state == GridEditStateEnum.Deleting){
      const index = this.getHoveredNoteIndex()!;
      const notes = this.notes.get(this.hovered_note.id);
      if(notes != undefined){
        notes.remove(index);
      }
      console.log("removing");
      this.hovered_note = undefined;
    }
  }
  addNote(note_id: Int32, beat: Float, length: Float=1){
    if(!this.notes.has(note_id)){
      this.notes.set(note_id, new ArrayUtils.SortedArray([], MIDINoteCmp));
    }
    this.notes.get(note_id)!.add({id: note_id, beat, length, state: NoteStateEnum.Default});

    if(this.mouse_beat_float != undefined){
      this.hovered_note_edge = this.noteEdge(this.mouse_beat_float);
    }
  }
  mouseUp(canvas_point: WebGL.Matrix.Point2D){
    this.scroll_drag = false;
    this.dragged_note = undefined;
    this.dragged_note_edge = undefined;
  }
  getHoveredNote(): MIDINote | undefined{
    
    if(this.mouse_beat_float != undefined){
      //console.log(this.mouse_beat_float);
      const notes = this.notes.get(this.mouse_beat_float.id);
      if(notes != undefined){
        const index = this.getHoveredNoteIndex();
        if(index != undefined){
          return notes.get(index);
        }
        return undefined;
        /*
        const sea = {id: this.mouse_beat_float.id, beat: this.mouse_beat_float.beat_fl, length: 0, state: NoteStateEnum.Default};
        const index = notes.lowerBound(sea) - 1;
        if(index >= 0 && index < notes.size()){
          const note = notes.get(index)!;
          if(note.beat <= this.mouse_beat_float.beat_fl && this.mouse_beat_float.beat_fl <= note.beat+note.length){
            //console.log(note);
            return note;
          }
        }*/
      }
    }
    return undefined;
  }
  getHoveredNoteIndex(): Int32 | undefined{
    if(this.mouse_beat_float != undefined){
      //console.log(this.mouse_beat_float);
      const notes = this.notes.get(this.mouse_beat_float.id);
      if(notes != undefined){
        const sea = {id: this.mouse_beat_float.id, beat: this.mouse_beat_float.beat_fl, length: 0, state: NoteStateEnum.Default};
        const index = notes.lowerBound(sea) - 1;
        if(index >= 0 && index < notes.size()){
          const note = notes.get(index)!;
          if(note.beat <= this.mouse_beat_float.beat_fl && this.mouse_beat_float.beat_fl <= note.beat+note.length){
            return index;
          }
        }
      }
    }
    return undefined;
  }
  closestNote(note_id_fl: NoteIdFloat): MIDINote | undefined{
    const notes = this.notes.get(note_id_fl.id);
    if(notes != undefined){
      const index = this.closestNoteIndex(note_id_fl);
      if(index != undefined){
        return notes.get(index);
      }
      return undefined;
    }
    return undefined;
    /*
    if(note_id_fl != undefined){
      const notes = this.notes.get(note_id_fl.id);
      if(notes != undefined){
        const sea = {id: note_id_fl.id, beat: note_id_fl.beat_fl, length: 0, state: NoteStateEnum.Default};
        const index = notes.lowerBound(sea) - 1;
        if(index >= 0 && index < notes.size()){
          const note = notes.get(index)!;
          if(note.beat <= note_id_fl.beat_fl && note_id_fl.beat_fl <= note.beat+note.length){
            return note;
          }

          //after check next note with current
          const next_note = notes.get(index+1);
          if(next_note != undefined){
            if(note_id_fl.beat_fl - (note.beat+note.length) <= next_note.beat - note_id_fl.beat_fl){
              return note;
            }else{
              return next_note;
            }
          }else{
            return note;
          }
        }else if(notes.size() >= 1){
          //before all notes
          return notes.get(0);
        }
      }
    }
    return undefined;*/
  }
  closestNoteIndex(note_id_fl: NoteIdFloat): Int32 | undefined{
    if(note_id_fl != undefined){
      const notes = this.notes.get(note_id_fl.id);
      if(notes != undefined){
        const sea = {id: note_id_fl.id, beat: note_id_fl.beat_fl, length: 0, state: NoteStateEnum.Default};
        const index = notes.lowerBound(sea) - 1;
        if(index >= 0 && index < notes.size()){
          const note = notes.get(index)!;
          if(note.beat <= note_id_fl.beat_fl && note_id_fl.beat_fl <= note.beat+note.length){
            return index;
          }

          //after check next note with current
          const next_note = notes.get(index+1);
          if(next_note != undefined){
            if(note_id_fl.beat_fl - (note.beat+note.length) <= next_note.beat - note_id_fl.beat_fl){
              return index;
            }else{
              return index+1;
            }
          }else{
            return index;
          }
        }else if(notes.size() >= 1){
          //before all notes
          return 0;
        }
      }
    }
    return undefined;
  }
  noteEdge(beat_float: NoteIdFloat, edge_amount: Float=0.1): MIDINoteEdge | undefined{
    if(beat_float != undefined){
      const closest = this.closestNote(beat_float);
      if(closest != undefined){
        if(closest.beat-edge_amount <= beat_float.beat_fl && beat_float.beat_fl <= closest.beat+edge_amount){
          return {is_low_edge: true, note: closest};
        }
        if(closest.beat+closest.length-edge_amount <= beat_float.beat_fl 
          && beat_float.beat_fl <= closest.beat+closest.length+edge_amount){
          return {is_low_edge: false, note: closest};
        }
      }
    }
    return undefined;
  }
  insideScrollBar(grid_point: WebGL.Matrix.Point2D): boolean{
    const bottom = this.displayHeight();
    return grid_point.y > bottom-this.scroll_height && grid_point.y < bottom && 
        grid_point.x > 0 && grid_point.x < this.max_display_width
  }
  insideGrid(canvas_point: WebGL.Matrix.Point2D): boolean{
    return canvas_point.x > this.top_left.x && canvas_point.x < this.max_display_width+this.top_left.x
    && canvas_point.y > this.top_left.y && canvas_point.y < this.displayHeight()+this.top_left.y;
  }
  setScroll(grid_point: WebGL.Matrix.Point2D){
    const sbar_width = this.max_display_width/this.displayGridRatio();
    const sbar_leftover = this.max_display_width-sbar_width;
    const scroll_start = this.max_display_width*0.5-sbar_leftover*0.5;
    const scrollx = (grid_point.x - scroll_start)/sbar_leftover;
    if(scrollx < 0){
      this.scroll = 0;
    }else if(scrollx > 1){
      this.scroll = 1;
    }else{
      this.scroll = scrollx;
    }
  }
  mouseOver(canvas_point: WebGL.Matrix.Point2D){
    const x_offset = this.getXOffset();
    const grid_point = new WebGL.Matrix.Point2D(canvas_point.x-this.top_left.x, canvas_point.y-this.top_left.y);
    const fx = (grid_point.x-x_offset)/this.beat_width;
    const px = Math.floor((grid_point.x-x_offset)/this.beat_width);
    const py = Math.floor(grid_point.y/this.beat_height);
    if(this.scroll_drag){
      this.setScroll(grid_point);
    }
    if(this.beat_header){
      if(this.insideGrid(canvas_point)){
        if(py == 0){
          this.active_coord = undefined;
          this.header_coord = px;
          this.mouse_beat_float = undefined;
        }else{
          this.active_coord = new WebGL.Matrix.Point2D(px, py-1);
          this.header_coord = undefined;
          this.mouse_beat_float = {id: py-1, beat_fl: fx};
        }
      }else{
        this.active_coord = undefined;
        this.header_coord = undefined;
        this.mouse_beat_float = undefined;
      }
    }else{
      if(this.insideGrid(canvas_point)){
        this.header_coord = undefined;
        this.active_coord = new WebGL.Matrix.Point2D(px, py);
        this.mouse_beat_float = {id: py, beat_fl: fx};
      }
    }

    const hovered_index = this.getHoveredNoteIndex();

    //hovered note on grid
    this.hovered_note_edge = undefined;
    if(this.mouse_beat_float != undefined){
      const notes = this.notes.get(this.mouse_beat_float.id);
      const active_note = (notes != undefined && hovered_index != undefined) ? notes.get(hovered_index) : undefined;
      if(active_note != undefined){
        active_note.state = NoteStateEnum.Hovered;
        if(this.hovered_note != undefined && (this.hovered_note.beat !== active_note.beat || this.hovered_note.id !== active_note.id)){
          this.hovered_note.state = NoteStateEnum.Default;
        }
        this.hovered_note = active_note;
      }else{
        if(this.hovered_note != undefined){
          this.hovered_note.state = NoteStateEnum.Default;
        }
        this.hovered_note = undefined;
      }

      //setting hovered edge
      this.hovered_note_edge = this.noteEdge(this.mouse_beat_float);

      //dragging note
      if(this.dragged_note != undefined && this.dragged_note_index != undefined && notes != undefined){
        const new_beat = this.mouse_beat_float.beat_fl-this.drag_beat_offset;
        if(this.dragged_note_index == 0){
          if(new_beat < 0){
            this.dragged_note.beat = 0;
          }else{
            this.dragged_note.beat = new_beat;
          }
        }else{
          //check lower
          const before_note = notes.get(this.dragged_note_index-1)!;
          if(before_note.beat + before_note.length > new_beat){
            this.dragged_note.beat = before_note.beat + before_note.length;
          }else if(this.dragged_note_index+1 < notes.size()){
            //check higher
            const after_note = notes.get(this.dragged_note_index+1)!;
            if(after_note.beat < new_beat+this.dragged_note.length){
              this.dragged_note.beat = after_note.beat-this.dragged_note.length;
            }else{
              this.dragged_note.beat = new_beat;
            }
          }else{
            this.dragged_note.beat = new_beat;
          }
        }
      }


      //dragging note edge to resize note
      if(this.mouse_beat_float != undefined && this.dragged_note_edge != undefined && notes != undefined){
        if(this.dragged_note_edge.is_low_edge){
          //for low drag beat edge side
          const before_note = notes.get(this.dragged_note_index-1);
          console.log(this.dragged_note_index);
          if(before_note != undefined && before_note.beat+before_note.length > this.mouse_beat_float.beat_fl){
            //prevent overlap before note
            this.dragged_note_edge.note.beat = before_note.beat+before_note.length;
            this.dragged_note_edge.note.length = this.dragged_note_edge.note.beat - this.dragged_note_edge.note.beat + this.dragged_note_edge.note.length;
          }else{
            const new_length = this.dragged_note_edge.note.beat - this.mouse_beat_float.beat_fl + this.dragged_note_edge.note.length;
            this.dragged_note_edge.note.beat = this.mouse_beat_float.beat_fl;
            this.dragged_note_edge.note.length = new_length;
          }
        }else{
          const after_note = notes.get(this.dragged_note_index+1);
          if(after_note != undefined){
            if(after_note.beat < this.mouse_beat_float.beat_fl){
              const new_length = after_note.beat - this.dragged_note_edge.note.beat;
              this.dragged_note_edge.note.length = new_length;
            }else{
              const new_length = this.mouse_beat_float.beat_fl - this.dragged_note_edge.note.beat;
              this.dragged_note_edge.note.length = new_length;
            }
          }else{
            const new_length = this.mouse_beat_float.beat_fl - this.dragged_note_edge.note.beat;
            this.dragged_note_edge.note.length = new_length;
          }
        }
      }
    }else{
      if(this.hovered_note != undefined){
        this.hovered_note.state = NoteStateEnum.Default;
      }
      this.hovered_note = undefined;
    }
  }
  leftViewBeat(): Float{
    return -this.getXOffset()/this.beat_width;
  }
  rightViewBeat(): Float{
    return (-this.getXOffset()+this.max_display_width)/this.beat_width;
  }

  startDisplayX(): Int32{
    const px = Math.floor(-this.getXOffset()/this.beat_width);
    return px;
  }
  endDisplayX(): Int32{
    return this.startDisplayX() + Math.ceil(this.max_display_width/this.beat_width);
  }
  getXOffset(): Int32{
    return (this.max_display_width-this.totalWidth())*this.scroll;
  }

  getXGlobalOffset(): Int32{
    return (this.max_display_width-this.totalWidth())*this.scroll+this.top_left.y;
  }

  //grid offset from global
  getYGlobalOffset(): Int32{
    return this.beat_header ? this.beat_height+this.top_left.y : this.top_left.y;
  }
  hasScroll(): boolean{
    return this.totalWidth() > this.max_display_width;
  }
  displayGridRatio(): Float{
    return this.totalWidth()/this.max_display_width;
  }
  totalWidth(){
    return this.width*this.beat_width;
  }
  totalHeight(){
    let height = this.beat_height*this.height;
    if(this.beat_header){
      height += this.beat_height;
    }
    return height;
  }
  displayHeight(){
    return Math.min(this.totalHeight(), this.max_display_height);
  }
}

type BarBeat = {
  bar: Int32;
  beat: Int32;
}

const PlayStateEnum = {
  Stopped: 0,
  Playing: 1
} as const;

type PlayState = (typeof PlayStateEnum)[keyof typeof PlayStateEnum];

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

  play_state: PlayState;
  play_button: Button.BasicButton;
  play_beat: Float;
  play_note_index: Int32[];

  current_playing_notes: Map<Int32, MIDINote>;

  sound_generator: Audio.OscillatorCollection;
  sound_generator_same_volume: Audio.OscillatorCollectionSameGain;

  slider_test: Slider.HorizontalSlider;

  cs_test: Audio.ConstantSourceGainTest;

  ticker: Audio.TickOscillator;
  tick_on: boolean;

  beat_snapping: boolean;

  hover_animation: Int32 | undefined;
  animation_frames: Int32;

  constructor(width: Int32, height: Int32, canvas: HTMLCanvasElement, audio_context: AudioContext){
    super();
    this.bars = 20;
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

    this.bpm = 60;

    this.buttons = new Button.ButtonSet();

    this.play_state = PlayStateEnum.Stopped;
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
      this.grid.edit_state = GridEditStateEnum.Adding;

    };
    tog2.onToggleOff = () => {
      this.grid.edit_state = GridEditStateEnum.Default;
    };
    this.toggle_buttons.addButton(tog2);

    const tog3 = new Button.ToggleButton(680, 10, 100, 10);
    tog3.on_text = "Remove Note On";
    tog3.off_text = "Remove Note Off";
    tog3.onToggleOn = () => {
      tog2.toggleOff();
      this.grid.edit_state = GridEditStateEnum.Deleting;
    };
    tog3.onToggleOff = () => {
      this.grid.edit_state = GridEditStateEnum.Default;
    }
    this.toggle_buttons.addButton(tog3);

    const snap_button = new Button.ToggleButton(450, 25, 90, 10);
    snap_button.on_text = "Snap on";
    snap_button.off_text = "Snap off";
    snap_button.onToggleOn = () => {
      this.beat_snapping = true;
    }
    snap_button.onToggleOff = () => {
      this.beat_snapping = false;
    }

    this.toggle_buttons.addButton(snap_button);

    this.ticker = new Audio.TickOscillator(audio_context);
    this.tick_on = tog1.isOn();


    this.grid.addNote(0, 1);

    this.beat_snapping = false;
    this.hover_animation = undefined;
    this.animation_frames = 5;
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
          curr_note.state = NoteStateEnum.Default;
          this.current_playing_notes.delete(note_tone_id);

          this.stopNote(note_tone);
          
          this.play_note_index[id]++;
          if(this.play_note_index[id] >= nts.size()) break;
          curr_note = note_arr[this.play_note_index[id]];
        }
        if(this.play_note_index[id] >= nts.size()) continue;
        if(curr_note.state !== NoteStateEnum.Playing && curr_note.beat <= this.play_beat && this.play_beat < curr_note.beat+curr_note.length){
          //play new note (currently plays repeats for same note)

          console.log(`Playing id ${note_tone_id}`);
          curr_note.state = NoteStateEnum.Playing;
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
    if(this.play_state == PlayStateEnum.Playing){
      this.play_button.text = "Play";
      this.play_state = PlayStateEnum.Stopped;
      this.play_beat = 0;
      this.play_note_index = Array.from({length: this.max_id-this.min_id+1}, () => 0);
      for(let [curr, note] of this.current_playing_notes){
        //console.log(`cancelling ${curr}`);
        //this.sound_generator.stop(Note.RealNoteTone.getNoteToneFromId(curr));
        this.stopNote(Note.RealNoteTone.getNoteToneFromId(curr))
        note.state = NoteStateEnum.Default;
      }
      this.current_playing_notes.clear();
      //this.playAudioNotes();
    }else if(this.play_state == PlayStateEnum.Stopped){
      this.play_button.text = "Stop";
      this.play_state = PlayStateEnum.Playing;
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
    if(this.play_state == PlayStateEnum.Playing){
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


      // add notes to play in (done in this.checkCurrentNotes())
    }



    this.last_time = t;
    //throw new Error("Method not implemented.");
  }
  protected handleKeyDown(ev: KeyboardEvent): void {
    //throw new Error("Method not implemented.");
    //this.checkCurrentNotes();
    console.log(this.current_playing_notes);
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
  }
  protected handleMouseDown(ev: MouseEvent): void {
    //console.log("click");
    if(this.canvas_mouse){
      this.grid.mouseDown(this.canvas_mouse);
      this.buttons.mouseDown();
      this.slider_test.mouseDown(this.canvas_mouse);

      this.toggle_buttons.mouseDown();
    }
  }
  protected handleMouseUp(ev: MouseEvent): void {
    if(this.canvas_mouse){
      this.grid.mouseUp(this.canvas_mouse);
      this.buttons.mouseUp();
      this.slider_test.mouseUp(this.canvas_mouse);

      this.toggle_buttons.mouseUp();
    }
  }
}

export class MIDIRenderer implements WebGL.App.IEngineRenderer<MIDIEngine>{
  colour_shader: WebGL.Shader.MVPColourProgram;
  circle_only_shader: WebGL.Shader.MVPCircleOnlyProgram;
  text_drawer: WebGL.TextDrawer;
  fonts: WebGL.FontLoader;

  note_colour: WebGL.Colour.ColourRGB;

  hover_transition_colours: WebGL.Colour.ColourRGB[];

  hover_note_colour: WebGL.Colour.ColourRGB;
  drag_note_colour: WebGL.Colour.ColourRGB;


  constructor(){
    this.colour_shader = new WebGL.Shader.MVPColourProgram();
    this.circle_only_shader = new WebGL.Shader.MVPCircleOnlyProgram();
    this.text_drawer = new WebGL.TextDrawer();
    this.fonts = new WebGL.FontLoader();

    this.note_colour = WebGL.Colour.ColourUtils.fromRGB(1, 1, 1);
    this.hover_note_colour = WebGL.Colour.ColourUtils.fromRGB(0.8, 0.8, 0.8);
    this.drag_note_colour = WebGL.Colour.ColourUtils.fromRGB(0, 0, 0);
    this.hover_transition_colours = WebGL.Colour.ColourUtils.linearTransitionColours(this.note_colour, this.hover_note_colour, 5);
  }

  loadTextures(onLoad:VoidFunction=EmptyFunction){
    const font_name = "letters-Sheet.png";
    const f16 = "font16-Sheet.png";
    this.fonts.addFont(font_name);
    this.fonts.addFont(f16);
    this.fonts.loadFonts(() => {
      //this.text_drawer.setFont(this.fonts.getFont(font_name)!);
      this.text_drawer.setFont(this.fonts.getFont(f16)!);
      this.text_drawer.loadFont();
      console.log("finished loading");
      if(onLoad) onLoad();
    });
  }

  setup(engine: MIDIEngine){
    //todo
  }

  render(engine: MIDIEngine){
    //drawing midi 50/50 from left
    const vp = engine.vp;
    const gl = WebGL.WebGL.gl!;
    this.colour_shader.use();

    const tl = engine.grid.top_left;
    let x = tl.x;
    let y = tl.y;

    
    const beat_width = engine.grid.beat_width;
    const beat_gap = 0;
    const line_thickness = 1;
    const half_line = line_thickness*0.5;
    const beat_height = engine.grid.beat_height;


    //for gaps (decide no gaps?)
    /*
    const height = (beat_gap+beat_height)*(engine.max_id-engine.min_id+2)-beat_gap;
    const line_model = WebGL.WebGL.rectangleModel(x-beat_gap, y, beat_gap, height);
    this.colour_shader.use();
    this.colour_shader.setMvp(vp.multiplyCopy(line_model));
    this.colour_shader.setColour(1, 1, 1);
    WebGL.Shapes.Quad.drawRelative();*/
    const grid_height = Math.min(engine.grid.totalHeight(), engine.grid.max_display_height);
    const grid_width = engine.grid.max_display_width;
    //drawing header
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(tl.x, engine.height-(tl.y+grid_height), grid_width, grid_height);
    const x_offset = engine.grid.getXOffset();
    const grid_y_offset = engine.grid.getYGlobalOffset();

    const start_beat_id = engine.grid.startDisplayX();
    const end_beat_id = engine.grid.endDisplayX();
    x += beat_width*start_beat_id;
    for(let id = start_beat_id; id <= end_beat_id; id++){
      const model = WebGL.WebGL.rectangleModel(x+x_offset, y, beat_width, beat_height);
      const bar_beat = engine.getBarBeatFromId(id);
      this.colour_shader.use();
      this.colour_shader.setMvp(vp.multiplyCopy(model));
      this.colour_shader.setColour(0.5, 0.5, 0.5);

      WebGL.Shapes.Quad.drawRelative();

      this.text_drawer.drawText(vp, x+x_offset, y, (bar_beat.beat+1).toString(), 16);

      x += beat_width + beat_gap;
    }


    /*
    for(let bar = 0; bar < engine.bars; bar++){
      for(let beat = 0; beat < engine.beats_per_bar; beat++){
        const model = WebGL.WebGL.rectangleModel(x+x_offset, y, beat_width, beat_height);
        this.colour_shader.use();
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        this.colour_shader.setColour(0.5, 0.5, 0.5);

        WebGL.Shapes.Quad.drawRelative();

        this.text_drawer.drawText(vp, x+x_offset, y, (beat+1).toString(), 16);

        x += beat_width + beat_gap;
      }
    }*/
    for(let note = engine.min_id; note <= engine.max_id; note++){
      x = tl.x + beat_width*start_beat_id;
      y += beat_height + beat_gap;
      for(let id = start_beat_id; id <= end_beat_id; id++){
        //const beat_id = beat + id*engine.beats_per_bar;
        const model = WebGL.WebGL.rectangleModel(x+x_offset, y, beat_width, beat_height);
        this.colour_shader.use();
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        if(engine.grid.active_coord != undefined && 
          engine.grid.active_coord.y == note-engine.min_id && 
          engine.grid.active_coord.x == id){
          //hovered note colour
          this.colour_shader.setColour(0, 0, 1);
        }else{
          this.colour_shader.setColour(1, 0.5, 0.6);
        }
        WebGL.Shapes.Quad.drawRelative();
        x += beat_width + beat_gap;
      }
    }

    //active notes
    this.colour_shader.use();
    this.colour_shader.setColour(0, 1, 0.5);
    for(const [id, note_arr] of engine.grid.notes){
      const arr = note_arr.getArray();
      for(const note of arr){
        const nx = x_offset+tl.x+beat_width*note.beat;
        const ny = grid_y_offset+beat_height*id;
        const model = WebGL.WebGL.rectangleModel(nx, ny, beat_width*note.length, beat_height);
        this.colour_shader.use();

        this.colour_shader.setMvp(vp.multiplyCopy(model));

        if(note.state === NoteStateEnum.Playing){
          this.colour_shader.setColour(1, 0, 0);
        }else if(note.state === NoteStateEnum.Default){
          this.colour_shader.setColour(0, 1, 0.5);
        }else if(note.state === NoteStateEnum.Hovered){
          this.colour_shader.setColour(0, 1, 0);
        }

        WebGL.Shapes.Quad.drawRelative();

        //draw note edges
        this.colour_shader.setColour(1.0, 0, 0.2);
        const edge_thickness = 2;
        const half_edge = edge_thickness*0.5;
        const left_model = WebGL.WebGL.rectangleModel(nx-half_edge, ny, edge_thickness, beat_height);
        this.colour_shader.setMvp(vp.multiplyCopy(left_model));
        WebGL.Shapes.Quad.draw();

        const right_model = WebGL.WebGL.rectangleModel(nx+(beat_width*note.length)-half_edge, ny, edge_thickness, beat_height);
        this.colour_shader.setMvp(vp.multiplyCopy(right_model));
        WebGL.Shapes.Quad.draw();
      }
      //console.log(note_arr.getArray());
    }

    const double_line = line_thickness*2;

    gl.disable(gl.SCISSOR_TEST);
    this.colour_shader.use();
    this.colour_shader.setColour(0.6, 0.6, 0.6);
    //draw lines  

    //vertical
    for(let id = start_beat_id+1; id < end_beat_id; id++){
      const ly = tl.y;
      const lx = tl.x+x_offset+beat_width*id;
      if(id % engine.beats_per_bar == 0){
        const model = WebGL.WebGL.rectangleModel(lx-line_thickness, ly, double_line, grid_height);
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        this.colour_shader.setColour(0.8, 0.8, 0.8);
      }else{
        const model = WebGL.WebGL.rectangleModel(lx-half_line, ly, line_thickness, grid_height);
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        this.colour_shader.setColour(0.6, 0.6, 0.6);
      }
      WebGL.Shapes.Quad.drawRelative();
    }
    //horizontal
    this.colour_shader.setColour(0.6, 0.6, 0.6);
    for(let id = 0; id <= engine.max_id-engine.min_id; id++){
      const ly = engine.grid.getYGlobalOffset()+id*engine.grid.beat_height;
      const lx = tl.x;
      const model = WebGL.WebGL.rectangleModel(lx, ly, grid_width, line_thickness);
      this.colour_shader.setMvp(vp.multiplyCopy(model));
      WebGL.Shapes.Quad.drawRelative();
    }

    //play line
    if(engine.play_beat >= engine.grid.leftViewBeat() && engine.play_beat <= engine.grid.rightViewBeat()){
      this.colour_shader.setColour(0.1, 1, 0.1);
      const ly = tl.y;
      const lx = tl.x+x_offset+beat_width*engine.play_beat;
      const model = WebGL.WebGL.rectangleModel(lx-line_thickness, ly, double_line, grid_height);
      this.colour_shader.setMvp(vp.multiplyCopy(model));
      WebGL.Shapes.Quad.drawRelative();
    }

    const right_grid = tl.x+grid_width;
    const bottom_grid = tl.y+grid_height;

    this.colour_shader.use();
    this.colour_shader.setColour(1, 1, 1);
    //border
    //top
    const top_line_model = WebGL.WebGL.rectangleModel(tl.x, tl.y-double_line, grid_width, double_line);
    this.colour_shader.setMvp(vp.multiplyCopy(top_line_model));
    WebGL.Shapes.Quad.draw();
    //left
    const left_line_model = WebGL.WebGL.rectangleModel(tl.x-double_line, tl.y, double_line, grid_height);
    this.colour_shader.setMvp(vp.multiplyCopy(left_line_model));
    WebGL.Shapes.Quad.draw();
    //bot
    const bot_line_model = WebGL.WebGL.rectangleModel(tl.x, tl.y+grid_height, grid_width, double_line);
    this.colour_shader.setMvp(vp.multiplyCopy(bot_line_model));
    WebGL.Shapes.Quad.draw();
    //right
    const right_line_model = WebGL.WebGL.rectangleModel(tl.x+grid_width, tl.y, double_line, grid_height);
    this.colour_shader.setMvp(vp.multiplyCopy(right_line_model));
    WebGL.Shapes.Quad.draw();

    //bar 
    //scroll bar
    const sbar_height = engine.grid.scroll_height;
    const sbar_width = grid_width/engine.grid.displayGridRatio();
    const sbar_leftover = grid_width - sbar_width;
    const sbar_x = tl.x + engine.grid.scroll*sbar_leftover;
    const bar_model = WebGL.WebGL.rectangleModel(sbar_x, bottom_grid-sbar_height, sbar_width, sbar_height);
    this.colour_shader.setColour(0.2, 0.2, 0.2);
    this.colour_shader.setMvp(vp.multiplyCopy(bar_model));
    WebGL.Shapes.Quad.draw();

    //buttons
    engine.buttons.draw(vp, this.colour_shader, this.text_drawer);

    this.text_drawer.drawText(vp, 400, 20, engine.grid.leftViewBeat().toString(), 15)

    engine.slider_test.draw(vp, this.colour_shader);

    this.text_drawer.drawText(vp, 320, 15, `v ${engine.slider_test.value.toString()}`, 15);

    engine.toggle_buttons.draw(vp, this.colour_shader, this.text_drawer);



    //test drawing beat edge
    if(engine.grid.dragged_note_edge != undefined){
      this.drawNoteEdge(engine, engine.grid.dragged_note_edge, tl.x+x_offset, grid_y_offset, this.drag_note_colour);
      
      console.log("dr edge");
      /*let nx = tl.x + beat_width*engine.grid.dragged_note_edge.note.beat;
      const ny = grid_y_offset + (engine.grid.dragged_note_edge.note.id)*(beat_height + beat_gap);
      if(!engine.grid.dragged_note_edge.is_low_edge){
        nx += (engine.grid.dragged_note_edge.note.length * beat_width) - beat_width*0.1;
      }
      const model = WebGL.WebGL.rectangleModel(nx+x_offset, ny, beat_width*0.1, beat_height);
      this.colour_shader.use();
      this.colour_shader.setColour(0.5, 0.5, 0.5);
      this.colour_shader.setMvp(vp.multiplyCopy(model));
      WebGL.Shapes.Quad.draw();*/
    }
    //hovered beat edge
    else if(engine.grid.hovered_note_edge != undefined){
      this.drawNoteEdge(engine, engine.grid.hovered_note_edge, tl.x + x_offset, grid_y_offset, this.hover_note_colour);
    }

    /*
    //vertical
    x = tl.x;
    for(let b = 0; b <= engine.bars*engine.beats_per_bar; b++){
      const line_model = b % engine.beats_per_bar == 0 ? 
      WebGL.WebGL.rectangleModel(x-line_thickness, tl.y, line_thickness*2, grid_height)
      : WebGL.WebGL.rectangleModel(x-half_line, tl.y, line_thickness, grid_height);
      this.colour_shader.setMvp(vp.multiplyCopy(line_model));
      this.colour_shader.setColour(1, 1, 1);
      WebGL.Shapes.Quad.drawRelative();
      x += engine.grid.beat_width;
    }

    //horizontal
    y = tl.y;
    if(engine.grid.beat_header){
      for(let n = 0; n <= engine.grid.height+1; n++){
        const line_model = (n == 0 || n == 1) || n == engine.grid.height+1 ? 
        WebGL.WebGL.rectangleModel(tl.x, y-line_thickness, grid_width, line_thickness*2)
        : WebGL.WebGL.rectangleModel(tl.x, y-half_line, grid_width, line_thickness);
        this.colour_shader.setMvp(vp.multiplyCopy(line_model));
        this.colour_shader.setColour(1, 1, 1);
        WebGL.Shapes.Quad.drawRelative();
        y += engine.grid.beat_height;
      }
    }else{
      for(let n = 0; n <= engine.grid.height; n++){
        const line_model = n == 0 || n == engine.grid.height ? 
        WebGL.WebGL.rectangleModel(tl.x, y-line_thickness, grid_width, line_thickness*2)
        : WebGL.WebGL.rectangleModel(tl.x, y-half_line, grid_width, line_thickness);
        this.colour_shader.setMvp(vp.multiplyCopy(line_model));
        this.colour_shader.setColour(1, 1, 1);
        WebGL.Shapes.Quad.drawRelative();
        y += engine.grid.beat_height;
      }
    }*/

  }
  drawNoteEdge(engine: MIDIEngine, edge: MIDINoteEdge, x: Float, y: Float, colour: WebGL.Colour.ColourRGB){
    const beat_width = engine.grid.beat_width;
    const beat_height = engine.grid.beat_height;
    let nx = x + edge.note.beat*beat_width;
    const ny = y + (edge.note.id)*(beat_height);
    if(!edge.is_low_edge){
      nx += (edge.note.length * beat_width) - beat_width*0.1;
    }
    const model = WebGL.WebGL.rectangleModel(nx, ny, beat_width*0.1, beat_height);
    this.colour_shader.use();
    this.colour_shader.setColour(colour.red, colour.green, colour.blue);
    this.colour_shader.setMvp(engine.vp.multiplyCopy(model));
    WebGL.Shapes.Quad.draw();
  }
}