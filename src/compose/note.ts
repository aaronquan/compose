
export const ATone = 440;

enum Accidental{
  None, Sharp, Flat
}

export enum Note{
  A = "A", B = "B", C = "C", D = "D", E = "E", F = "F", G = "G"
}

const noteMap: Map<number, NoteTone> = new Map();

const ANoteTone:NoteTone = {id: 0, octave: 4, notation:{note: Note.A, accidental: Accidental.None}, frequency: 440};

noteMap.set(0, 
  {id: 0, octave: 4, notation:{note: Note.A, accidental: Accidental.None}, frequency: 440}
);

let note = ANoteTone.notation;
for(let i = 0; i < 4; i++){
  note = nextBaseNote(note);
  //console.log(note);
}

const noteIdMap: Map<NoteTone, number> = new Map();

function hasSharp(n: Note): boolean{
  return n == Note.A || n == Note.C || n == Note.D || n == Note.F || n == Note.G;
}

function hasFlat(n: Note): boolean{
  return n == Note.A || n == Note.B || n == Note.D || n == Note.E || n == Note.G;
}

function baseNoteToString(bn:BaseNote){
  return 
}

export function nextNote(n: Note): Note{
  switch(n){
    case Note.A:
      return Note.B;
    case Note.B:
      return Note.C;
    case Note.C:
      return Note.D;
    case Note.D:
      return Note.E;
    case Note.E:
      return Note.F;
    case Note.F:
      return Note.G
    case Note.G:
      return Note.A;
  }
}

export function nextBaseNote(bn:BaseNote): BaseNote{
  if(bn.accidental == Accidental.None){
    if(hasSharp(bn.note)){
      return {note: nextNote(bn.note), accidental: Accidental.None};
    }else{
      return {note: bn.note, accidental: Accidental.Sharp};
    }
  }
  if(bn.accidental == Accidental.Sharp){
    const new_note = nextNote(bn.note);
    if(hasSharp(bn.note)){
      return {note: new_note, accidental: Accidental.None};
    }else{
      return {note: new_note, accidental: Accidental.Sharp};
    }
  }
  //flat accidental
  return {note: bn.note, accidental: Accidental.None};


  return {note: nextNote(bn.note), accidental: Accidental.None};
}

export function previouseBaseNote(){

}

export function stringToNote(s: string): Note{
  switch(s){
    case "A":
      return Note.A;
    case "B":
      return Note.B;
    case "C":
      return Note.C;
    case "D":
      return Note.D;
    case "E":
      return Note.E;
    case "F":
      return Note.F;
    case "G":
      return Note.G;
    default:
      return Note.A;
  }
}

type BaseNote = {
  note: Note,
  accidental: Accidental
}

type NoteTone = {
  id: number,
  notation: BaseNote,
  alternate_notation?: BaseNote,
  octave: number,
  frequency: number,
}



export function shiftTone(tone: number, shift: number):number{
  return tone*Math.pow(2, shift/12)
}