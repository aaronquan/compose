import * as MIDIConsts from "./consts";
import * as ArrayUtils from "./../utils/array";
import { MIDIEngine } from "./engine";

type Int32 = number;

export class Save{
  static note_split = ",";
  static id_split = ":";
  static noteToStr(note: MIDIConsts.MIDINote){
    return `${note.beat.toFixed(2)} ${note.length.toFixed(2)}`;
  }
  static strToNote(str: string, id: Int32): MIDIConsts.MIDINote{
    //todo
    const sp = str.split(" ");
    const note: MIDIConsts.MIDINote = {
      id, beat: parseFloat(sp[0]), 
      length: parseFloat(sp[1]), 
      state: MIDIConsts.NoteStateEnum.Default
    };
    return note;
  }
  static serialiseComposition(engine: MIDIEngine): string{

    const min_id = engine.min_id;
    const max_id = engine.max_id;

    //first line contains min_id,max_id

    let text = `${min_id.toString()},${max_id.toString()}\n`;

    for(const [id, note_arr] of engine.grid.notes){
      const notes = note_arr.getArray();
      const note_strs = notes.map((note) => {
        return Save.noteToStr(note);
      });
      if(note_strs.length != 0) text += `${id}${Save.id_split}${note_strs.join(Save.note_split)}\n`;
    }
    console.log(text);
    return text;
  }
  static deserialiseComposition(s: string): MIDIConsts.EngineSave{
    const lines = s.split('\n');
    const first_line = lines[0];
    const first_sp = first_line.split(",");
    const min_id = parseInt(first_sp[0]);
    const max_id = parseInt(first_sp[1]);
    
    const note_map: Map<Int32, ArrayUtils.SortedArray<MIDIConsts.MIDINote>> = new Map();
    for(let i = 1; i < lines.length; i++){
      const line = lines[i];
      if(line.length == 0){
        continue;
      }
      console.log(line);
      const l_sp = line.split(Save.id_split);
      const id = parseInt(l_sp[0]);
      const notes_str = l_sp[1].split(Save.note_split);
      const notes = notes_str.map((s:string) => Save.strToNote(s, id));
      note_map.set(id, new ArrayUtils.SortedArray(notes, MIDIConsts.MIDINoteCmp));
    }
    return {min_id, max_id, notes: note_map};
  }
  
}