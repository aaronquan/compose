
import * as WebGL from "./../WebGL/globals";
import * as IntervalUtils from "./../utils/interval";

import { MIDIEngine } from "../engine/engine";

type Int32 = number;
type Float = number;
type VoidFunction = () => void;
const EmptyFunction: VoidFunction = () => {};

const NoteStateEnum = {
  Default: 0,
  Playing: 1,
  Hovered: 2,
  Selected: 3,
  Preview: 4, //special case for adding notes
} as const;

type NoteState = (typeof NoteStateEnum)[keyof typeof NoteStateEnum];

type MIDINote = {
  id: Int32,
  beat: Float,
  length: Float,
  state: NoteState
}

type MIDINoteEdge = {
  is_low_edge: boolean;
  note: MIDINote;
}


export class MIDIRenderer implements WebGL.App.IEngineRenderer<MIDIEngine>{
  colour_shader: WebGL.Shader.MVPColourProgram;
  circle_only_shader: WebGL.Shader.MVPCircleOnlyProgram;
  text_drawer: WebGL.TextDrawer;
  fonts: WebGL.FontLoader;

  default_note_colour: WebGL.Colour.ColourRGB;

  hover_transition_colours: WebGL.Colour.ColourRGB[];

  edge_note_colour: WebGL.Colour.ColourRGB;

  hover_note_colour: WebGL.Colour.ColourRGB;
  drag_note_colour: WebGL.Colour.ColourRGB;
  playing_note_colour: WebGL.Colour.ColourRGB;

  preview_note_colour: WebGL.Colour.ColourRGB;

  header_background_colour: WebGL.Colour.ColourRGB;
  beat_background_colour: WebGL.Colour.ColourRGB;

  text_colour: WebGL.Colour.ColourRGB;

  constructor(){
    this.colour_shader = new WebGL.Shader.MVPColourProgram();
    this.circle_only_shader = new WebGL.Shader.MVPCircleOnlyProgram();
    this.text_drawer = new WebGL.TextDrawer();
    this.fonts = new WebGL.FontLoader();

    this.default_note_colour = WebGL.Colour.ColourUtils.fromRGB(1, 1, 1);
    this.hover_transition_colours = [];
    this.edge_note_colour = WebGL.Colour.ColourUtils.fromRGB(0.5, 0.5, 0.5);
    this.hover_note_colour = WebGL.Colour.ColourUtils.fromRGB(0.8, 0.8, 0.8);
    this.drag_note_colour = WebGL.Colour.ColourUtils.fromRGB(0, 0, 0);
    this.playing_note_colour = WebGL.Colour.ColourUtils.fromRGB(1.0, 0.2, 0.2);

    this.preview_note_colour = WebGL.Colour.ColourUtils.fromRGB(0.4, 0.4, 0.2);

    this.header_background_colour = WebGL.Colour.ColourUtils.fromRGB(0.3, 0.1, 0.9);
    this.beat_background_colour = WebGL.Colour.ColourUtils.fromRGB(0.2,0.2,0.4);

    this.text_colour = WebGL.Colour.ColourUtils.fromRGB(1, 1, 1);
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
    console.log("setting up renderer");
    this.hover_transition_colours = WebGL.Colour.ColourUtils.linearTransitionColours(this.hover_note_colour, this.edge_note_colour, engine.animation_frames+1);
    console.log(this.hover_transition_colours);
  }

  drawNote(engine: MIDIEngine, note: MIDINote){
    const x = engine.grid.getXGlobalOffset()+note.beat*engine.grid.beat_width;
    const y = engine.grid.getYGlobalOffset()+note.id*engine.grid.beat_height;
    const note_model = WebGL.WebGL.rectangleModel(x, y, engine.grid.beat_width*note.length, engine.grid.beat_height);
    this.colour_shader.use();
    switch(note.state){
      case NoteStateEnum.Hovered:
        break;
      case NoteStateEnum.Playing:
        this.colour_shader.setColourFromColourRGB(this.preview_note_colour);
        break;
      case NoteStateEnum.Selected:
        break;
      default:
        this.colour_shader.setColourFromColourRGB(this.default_note_colour);
        break;
    }
    this.colour_shader.setColourFromColourRGB(this.preview_note_colour);
    this.colour_shader.setMvp(engine.vp.multiplyCopy(note_model));
    WebGL.Shapes.Quad.draw();

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

    //applying scisson on grid
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(tl.x, engine.height-(tl.y+grid_height), grid_width, grid_height);


    //drawing header
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
      this.colour_shader.setColourFromColourRGB(this.header_background_colour);

      WebGL.Shapes.Quad.drawRelative();

      this.text_drawer.drawText(vp, x+x_offset, y, (bar_beat.beat+1).toString(), 16);

      x += beat_width + beat_gap;
    }

    //drawing grid background

    //old method all notes individual
    /*
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
          this.colour_shader.setColourFromColourRGB(this.beat_background_colour);
        }
        WebGL.Shapes.Quad.drawRelative();
        x += beat_width + beat_gap;
      }
    }*/

    //new method - block


    //active notes
    this.colour_shader.use();
    //this.colour_shader.setColour(0, 1, 0.5);
    for(const [id, note_arr] of engine.grid.notes){
      const arr = note_arr.getArray();
      for(const note of arr){
        const nx = x_offset+tl.x+beat_width*note.beat;
        const ny = grid_y_offset+beat_height*id;
        const model = WebGL.WebGL.rectangleModel(nx, ny, beat_width*note.length, beat_height);
        this.colour_shader.use();

        this.colour_shader.setMvp(vp.multiplyCopy(model));

        if(note.state === NoteStateEnum.Playing){
          this.colour_shader.setColourFromColourRGB(this.playing_note_colour);
        }else if(note.state === NoteStateEnum.Default){
          this.colour_shader.setColourFromColourRGB(this.default_note_colour);
        }else if(note.state === NoteStateEnum.Hovered){
          this.colour_shader.setColourFromColourRGB(this.hover_note_colour);
        }

        WebGL.Shapes.Quad.drawRelative();

        //draw note edges
        this.colour_shader.setColourFromColourRGB(this.edge_note_colour);
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
    if(engine.grid.note_add_preview != undefined){
      this.drawNote(engine, engine.grid.note_add_preview);
    }


    const double_line = line_thickness*2;

    gl.disable(gl.SCISSOR_TEST);
    this.colour_shader.use();
    this.colour_shader.setColour(0.6, 0.6, 0.6);
    //draw lines  

    //vertical
    const beat_interval = engine.grid.note_snap != undefined ? engine.grid.note_snap : 1;
    //todo fix start and end beats
    const left_beat = IntervalUtils.nextOrSameFractionInterval(engine.grid.leftViewBeat(), beat_interval);
    const right_beat = IntervalUtils.prevOrSameFractionInterval(engine.grid.rightViewBeat(), beat_interval);
    for(let id = left_beat; id <= right_beat; id+=beat_interval){
      const ly = tl.y;
      const lx = tl.x+x_offset+beat_width*id;
      if(id % engine.beats_per_bar == 0){
        const model = WebGL.WebGL.rectangleModel(lx-line_thickness, ly, double_line, grid_height);
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        this.colour_shader.setColour(0.8, 0.8, 0.8);
      }else if(id % 1 == 0){
        const model = WebGL.WebGL.rectangleModel(lx-half_line, ly, line_thickness, grid_height);
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        this.colour_shader.setColour(0.6, 0.6, 0.6);
      }else{
        const model = WebGL.WebGL.rectangleModel(lx-half_line, ly, line_thickness, grid_height);
        this.colour_shader.setMvp(vp.multiplyCopy(model));
        this.colour_shader.setColour(0.2, 0.2, 0.6);
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
    }
    //hovered beat edge
    else if(engine.grid.hovered_note_edge != undefined){
      const colour = engine.hover_animation != undefined ? this.hover_transition_colours[engine.hover_animation] : this.edge_note_colour;
      this.drawNoteEdge(engine, engine.grid.hovered_note_edge, tl.x + x_offset, grid_y_offset, colour);
    }

    engine.bpm_text_input.draw(vp, this.colour_shader, this.text_drawer);
    this.text_drawer.drawText(vp, 620, 25, engine.bpm.toString(), 12);

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
    engine.note_snap_options.draw(vp, this.colour_shader, this.text_drawer);
    engine.note_add_options.draw(vp, this.colour_shader, this.text_drawer);

    if(engine.grid.hovered_note != undefined){
      this.drawNoteDetails(engine, engine.grid.hovered_note);
    }
    this.engineDetails(engine);
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
  drawNoteDetails(engine: MIDIEngine, note: MIDINote){
    const beat_text = `Beat ${note.beat.toFixed(2)}`;
    const length_text = `Length ${note.length.toFixed(2)}`;
    this.text_drawer.drawTextColour(engine.vp, 600, 105, note.id.toString(), 10, this.text_colour);
    this.text_drawer.drawTextColour(engine.vp, 600, 120, beat_text, 10, this.text_colour);
    this.text_drawer.drawTextColour(engine.vp, 600, 132, length_text, 10, this.text_colour);
  }
  engineDetails(engine: MIDIEngine){
    const ts = 8;
    if(engine.canvas_mouse != undefined){
      const bottom_line = engine.height-ts;
      const mouse_text = `x ${engine.canvas_mouse.x}, y ${engine.canvas_mouse.y}`
      const tw = this.text_drawer.getTextWidth(mouse_text, ts);
      const x = engine.width - tw;
      this.text_drawer.drawTextColour(engine.vp, x, bottom_line, mouse_text, ts, this.text_colour);


      this.text_drawer.drawTextColour(engine.vp, x-55, bottom_line, `R ${engine.grid.rightViewBeat().toFixed(2)}`, ts, this.text_colour);

      this.text_drawer.drawTextColour(engine.vp, x-110, bottom_line, `L ${engine.grid.leftViewBeat().toFixed(2)}`, ts, this.text_colour);
    }

  }
}