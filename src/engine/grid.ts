import * as WebGL from "./../WebGL/globals";
import * as ArrayUtils from "./../utils/array";
import * as MIDIEngine from "./engine";
import * as MIDIConsts from "./consts";

//regular types
type Int32 = number;
type Float = number;
type VoidFunction = () => void;
const EmptyFunction: VoidFunction = () => {};

type Coord = {
  x: Int32,
  y: Int32
}

//MIDI Engine types
/*

type MIDIConsts.MIDINote = MIDIEngine.MIDIConsts.MIDINote;


const MIDIConsts.NoteStateEnum = {
  Default: 0,
  Playing: 1,
  Hovered: 2,
  Selected: 3,
  Preview: 4, //special case for adding notes
} as const;
type NoteState = MIDIEngine.NoteState;

const MIDIConsts.GridEditStateEnum = {
  Default: 0,
  Adding: 1,
  Deleting: 2,
} as const;
type MIDIConsts.GridEditState = MIDIEngine.MIDIConsts.GridEditState;

function MIDIConsts.MIDINoteCmp(n1: MIDIConsts.MIDINote, n2: MIDIConsts.MIDINote): Int32{
  return n1.beat - n2.beat;
}

type Coord = {
  x: Int32,
  y: Int32
}

type MIDIConsts.MIDINoteEdge = {
  is_low_edge: boolean;
  note: MIDIConsts.MIDINote;
}

type MIDIConsts.NoteIdFloat = {
  id: Int32,
  beat_fl: Float
}
*/

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
  mouse_beat_float: MIDIConsts.NoteIdFloat | undefined;

  scroll_height: Int32;
  scroll: Float;
  beat_header: boolean;

  scroll_drag: boolean;

  notes: Map<Int32, ArrayUtils.SortedArray<MIDIConsts.MIDINote>>;
  hovered_note: MIDIConsts.MIDINote | undefined;
  dragged_note: MIDIConsts.MIDINote | undefined;
  dragged_note_index: Int32;
  drag_beat_offset: Float;

  dragged_note_edge: MIDIConsts.MIDINoteEdge | undefined;
  hovered_note_edge: MIDIConsts.MIDINoteEdge | undefined;

  selected_notes: Map<Int32, Set<MIDIConsts.MIDINote>>;

  edit_state: MIDIConsts.GridEditState;

  onNewEdgeHovered: VoidFunction;

  note_snap: Float | undefined;
  note_add_length: Float;

  note_add_preview: MIDIConsts.MIDINote | undefined;

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

    this.edit_state = MIDIConsts.GridEditStateEnum.Default;

    this.onNewEdgeHovered = EmptyFunction;


    this.note_snap = undefined;
    this.note_add_length = 1;

    this.note_add_preview = undefined;
  }
  
  mouseDown(canvas_point: WebGL.Matrix.Point2D){
    const grid_point = new WebGL.Matrix.Point2D(canvas_point.x-this.top_left.x, canvas_point.y-this.top_left.y);
    const bottom = this.displayHeight();
    const sbar_width = this.max_display_width/this.displayGridRatio();
    const sbar_leftover = this.max_display_width - sbar_width;
    const sbar_x = this.scroll*sbar_leftover;
    //test mouse over scroll bar
    //note editing (edges, beat reposition)

    //scroll / adding notes
    if(this.insideGrid(canvas_point)){
      //scrolling
      if(this.insideScrollBar(grid_point)){
        if(grid_point.x > sbar_x && grid_point.x < sbar_x + sbar_width){
          this.scroll_drag = true;
        }else{
          this.setScroll(grid_point);
        }
      }
      //adding
      else if(this.edit_state == MIDIConsts.GridEditStateEnum.Adding){
        //const coord = this.active_coord!;
        if(this.note_add_preview != undefined){
          this.addNote(this.note_add_preview.id, this.note_add_preview.beat, this.note_add_length);
        }
      }else if(this.edit_state == MIDIConsts.GridEditStateEnum.Deleting){
        //deleting
        const index = this.getHoveredNoteIndex()!;
        const notes = this.notes.get(this.hovered_note!.id);
        if(notes != undefined){
          notes.remove(index);
        }
        console.log("removing");
        this.hovered_note = undefined;

      }else{
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
        console.log("other");
      }
    }
  }
  addNote(note_id: Int32, beat: Float, length: Float=1){

    console.log("trying to add note");
    if(!this.notes.has(note_id)){
      this.notes.set(note_id, new ArrayUtils.SortedArray([], MIDIConsts.MIDINoteCmp));
    }
    //check intersecting
    const notes = this.notes.get(note_id)!;
    const sea = {id: note_id, beat: beat+(length*0.5), length: 0, state: MIDIConsts.NoteStateEnum.Default};
    const index = notes.lowerBound(sea) - 1;
    const note = notes.get(index);
    const next_note = notes.get(index+1);
    //console.log(
    if(note != undefined){
      console.log(note);
      console.log(next_note);
      if(next_note != undefined){
        if(beat >= note.beat + note.length && beat + length < next_note.beat){
          console.log("new note added between");
          //can add
          notes.add({id: note_id, beat, length, state: MIDIConsts.NoteStateEnum.Default});
        }else{
          //blocked
          console.log("blocked both sides");
        }
      }else{
        if(beat >= note.beat + note.length && beat+length <= this.width){
          console.log("new note added");
          notes.add({id: note_id, beat, length, state: MIDIConsts.NoteStateEnum.Default});
        }
      }
    }else{
      console.log("new note added");
      notes.add({id: note_id, beat, length, state: MIDIConsts.NoteStateEnum.Default});
    }
    if(this.mouse_beat_float != undefined){
      this.hovered_note_edge = this.noteEdge(this.mouse_beat_float);
    }
  }
  mouseUp(canvas_point: WebGL.Matrix.Point2D){
    this.scroll_drag = false;
    this.dragged_note = undefined;
    this.dragged_note_edge = undefined;
  }
  getHoveredNote(): MIDIConsts.MIDINote | undefined{
    
    if(this.mouse_beat_float != undefined){
      //console.log(this.mouse_beat_float);
      const notes = this.notes.get(this.mouse_beat_float.id);
      if(notes != undefined){
        const index = this.getHoveredNoteIndex();
        if(index != undefined){
          return notes.get(index);
        }
        return undefined;
      }
    }
    return undefined;
  }
  getHoveredNoteIndex(): Int32 | undefined{
    if(this.mouse_beat_float != undefined){
      //console.log(this.mouse_beat_float);
      const notes = this.notes.get(this.mouse_beat_float.id);
      if(notes != undefined){
        const sea = {id: this.mouse_beat_float.id, beat: this.mouse_beat_float.beat_fl, length: 0, state: MIDIConsts.NoteStateEnum.Default};
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
  closestNote(note_id_fl: MIDIConsts.NoteIdFloat): MIDIConsts.MIDINote | undefined{
    const notes = this.notes.get(note_id_fl.id);
    if(notes != undefined){
      const index = this.closestNoteIndex(note_id_fl);
      if(index != undefined){
        return notes.get(index);
      }
      return undefined;
    }
    return undefined;
  }
  closestNoteIndex(note_id_fl: MIDIConsts.NoteIdFloat): Int32 | undefined{
    if(note_id_fl != undefined){
      const notes = this.notes.get(note_id_fl.id);
      if(notes != undefined){
        const sea = {id: note_id_fl.id, beat: note_id_fl.beat_fl, length: 0, state: MIDIConsts.NoteStateEnum.Default};
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
  noteEdge(beat_float: MIDIConsts.NoteIdFloat, edge_amount: Float=0.1): MIDIConsts.MIDINoteEdge | undefined{
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
  static isNewEdge(new_edge: MIDIConsts.MIDINoteEdge | undefined, old_edge: MIDIConsts.MIDINoteEdge | undefined): boolean{
    if(new_edge != undefined){
      if(old_edge == undefined){
        return true;
      }
      if(new_edge.is_low_edge != old_edge.is_low_edge && new_edge.note != old_edge.note){
        return true;
      }
    }

    return false;
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
  getSnapBeat(beat_float: Float, offset: Float, snap: Float | undefined): Float{
    let new_beat = beat_float - offset;
    if(snap != undefined){
      const floor_beat = Math.floor(new_beat);
      let closest_snap = floor_beat;
      for(let i = snap; i <= 1; i += snap){
        if(Math.abs(new_beat - (floor_beat + i)) < Math.abs(new_beat - closest_snap)){
          closest_snap = (floor_beat + i);
        }
      }
      new_beat = closest_snap;
    }
    return new_beat;
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
    if(this.mouse_beat_float != undefined){
      const notes = this.notes.get(this.mouse_beat_float.id);
      const active_note = (notes != undefined && hovered_index != undefined) ? notes.get(hovered_index) : undefined;
      if(active_note != undefined){
        active_note.state = MIDIConsts.NoteStateEnum.Hovered;
        if(this.hovered_note != undefined && (this.hovered_note.beat !== active_note.beat || this.hovered_note.id !== active_note.id)){
          this.hovered_note.state = MIDIConsts.NoteStateEnum.Default;
        }
        this.hovered_note = active_note;
      }else{
        if(this.hovered_note != undefined){
          this.hovered_note.state = MIDIConsts.NoteStateEnum.Default;
        }
        this.hovered_note = undefined;
      }

      //setting hovered edge
      //this.hovered_note_edge = undefined;
      const new_edge = this.noteEdge(this.mouse_beat_float);
      if(MIDIGrid.isNewEdge(new_edge, this.hovered_note_edge)){
        this.onNewEdgeHovered();
      }
      this.hovered_note_edge = new_edge;

      //dragging note
      if(this.dragged_note != undefined && this.dragged_note_index != undefined && notes != undefined){
        let new_beat = this.getSnapBeat(this.mouse_beat_float.beat_fl, this.drag_beat_offset, this.note_snap);
        /*let new_beat = this.mouse_beat_float.beat_fl-this.drag_beat_offset;
        if(this.note_snap != undefined){
          const floor_beat = Math.floor(new_beat);
          let closest_snap = floor_beat;
          for(let i = this.note_snap; i <= 1; i+=this.note_snap){
            if(Math.abs(new_beat - (floor_beat + i)) < Math.abs(new_beat - closest_snap)){
              closest_snap = (floor_beat + i);
            }
          }

          new_beat = closest_snap;
          //console.log(new_beat);
          //console.log(closest_snap);
        }*/
        const before_note = notes.get(this.dragged_note_index-1);
        const after_note = notes.get(this.dragged_note_index+1);
        if(before_note != undefined && after_note != undefined){
          //note before and after
          if(new_beat < before_note.beat+before_note.length){
            this.dragged_note.beat = before_note.beat+before_note.length;
          }else if(after_note.beat < new_beat+this.dragged_note.length){
            //note after
            this.dragged_note.beat = after_note.beat-this.dragged_note.length;
          }else{
            this.dragged_note.beat = new_beat;
          }
        }
        else if(before_note == undefined && after_note == undefined){
          //no note before or after
          if(new_beat < 0){
            this.dragged_note.beat = 0;
          }else if(new_beat + this.dragged_note.length > this.width){
            //last note cannot be dragged past end
            this.dragged_note.beat = this.width-this.dragged_note.length;
            /*
            if(this.note_snap != undefined){
              while(new_beat + this.dragged_note.length > this.width){
                new_beat -= this.note_snap;
              }
              this.dragged_note.beat = new_beat;
            }else{
              //console.log(this.width-this.dragged_note.length);
              this.dragged_note.beat = this.width-this.dragged_note.length;
            }*/
          }else{
            this.dragged_note.beat = new_beat;
          }
        }else if(before_note != undefined && after_note == undefined){
          //note before and no note after
          if(new_beat + this.dragged_note.length > this.width){
            //last note cannot be dragged past end
            if(this.note_snap != undefined){
              while(new_beat + this.dragged_note.length > this.width){
                new_beat -= this.note_snap;
              }
              this.dragged_note.beat = new_beat;
            }else{
              this.dragged_note.beat = this.width-this.dragged_note.length;
            }
          }else if(new_beat < before_note.beat+before_note.length){
            //note before
            this.dragged_note.beat = before_note.beat+before_note.length;
          }else{
            this.dragged_note.beat = new_beat;
          }
        }else if(before_note == undefined && after_note != undefined){
          //no note before and note after
          if(new_beat < 0){
            this.dragged_note.beat = 0;
          }else if(after_note.beat < new_beat+this.dragged_note.length){
            //note after intersection
            this.dragged_note.beat = after_note.beat-this.dragged_note.length;
          }else{
            this.dragged_note.beat = new_beat;
          }
        }

        /*
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
        }*/
      }


      //dragging note edge to resize note
      if(this.mouse_beat_float != undefined && this.dragged_note_edge != undefined && notes != undefined){
        if(this.dragged_note_edge.is_low_edge){
          //for low drag beat edge side
          let new_beat = this.getSnapBeat(this.mouse_beat_float.beat_fl, this.drag_beat_offset, this.note_snap);
          
          /*
          let new_beat = this.mouse_beat_float.beat_fl-this.drag_beat_offset;
          if(this.note_snap != undefined){
            const floor_beat = Math.floor(new_beat);
            let closest_snap = floor_beat;
            for(let i = this.note_snap; i <= 1; i+=this.note_snap){
              if(Math.abs(new_beat - (floor_beat + i)) < Math.abs(new_beat - closest_snap)){
                closest_snap = (floor_beat + i);
              }
            }
            new_beat = closest_snap;
          }*/

          const before_note = notes.get(this.dragged_note_index-1);
          console.log(this.dragged_note_index);
          if(before_note != undefined && before_note.beat+before_note.length > new_beat){
            //prevent overlap before note
            this.dragged_note_edge.note.beat = before_note.beat+before_note.length;
            this.dragged_note_edge.note.length = this.dragged_note_edge.note.beat - this.dragged_note_edge.note.beat + this.dragged_note_edge.note.length;
          }else{
            const new_length = this.dragged_note_edge.note.beat - new_beat + this.dragged_note_edge.note.length;
            this.dragged_note_edge.note.beat = new_beat;
            this.dragged_note_edge.note.length = new_length;
          }
        }else{
          let new_beat = this.getSnapBeat(this.mouse_beat_float.beat_fl, this.drag_beat_offset, this.note_snap);
          const after_note = notes.get(this.dragged_note_index+1);
          if(after_note != undefined && after_note.beat < new_beat){
            const new_length = after_note.beat - this.dragged_note_edge.note.beat;
            this.dragged_note_edge.note.length = new_length;
          }else{
            const new_length = new_beat - this.dragged_note_edge.note.beat;
            this.dragged_note_edge.note.length = new_length;
          }
        }
      }

      // adding note preview
      if(this.edit_state == MIDIConsts.GridEditStateEnum.Adding){
        this.note_add_preview = {
          id: this.mouse_beat_float.id, beat: this.getSnapBeat(this.mouse_beat_float.beat_fl-(this.note_add_length*0.5), 0, this.note_snap), 
          length: this.note_add_length, state: MIDIConsts.NoteStateEnum.Preview
        };
      }else{
        this.note_add_preview = undefined;
      }
    }else{
      if(this.hovered_note != undefined){
        this.hovered_note.state = MIDIConsts.NoteStateEnum.Default;
      }
      this.hovered_note = undefined;
      this.note_add_preview = undefined;
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