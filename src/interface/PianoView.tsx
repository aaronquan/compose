import { useEffect, useRef, useState } from "react";
import { Accidental, hasSharp, Note, noteToString, RealNoteTone } from "../compose/note";
import { Oscillator } from "../compose/audio";
import update from 'immutability-helper';

const black_key_width_ratio = 0.7;
const black_key_height_ratio = 0.60;

const black_keys = [false, true, true, false, true, true, true];
//const black_start_position = [1, 2, 4, 5, 6].map((i) => i - (black_key_width/2));

type PianoViewProps = {
  audio_context: AudioContext;
  white_keys: number;
  white_notes_down: boolean[];
  black_notes_down: boolean[];
  starting_note?: Note;
  onKeyboardNoteDown?: (note_find: VisualNoteFind) => void;
  onKeyboardNoteUp?: (note_find: VisualNoteFind) => void;
}

type VisualNoteId = {
  is_black: boolean;
  id: number;
}

export type VisualNoteFind = {
  note_tone: RealNoteTone,
  visual_note: VisualNoteId
}

export function PianoView(props: PianoViewProps){
  const [keysDown, setKeysDown] = useState([]);
  const oscillator = useRef(new Oscillator(props.audio_context));
  const starting_note = props.starting_note != undefined ? props.starting_note : Note.A;

  //const [whiteNotesDown, setWhiteNotesDown] = useState<boolean[]>([...Array(props.white_keys)].map(() => false));
  //const [blackNotesDown, setBlackNotesDown] = useState<boolean[]>([...Array(props.white_keys)].map(() => false));
  const [hoveredNote, setHoveredNote] = useState<VisualNoteFind | undefined>(undefined);
  const note_pressed = useRef<VisualNoteFind | null>(null);

  function findNoteFrom(x: number, y: number): VisualNoteFind{
    const white_note = x / key_width;
    const note_id = (Math.floor(white_note)+starting_note);
    const octave = Math.floor(note_id/7);
    const note:Note = note_id % 7;

    //check black notes
    //black y
    const is_black_y = y <= black_key_height_ratio*height;

    const white_key_edge = (x / key_width ) % 1;
    const bottom_edge = white_key_edge <= 0.5;
    const edge_distance = bottom_edge ? white_key_edge : 1 - white_key_edge;

    const is_black_x = edge_distance < (black_key_width_ratio/2);
    const acc_note = bottom_edge ? (note+6)%7 : note;
    const accidental = is_black_y && is_black_x && hasSharp(acc_note) ? Accidental.Sharp : Accidental.None;

    const note_adj = accidental == Accidental.Sharp ? acc_note : note //adjustment to the note
    const real_note = RealNoteTone.getNoteToneFromNoteAndOctave(note_adj, accidental, octave);
    const vis_id = accidental == Accidental.Sharp && !bottom_edge ? Math.floor(white_note)+1 : Math.floor(white_note);
    const visual: VisualNoteId = {is_black: accidental == Accidental.Sharp, id: vis_id};
    return {
      note_tone: real_note,
      visual_note: visual,
    }
  }

  function onPlayNote(e: React.MouseEvent<SVGSVGElement>){
    /*
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const vis_note_find: VisualNoteFind = findNoteFrom(x, y);
    if(!vis_note_find.visual_note.is_black){
      setWhiteNotesDown(update(whiteNotesDown, {[vis_note_find.visual_note.id]: {$set: true}}));
    }else{
      setBlackNotesDown(update(blackNotesDown, {[vis_note_find.visual_note.id]: {$set: true}}));
    }*/

  }

  function handleMoveOnKeys(e: React.MouseEvent<SVGSVGElement>){
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const vis_note_find = findNoteFrom(x, y);
    setHoveredNote(vis_note_find);
  }
  function handleMoveOffKeys(e: React.MouseEvent<SVGSVGElement>){
    setHoveredNote(undefined);
  }

  function handleVisualNotePress(e: React.MouseEvent<SVGSVGElement>){
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const vis_note_find: VisualNoteFind = findNoteFrom(x, y);
    /*
    if(!vis_note_find.visual_note.is_black){
      setWhiteNotesDown(update(whiteNotesDown, {[vis_note_find.visual_note.id]: {$set: true}}));
    }else{
      setBlackNotesDown(update(blackNotesDown, {[vis_note_find.visual_note.id]: {$set: true}}));
    }*/
    note_pressed.current = {...vis_note_find};
    props.onKeyboardNoteDown?.(vis_note_find);
    console.log(vis_note_find.note_tone);
  }

  function handleVisualNoteRelease(e: React.MouseEvent<SVGSVGElement>){
    if(note_pressed.current != null){
      /*
      if(!note_pressed.current.visual_note.is_black){
        setWhiteNotesDown(update(whiteNotesDown, {[note_pressed.current.visual_note.id]: {$set: false}}));
      }else{
        setBlackNotesDown(update(blackNotesDown, {[note_pressed.current.visual_note.id]: {$set: false}}));
      }*/
      /*
      const note_id = note_pressed.current.id;
      const octave = Math.floor(note_id/7);
      const accidental = note_pressed.current.is_black ? Accidental.Sharp : Accidental.None;
      const real_note = RealNoteTone.getNoteToneFromNoteAndOctave(note_id%7, accidental, octave);*/
      props.onKeyboardNoteUp?.(note_pressed.current);
    }

    note_pressed.current = null;
  }

  const key_width = 30;
  const height = 100;
  //console.log(props.white_notes_down);
  return(
    <svg width={key_width*props.white_keys} height={height}
    onMouseDown={handleVisualNotePress} 
    onMouseUp={handleVisualNoteRelease} 
    onMouseMove={handleMoveOnKeys} 
    onMouseLeave={handleMoveOffKeys}>
      {[...Array(props.white_keys).keys()].map((i) => {
        //console.log(`white key: ${i}`);
        const isHovered = hoveredNote != undefined && !hoveredNote.visual_note.is_black && hoveredNote.visual_note.id == i;
      return <WhiteKey key={i} 
      hovered={isHovered} down={props.white_notes_down[i]} 
      x={i*key_width} width={key_width} height={height}
      />
      })}
      {
        [...Array(props.white_keys).keys()].map((i) => {
          const has_black_key = i !== 0 && black_keys[(i+(props.starting_note ? props.starting_note.valueOf() : 0))%black_keys.length];
          if(has_black_key){
            //console.log(`black key: ${i}`);
          }
          const isHovered = hoveredNote != undefined && hoveredNote.visual_note.is_black && hoveredNote.visual_note.id == i;
        return has_black_key && 
        <BlackKey key={i} x={(i-black_key_width_ratio/2)*key_width}
        down={props.black_notes_down[i]} hovered={isHovered}
        width={black_key_width_ratio*key_width} height={black_key_height_ratio*height}
        />
      })}
      {
        <text x={5} y={height-5}>{noteToString(starting_note)}</text>
      }

    </svg>
  )
}

type VisualKeyProps = {
  down:boolean;
  hovered:boolean;
  width: number;
  height: number;
  x: number;
}

function WhiteKey(props: VisualKeyProps){
  return(
    <rect x={props.x} y={0} width={props.width} height={props.height}
    fill={props.hovered ? "blue" : (props.down ? "red":"white")} 
    style={{stroke: props.hovered ? "blue" : (props.down ? "red":"grey"), strokeWidth:2}}
     />
  )
}

function BlackKey(props: VisualKeyProps){
  return(
    <rect x={props.x} y={0} width={props.width} height={props.height}
    fill={props.hovered ? "blue" : (props.down ? "red":"black")} 
    style={{stroke: props.hovered ? "blue" : (props.down ? "red":"grey"), strokeWidth:2}}/>
  )
}

type PianoCanvasProps = {
  white_keys: number;
  key_width: number;
  key_height: number;
  black_key_height_ratio: number;
  black_key_width_ratio: number;
  starting_note: Note;
  notes_down: boolean[];
  black_notes_down: boolean[];
  onKeyboardNoteDown: (note_find: VisualNoteFind) => void;
  onKeyboardNoteUp: (note_find: VisualNoteFind) => void;
};

export function PianoCanvas(props: PianoCanvasProps){
  const cv = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const notes_down = useRef<boolean[]>([]);
  const black_notes_down = useRef<boolean[]>([]);
  const mouse_down = useRef<VisualNoteFind | null>(null);
  const mouse_over = useRef<VisualNoteFind | null>(null);
  useEffect(() => {
    const can = cv.current;
    if(can != null){
      can.width = props.key_width*props.white_keys;
      can.height = props.key_height;
      context.current = can.getContext("2d")!;
      const ctx = context.current;
      draw();
    }
  }, []);
  useEffect(() => {
    notes_down.current = props.notes_down;
  }, [props.notes_down]);
  function draw(){
    const ctx = context.current;

    const black_key_height = props.black_key_height_ratio*props.key_height;
    const black_key_width = props.black_key_width_ratio*props.key_width;

    if(ctx != null){
      ctx.fillStyle =  "white";
      ctx.fillRect(0,0, props.key_width*props.white_keys, props.key_height);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      ctx.beginPath();
      //horizontal lines
      ctx.moveTo(0, 0);
      ctx.lineTo(props.key_width*props.white_keys, 0);
      ctx.lineTo(props.key_width*props.white_keys, props.key_height);
      ctx.lineTo(0, props.key_height);
      ctx.lineTo(0, 0);


      //hovered key
      /*
      if(mouse_over.current){
        const vis_note = mouse_over.current.visual_note;
        ctx.fillStyle = "grey";
        if(vis_note.is_black){
          const x = props.key_width*vis_note.id - black_key_width/2;
          ctx.fillRect(x, 0, black_key_width, black_key_height);
        }else{
          const x = props.key_width*vis_note.id;
          ctx.fillRect(x, 0, props.key_width, props.key_height);
        }
      }*/

      //mouse pressed key
      /*
      if(mouse_down.current){
        const vis_note = mouse_down.current.visual_note;
        ctx.fillStyle = "black";
        
        if(vis_note.is_black){
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          const x = props.key_width*vis_note.id - black_key_width/2;
          ctx.fillRect(x, 0, black_key_width, black_key_height);
        }else{
          const x = props.key_width*vis_note.id;
          ctx.fillRect(x, 0, props.key_width, props.key_height);
        }
      }
      */

      //
      for(let i = 1; i < props.white_keys; i++){
        const x = props.key_width*i;
        
        ctx.moveTo(x, 0);
        ctx.lineTo(x, props.key_height);
        const mo = mouse_over.current;
        if(mo){
          if(!mo.visual_note.is_black && mo.visual_note.id == i){
            ctx.fillStyle = "grey";
            ctx.fillRect(x, 0, props.key_width, props.key_height);
          }
        }
        const md = mouse_down.current;
        if(md){
          if(!md.visual_note.is_black && md.visual_note.id == i){
            ctx.fillStyle = "black";
            ctx.fillRect(x, 0, props.key_width, props.key_height);
          }
        }
        if(notes_down.current[i]){
          ctx.fillStyle = "blue";
          ctx.fillRect(x, 0, props.key_width, props.key_height);
        }
      }
      ctx.stroke();
      ctx.fillStyle = "blue";
      
      for(let i = 0; i < props.notes_down.length; i++){
        
        const x = props.key_width*i;
        if(props.notes_down[i]){
          ctx.fillRect(x, 0, props.key_width, props.key_height);
        }
      }
      //for(let i = 0; )
      //ctx.moveTo
      //const black_key_height = props.black_key_height_ratio*props.key_height;
      //const black_key_width = props.black_key_width_ratio*props.key_width;
      for(let i = 0; i < props.white_keys; i++){
        const has_black_key = i !== 0 && black_keys[(i+(props.starting_note ? props.starting_note.valueOf() : 0))%black_keys.length];
        if(has_black_key){
          const x = i*props.key_width-(black_key_width/2);
          ctx.fillStyle = "black";
          ctx.fillRect(x, 0, black_key_width, black_key_height);
          
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, black_key_height);
          ctx.lineTo(x+black_key_width, black_key_height);
          ctx.lineTo(x+black_key_width, 0);
          ctx.stroke();
        }
      }
      //can't remember what i was doing?
      ctx.fillStyle = "grey";
      ctx.beginPath();

      //ctx.moveTo();

      requestAnimationFrame(draw);  
    }
  }
  function findNoteFrom(x: number, y: number): VisualNoteFind{
    const white_note = x / props.key_width;
    const note_id = (Math.floor(white_note)+props.starting_note);
    const octave = Math.floor(note_id/7);
    const note:Note = note_id % 7;

    //check black notes
    //black y
    const is_black_y = y <= black_key_height_ratio*props.key_height;

    const white_key_edge = (x / props.key_width ) % 1;
    const bottom_edge = white_key_edge <= 0.5;
    const edge_distance = bottom_edge ? white_key_edge : 1 - white_key_edge;

    const is_black_x = edge_distance < (black_key_width_ratio/2);
    const acc_note = bottom_edge ? (note+6)%7 : note;
    const accidental = is_black_y && is_black_x && hasSharp(acc_note) ? Accidental.Sharp : Accidental.None;

    const note_adj = accidental == Accidental.Sharp ? acc_note : note //adjustment to the note
    const real_note = RealNoteTone.getNoteToneFromNoteAndOctave(note_adj, accidental, octave);
    const vis_id = accidental == Accidental.Sharp && !bottom_edge ? Math.floor(white_note)+1 : Math.floor(white_note);
    const visual: VisualNoteId = {is_black: accidental == Accidental.Sharp, id: vis_id};
    return {
      note_tone: real_note,
      visual_note: visual,
    }
  }
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>){
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const vnf = findNoteFrom(x, y);
    console.log(vnf);
    props.onKeyboardNoteDown(vnf);
    mouse_down.current = vnf;
  }
  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>){
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const vnf = findNoteFrom(x, y);
    console.log(vnf);
    props.onKeyboardNoteUp(vnf);
    mouse_down.current = null;
  }
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>){
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const vnf = findNoteFrom(x, y);
    mouse_over.current = vnf;
    console.log(vnf);
  }
  function handleMouseLeave(e: React.MouseEvent<HTMLCanvasElement>){
    mouse_over.current = null;
  }
  return (
    <canvas ref={cv} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}/>
  );
}


export default PianoView;