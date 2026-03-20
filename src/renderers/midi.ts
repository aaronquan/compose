
import * as WebGL from "./../WebGL/globals";

type Int32 = number;
type Float = number;
const EmptyFunction: VoidFunction = () => {};


type Coord = {
  x: Int32,
  y: Int32
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

  scroll_height: Int32;
  scroll: Float;
  beat_header: boolean;

  scroll_drag: boolean;
  constructor(w: Int32, h: Int32){
    this.beat_width = 35;
    this.beat_gap = 0;
    this.beat_height = 30;
    this.top_left = new WebGL.Matrix.Point2D(50, 50);
    this.width = w;
    this.height = h;
    this.active_coord = undefined;
    this.header_coord = undefined;

    this.max_display_height = 800;
    this.max_display_width = 500;


    this.scroll_height = 20;
    this.scroll = 0.8;
    this.beat_header = true;

    this.scroll_drag = false;
  }
  
  mouseDown(canvas_point: WebGL.Matrix.Point2D){
    const grid_point = new WebGL.Matrix.Point2D(canvas_point.x-this.top_left.x, canvas_point.y-this.top_left.y);
    const bottom = this.displayHeight();
    const sbar_width = this.max_display_width/this.displayGridRatio();
    const sbar_leftover = this.max_display_width - sbar_width;
    const sbar_x = this.scroll*sbar_leftover;
    //test mouse over scroll bar
    console.log(grid_point);
    console.log(sbar_x);
    if(grid_point.y > bottom-this.scroll_height && grid_point.y < bottom && 
      grid_point.x > 0 && grid_point.x < this.max_display_width){
        if(grid_point.x > sbar_x && grid_point.x < sbar_x + sbar_width){
          console.log("inside scroll bar");
          this.scroll_drag = true;
        }else{
          this.setScroll(grid_point);
        }
    }else{
      // grid
    }
  }
  mouseUp(canvas_point: WebGL.Matrix.Point2D){
    this.scroll_drag = false;
    console.log(this.startDisplayX());
    console.log(this.endDisplayX());
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
    const px = Math.floor((grid_point.x-x_offset)/this.beat_width);
    const py = Math.floor(grid_point.y/this.beat_height);
    if(this.scroll_drag){
      this.setScroll(grid_point);
    }
    if(this.beat_header){
      if(this.insideGrid(canvas_point)){
        if(py == 0){
          this.header_coord = px;
          this.active_coord = undefined;
        }else{
          this.active_coord = new WebGL.Matrix.Point2D(px, py-1);
          this.header_coord = undefined;
        }
      }else{
        this.active_coord = undefined;
        this.header_coord = undefined;
      }
    }else{
      if(this.insideGrid(canvas_point)){
        this.header_coord = undefined;
        this.active_coord = new WebGL.Matrix.Point2D(px, py);
      }
    }
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
  constructor(width: Int32, height: Int32, canvas: HTMLCanvasElement){
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
  }
  getBarBeatFromId(id: Int32): BarBeat{
    const bar = Math.floor(id/this.beats_per_bar);
    const beat = id % this.beats_per_bar;
    return {bar, beat};
  }
  update(t: number): void {
    //throw new Error("Method not implemented.");
  }
  protected handleKeyDown(ev: KeyboardEvent): void {
    //throw new Error("Method not implemented.");
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
  }
  protected handleMouseDown(ev: MouseEvent): void {
    //console.log("click");
    if(this.canvas_mouse){
      this.grid.mouseDown(this.canvas_mouse);
    }
  }
  protected handleMouseUp(ev: MouseEvent): void {
    if(this.canvas_mouse){
      this.grid.mouseUp(this.canvas_mouse);
    }
  }
}

export class MIDIRenderer implements WebGL.App.IEngineRenderer<MIDIEngine>{
  colour_shader: WebGL.Shader.MVPColourProgram;
  text_drawer: WebGL.TextDrawer;
  fonts: WebGL.FontLoader;

  constructor(){
    this.colour_shader = new WebGL.Shader.MVPColourProgram();
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
    const line_thickness = 2;
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
        if(engine.grid.active_coord != undefined && engine.grid.active_coord.y == note-engine.min_id && engine.grid.active_coord.x == id){
          this.colour_shader.setColour(0.5, 1, 0.5);
        }else{
          this.colour_shader.setColour(1, 0.5, 0.5);
        }

        WebGL.Shapes.Quad.drawRelative();
        x += beat_width + beat_gap;
      }
    }
    gl.disable(gl.SCISSOR_TEST);

    
    //draw lines
    
    
    const right_grid = tl.x+grid_width;
    const bottom_grid = tl.y+grid_height;

    this.colour_shader.use();
    this.colour_shader.setColour(1, 1, 1);
    //border
    const double_line = line_thickness*2;
    //top
    const top_line_model = WebGL.WebGL.rectangleModel(tl.x, tl.y-line_thickness, grid_width, double_line);
    this.colour_shader.setMvp(vp.multiplyCopy(top_line_model));
    WebGL.Shapes.Quad.draw();
    //left
    const left_line_model = WebGL.WebGL.rectangleModel(tl.x-line_thickness, tl.y, double_line, grid_height);
    this.colour_shader.setMvp(vp.multiplyCopy(left_line_model));
    WebGL.Shapes.Quad.draw();
    //bot
    const bot_line_model = WebGL.WebGL.rectangleModel(tl.x, tl.y+grid_height-line_thickness, grid_width, double_line);
    this.colour_shader.setMvp(vp.multiplyCopy(bot_line_model));
    WebGL.Shapes.Quad.draw();
    //right
    const right_line_model = WebGL.WebGL.rectangleModel(tl.x+grid_width-line_thickness, tl.y, double_line, grid_height);
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