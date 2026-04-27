import * as MIDIConsts from "./consts";
import * as ArrayUtils from "./../utils/array";
import { MIDIEngine } from "./engine";


export class Save{
  static noteToStr(note: MIDIConsts.MIDINote){
    return `${note.beat.toFixed(2)} ${note.length.toFixed(2)}`;
  }
  static strToNote(str: string): MIDIConsts.MIDINote{
    //todo

  }
  static serialiseComposition(engine: MIDIEngine): string{
    let text = "";

    const sid = engine.min_id;
    for(const [id, note_arr] of engine.grid.notes){
      const notes = note_arr.getArray();
      const note_strs = notes.map((note) => {
        return Save.noteToStr(note);
      });
      if(note_strs.length != 0) text += `${id} ${note_strs.join(",")}`;
    }
    console.log(text);
    return text;
  }
  static deserialiseComposition(s: string){

  }
}