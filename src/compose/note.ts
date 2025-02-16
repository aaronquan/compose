
export const AToneFrequency = 440;

enum Accidental{
  Flat, None, Sharp
  //None, Sharp, Flat // old order
}

const accidentalStringMap:Map<Accidental, string> = new Map();
accidentalStringMap.set(Accidental.Flat, "b");
accidentalStringMap.set(Accidental.None, "");
accidentalStringMap.set(Accidental.Sharp, "#");

function accidentalToString(accidental:Accidental): string{
  return accidentalStringMap.get(accidental)!;
}

export enum Note{
  A, B, C, D, E, F, G
}

const noteStringMap:Map<Note, string> = new Map();
noteStringMap.set(Note.A, "A");
noteStringMap.set(Note.B, "B");
noteStringMap.set(Note.C, "C");
noteStringMap.set(Note.D, "D");
noteStringMap.set(Note.E, "E");
noteStringMap.set(Note.F, "F");
noteStringMap.set(Note.G, "G");

export function noteToString(n:Note): string{
  return noteStringMap.get(n)!;
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

/*
function getNoteId(n:Note): number{
  switch(n){
    case Note.A:
      return 0;
    case Note.B:
      return 1;
    case Note.C:
      return 2;
    case Note.D:
      return 3;
    case Note.E:
      return 4;
    case Note.F:
      return 5;
    case Note.G:
      return 6;
  }
}*/

function generateBaseNotes(): BaseNote[]{
  const base_notes = [];
  const accidental_order = [Accidental.Flat, Accidental.None, Accidental.Sharp];
  for(const note of Object.values(Note).filter((v) => typeof v !== "string")){
    for(const accidental of accidental_order){
      base_notes.push({note, accidental} as const);
    }
  }
  return base_notes;
}

const baseNotes = generateBaseNotes();
console.log(baseNotes);
//baseNotes[1].note = 4;

const baseNoteOrder = [1,2,4,7,8,10,11,13,16,17,19,20].map(i => baseNotes[i]);
console.log(baseNoteOrder); 

const baseNoteOrderFlat = [1,3,4,7,9,10,12,13,16,18,19,0].map(i => baseNotes[i]);
console.log(baseNoteOrderFlat);


export function getBaseNote(note:Note, accidental: Accidental):BaseNote{
  const index = (note as number)*3 + accidental as number;
  return baseNotes[index];
}

console.log(baseNoteToString(getBaseNote(Note.D, Accidental.Sharp)));

export function getBaseNoteFromString(){

}

export const noteToneMap: Map<number, NoteTone> = new Map();

//const ANoteTone:NoteTone = {id: 0, octave: 4, notation:{note: Note.A, accidental: Accidental.None}, frequency: 440};

//noteToneMap.set(0, 
//  {id: 0, octave: 4, notation:{note: Note.A, accidental: Accidental.None}, frequency: 440}
//);

//let note = ANoteTone.notation;
const middleOctave = 4;
const numNotes = 12;
//let base_note_index = 0;
//let pnote = ANoteTone.notation;
for(let i = 0; i <= 15; i++){
  //const current_note = note;
  const note = baseNoteOrder[i%numNotes];
  const octave = middleOctave + Math.floor(i/numNotes);
  console.log(baseNoteToString(note));
  const frequency = shiftTone(AToneFrequency, i);
  noteToneMap.set(i, {id: i, octave, notation: note, frequency})
}

for(let i = 0; i <= 15; i++){
  const note = baseNoteOrder[numNotes - i%numNotes];
  const octave = middleOctave - Math.floor(i/numNotes);
  const frequency = shiftTone(AToneFrequency, -i);
  noteToneMap.set(-i, {id: -i, octave, notation: note, frequency});
}
console.log(noteToneMap);

//const noteIdMap: Map<NoteTone, number> = new Map();

const alternateBaseNoteMap: Map<BaseNote, BaseNote> = new Map();

function baseNoteEquals(bn1:BaseNote, bn2:BaseNote): boolean{
  if(bn1.note == bn2.note && bn1.accidental == bn2.accidental){
    return true;
  }

  return false;
}

function hasSharp(n: Note): boolean{
  return n == Note.A || n == Note.C || n == Note.D || n == Note.F || n == Note.G;
}

function hasFlat(n: Note): boolean{
  return n == Note.A || n == Note.B || n == Note.D || n == Note.E || n == Note.G;
}

function baseNoteToString(bn:BaseNote): string{
  return `${noteToString(bn.note)}${accidentalToString(bn.accidental)}`;
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

export function previousNote(n:Note): Note{
  switch(n){
    case Note.A:
      return Note.G;
    case Note.B:
      return Note.A;
    case Note.C:
      return Note.B;
    case Note.D:
      return Note.C;
    case Note.E:
      return Note.D;
    case Note.F:
      return Note.E;
    case Note.G:
      return Note.F;
  }
}

export function nextBaseNote(bn:BaseNote): BaseNote{
  if(bn.accidental == Accidental.None){
    if(hasSharp(bn.note)){
      return getBaseNote(bn.note, Accidental.Sharp);
    }else{
      return getBaseNote(nextNote(bn.note), Accidental.None);
    }
  }
  if(bn.accidental == Accidental.Sharp){
    const new_note = nextNote(bn.note);
    if(hasSharp(bn.note)){
      return getBaseNote(new_note, Accidental.None);
    }else{
      return getBaseNote(new_note, Accidental.Sharp);
    }
  }
  //flat
  return getBaseNote(bn.note, Accidental.None);
}

export function previousBaseNote(bn: BaseNote): BaseNote{
  if(bn.accidental == Accidental.None){
    if(hasFlat(bn.note)){
      return getBaseNote(bn.note, Accidental.Flat);
    }else{
      return getBaseNote(previousNote(bn.note), Accidental.None);
    }
  }
  if(bn.accidental == Accidental.Flat){
    const new_note = previousNote(bn.note);
    if(hasFlat(bn.note)){
      return getBaseNote(new_note, Accidental.None);
    }else{
      return getBaseNote(new_note, Accidental.Flat);
    }
  }
  //sharp
  return getBaseNote(bn.note, Accidental.None);
}

export type BaseNote = {
  readonly note: Note,
  readonly accidental: Accidental
}

export type NoteTone = {
  readonly id: number,
  readonly notation: BaseNote,
  readonly alternate_notation?: BaseNote,
  readonly octave: number,
  readonly frequency: number,
}



export function shiftTone(tone: number, shift: number):number{
  return tone*Math.pow(2, shift/12)
}

function equivalentBaseNote(){
  const pairs = [
    {p1: {note: Note.A, accidental: Accidental.Sharp}, p2: {note: Note.B, accidental: Accidental.Flat}},
    {p1: {note: Note.C, accidental: Accidental.Sharp}, p2: {note: Note.D, accidental: Accidental.Flat}},
    {p1: {note: Note.D, accidental: Accidental.Sharp}, p2: {note: Note.E, accidental: Accidental.Flat}},
    {p1: {note: Note.F, accidental: Accidental.Sharp}, p2: {note: Note.G, accidental: Accidental.Flat}},
    {p1: {note: Note.G, accidental: Accidental.Sharp}, p2: {note: Note.A, accidental: Accidental.Flat}}
  ];
  const eq_base_note = new Map();
  for(const pair of pairs){
    eq_base_note.set(pair.p1, pair.p2);
    eq_base_note.set(pair.p2, pair.p1);
  }
  return eq_base_note;
}