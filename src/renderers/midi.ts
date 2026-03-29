
import * as WebGL from "./../WebGL/globals";
import * as ArrayUtils from "./../utils/array";
import * as Button from "./../interface/components/button";
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

class MIDIGrid{

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
  selected_notes: Map<Int32, Set<MIDINote>>;
  constructor(w: Int32, h: Int32){
    this.beat_width = 35;
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
    this.selected_notes = new Map();

  }
  
  mouseDown(canvas_point: WebGL.Matrix.Point2D){
    const grid_point = new WebGL.Matrix.Point2D(canvas_point.x-this.top_left.x, canvas_point.y-this.top_left.y);
    const bottom = this.displayHeight();
    const sbar_width = this.max_display_width/this.displayGridRatio();
    const sbar_leftover = this.max_display_width - sbar_width;
    const sbar_x = this.scroll*sbar_leftover;
    //test mouse over scroll bar
    //console.log(grid_point);
    //console.log(sbar_x);
    if(this.insideGrid(canvas_point)){
      if(this.insideScrollBar(grid_point)){
        if(grid_point.x > sbar_x && grid_point.x < sbar_x + sbar_width){
          console.log("inside scroll bar");
          this.scroll_drag = true;
        }else{
          this.setScroll(grid_point);
        }
      }else if(this.active_coord != undefined){
        const y = this.active_coord.y;
        if(!this.notes.has(y)){
          this.notes.set(y, new ArrayUtils.SortedArray([], MIDINoteCmp));
        }
        this.notes.get(y)!.add({id: y, beat: this.active_coord.x, length: 1, state: NoteStateEnum.Default});
        // grida
      }
    }
  }
  mouseUp(canvas_point: WebGL.Matrix.Point2D){
    this.scroll_drag = false;
    //console.log(this.startDisplayX());
    //console.log(this.endDisplayX());
  }
  getHoveredNote(): MIDINote | undefined{
    if(this.mouse_beat_float != undefined){
      //console.log(this.mouse_beat_float);
      const notes = this.notes.get(this.mouse_beat_float.id);
      if(notes != undefined){
        const sea = {id: this.mouse_beat_float.id, beat: this.mouse_beat_float.beat_fl, length: 0, state: NoteStateEnum.Default};
        const index = notes.lowerBound(sea) - 1;
        if(index >= 0 && index < notes.size()){
          const note = notes.get(index)!;
          if(note.beat <= this.mouse_beat_float.beat_fl && this.mouse_beat_float.beat_fl <= note.beat+note.length){
            //console.log(note);
            return note;
          }
        }
      }
    }
    return undefined;
    //if(this.active_coord){
    //  this.notes.get(this.active_coord.y)?.search()
    //}
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

    //hovered note on grid
    if(this.mouse_beat_float != undefined){
      const active_note = this.getHoveredNote();
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

  play_state: PlayState;
  play_button: Button.BasicButton;
  play_beat: Float;
  play_note_index: Int32[];

  current_playing_notes: Map<Int32, MIDINote>;

  sound_generator: Audio.OscillatorCollection;

  constructor(width: Int32, height: Int32, canvas: HTMLCanvasElement, audio_context: AudioContext){
    super();
    this.bars = 20;
    this.beats_per_bar = 4;
    this.min_id = 5;
    this.max_id = 25;
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
    this.play_button = new Button.BasicButton(10, 10, 60, 45);
    this.play_button.text = "Play";
    this.play_button.onPressed = () => {
      console.log("pressed");
      this.togglePlayState();
      //this.play_button.text = "Stop";
    }
    this.buttons.addButton(this.play_button);
    this.play_beat = 0;
    this.play_note_index = Array.from({length: this.max_id-this.min_id+1}, () => 0);

    this.last_time = 0;

    this.current_playing_notes = new Map();
    this.sound_generator = new Audio.OscillatorCollection(audio_context);
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

          this.sound_generator.stop(note_tone);
          console.log("stopping: "+ (note_tone_id).toString());
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
            console.log("adding sound "+(note_tone_id).toString());
            this.sound_generator.play(note_tone);
            
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
        console.log(`cancelling ${curr}`);
        this.sound_generator.stop(Note.RealNoteTone.getNoteToneFromId(curr));
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
      this.play_beat += beat_progress;
      this.checkCurrentNotes();


      // add notes to play in 
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
  }
  protected handleMouseDown(ev: MouseEvent): void {
    //console.log("click");
    if(this.canvas_mouse){
      this.grid.mouseDown(this.canvas_mouse);
      this.buttons.mouseDown();
    }
  }
  protected handleMouseUp(ev: MouseEvent): void {
    if(this.canvas_mouse){
      this.grid.mouseUp(this.canvas_mouse);
      this.buttons.mouseUp();
    }
  }
}

export class MIDIRenderer implements WebGL.App.IEngineRenderer<MIDIEngine>{
  colour_shader: WebGL.Shader.MVPColourProgram;
  circle_only_shader: WebGL.Shader.MVPCircleOnlyProgram;
  text_drawer: WebGL.TextDrawer;
  fonts: WebGL.FontLoader;

  constructor(){
    this.colour_shader = new WebGL.Shader.MVPColourProgram();
    this.circle_only_shader = new WebGL.Shader.MVPCircleOnlyProgram();
    this.text_drawer = new WebGL.TextDrawer();
    this.fonts = new WebGL.FontLoader();
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
          this.colour_shader.setColour(0.5, 1, 0.5);
        }else{
          this.colour_shader.setColour(1, 0.5, 0.5);
        }
        WebGL.Shapes.Quad.drawRelative();
        x += beat_width + beat_gap;
      }
    }

    //active notes
    this.colour_shader.use();
    this.colour_shader.setColour(0, 1, 0.5);
    const grid_y_offset = engine.grid.getYGlobalOffset();
    for(const [id, note_arr] of engine.grid.notes){
      const arr = note_arr.getArray();
      for(const note of arr){
        const nx = x_offset+tl.x+beat_width*note.beat;
        const ny = grid_y_offset+beat_height*id;
        const model = WebGL.WebGL.rectangleModel(nx, ny, beat_width, beat_height);
        this.colour_shader.use();

        this.colour_shader.setMvp(vp.multiplyCopy(model));

        if(note.state === NoteStateEnum.Playing){
          this.colour_shader.setColour(1, 0, 0);
        }else if(note.state === NoteStateEnum.Default){
          this.colour_shader.setColour(0, 1, 0.5);
        }else if(note.state === NoteStateEnum.Hovered){
          this.colour_shader.setColour(1, 0, 1);
        }

        WebGL.Shapes.Quad.drawRelative();
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
}