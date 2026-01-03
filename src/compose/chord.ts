import { BaseNote,  } from "./note";
import * as Note from "./note";

type Char = number;

const majorTriad = [0, 4, 7];

const major7 = [0, 4, 7, 11];

const major7Dom = [0, 4, 7, 10];

const minorTriad = [0, 3, 7];

const minor7 = [0, 3, 7, 10];

const ChordTypesEnum = {
  major: 0,
  major7: 1,
  major7Dom: 2,
  minor: 3
} as const;

type ChordTypes = (typeof ChordTypesEnum)[keyof typeof ChordTypesEnum];

const chordNoteMap:Map<ChordTypes, Char[]>  = new Map();
chordNoteMap.set(ChordTypesEnum.major, majorTriad);


function getNotes(base:BaseNote){
  base.note
}

export enum Chord{
  A = "A", B = "B", C = "C", D = "D", E = "E", F = "F", G = "G"
}

export const default_chord = Chord.A;
export const chord_choices = Object.values(Chord);

export class BaseChord{
  static fromNote(note: Note.RealNote, chord: ChordTypes): Note.RealNote[]{
    const chordOffsetArr = chordNoteMap.get(chord)!;
    const notes = chordOffsetArr.map((offset) => Note.RealNote.getRealNoteFromId(note.id+offset));
    return notes;
  }
}


export function tests(){
  Note.RealNote.printNotes();

  for(const i of minorTriad){
    console.log(Note.RealNote.getRealNoteFromId(i+1));
  }

  console.log(BaseChord.fromNote(Note.RealNote.getRealNote(Note.Note.C, Note.Accidental.None), ChordTypesEnum.major));

}

export function stringToChord(s: string): Chord{
  switch(s){
    case "A":
      return Chord.A;
    case "B":
      return Chord.B;
    case "C":
      return Chord.C;
    case "D":
      return Chord.D;
    case "E":
      return Chord.E;
    case "F":
      return Chord.F;
    case "G":
      return Chord.G;
    default:
      return Chord.A;
  }
}