import { CircularArray } from "../utils/array";

interface Enum {
  readonly [index: number | string]: string | number;
};

function enumToArray(e: Enum){
  return Object.values(e).filter((v) => typeof v !== "string");
}


export const AToneFrequency = 440;

export const MiddleCId = -9;

export enum Accidental{
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
  C, D, E, F, G, A, B
}

export const black_keys = [false, true, true, false, true, true, true];

class NoteUtils{
  static asArray = new CircularArray<number>(enumToArray(Note));
  static toString(n:Note): string{
    return noteStringMap.get(n)!;
  }
  static nextNotes(n: Note, i: number): Note{
    const id = (n.valueOf() + i);
    return NoteUtils.asArray.get(id);
  }
}

console.log(NoteUtils.asArray)

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

/*
0 - Cb, 1 - C, 2 - C#
3 - Db, 4 - D, 5 - D#
6 - Eb, 7 - E, 8 - E#
9 - Fb, 10 - F, 11 - F#
12 - Gb, 13 - G, 14 - G#
15 - Ab, 16 - A, 17 - A# 
18 - Bb, 19 - B, 20 - B#
*/

type BaseNoteId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

class RealBaseNote{
  private static baseNotes: RealBaseNote[] = RealBaseNote.generateBaseNotes();
  note:Note;
  accidental: Accidental;
  id: BaseNoteId;
  private constructor(note: Note, accidental: Accidental){
    this.note = note;
    this.accidental = accidental;
    this.id = RealBaseNote.getId(note, accidental);
  }

  toString(): string{
    return `${noteToString(this.note)}${accidentalToString(this.accidental)}`
  }

  private static generateBaseNotes(): RealBaseNote[]{
    const base_notes: RealBaseNote[] = [];
    const accidental_order = [Accidental.Flat, Accidental.None, Accidental.Sharp];
    for(const note of Object.values(Note).filter((v) => typeof v !== "string")){
      for(const accidental of accidental_order){
        base_notes.push(new RealBaseNote(note, accidental));
      }
    }
    return base_notes;
  }

  static getNoteFromId(id: number): RealBaseNote | null{
    if(id >= RealBaseNote.baseNotes.length) return null;
    return RealBaseNote.baseNotes[id];
  }

  static getId(note:Note, accidental: Accidental): BaseNoteId{
    return note.valueOf()*3+accidental.valueOf() as BaseNoteId;
  }

  static getNote(note: Note, accidental: Accidental){
    const id = RealBaseNote.getId(note, accidental);
    return this.getNoteFromId(id);
  }
}
console.log(RealBaseNote.getNote(Note.F, Accidental.Sharp));



function generateBaseNotes(): BaseNote[]{
  const base_notes = [];
  const accidental_order = [Accidental.Flat, Accidental.None, Accidental.Sharp];
  for(const note of Object.values(Note).filter((v) => typeof v !== "string")){
    for(const accidental of accidental_order){
      base_notes.push({note, accidental});
    }
  }
  return base_notes;
}

const baseNotes = generateBaseNotes();
console.log(baseNotes);
//baseNotes[1].note = 4;

const baseNoteAOrder = [1,2,4,7,8,10,11,13,16,17,19,20].map(i => baseNotes[i]);
console.log(baseNoteAOrder); 

const baseNoteAOrderFlat = [1,3,4,7,9,10,12,13,16,18,19,0].map(i => baseNotes[i]);
console.log(baseNoteAOrderFlat);

const baseNoteCOrder = [1, 2, 4, 5, 7, 10, 11, 13, 14, 16, 17, 19];

const baseNoteCOrderNotes = baseNoteCOrder.map(i => baseNotes[i]);

type RealNoteId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;


// notes that a piano would play in ids
export class RealNote{
  private static baseNoteToNoteIdMap: Map<BaseNoteId, RealNoteId> = new Map([
    [0, 11], [1,0], [2, 1], [3, 1], [4, 2], [5, 3],
    [6, 3], [7, 4], [8, 5], [9, 4], [10, 5], [11, 6],
    [12, 6], [13, 7], [14, 8], [15, 8], [16, 9],
    [17, 10], [18, 10], [19, 11], [20, 0]
  ]);
  private static real_notes:CircularArray<RealNote> = RealNote.generateRealNotes();
  base_note: RealBaseNote;
  variant: RealBaseNote | null;
  id: RealNoteId;

  constructor(note: Note, accidental:Accidental){
    this.base_note = RealBaseNote.getNote(note, accidental)!;
    this.variant = this.getVariant();
    this.id = RealNote.getId(note, accidental);
  }

  interval(interval: number){
    //const nnotes = RealNote.real_notes.length;
    return RealNote.real_notes.get(this.id+interval);
  }

  static printNotes(){
    for(const note of RealNote.real_notes.array){
      console.log(`Base = ${note.base_note.toString()} Variant = ${note.variant ? note.variant.toString() : "None"}`);
      //console.log(note.variant?.toString());
    }
  }


  private static generateRealNotes(): CircularArray<RealNote>{
    //const first_note = {note: Note.C, accidental: Accidental.None};
    return new CircularArray(baseNoteCOrder.map((i) => {
      const rbn = RealBaseNote.getNoteFromId(i)!;
      return new RealNote(rbn.note, rbn.accidental);
    }));

  }

  static getRealNoteFromId(id:number): RealNote{
    //if(id < 0 || id >= RealNote.real_notes.length){
    //  return null;
    //}
    return RealNote.real_notes.get(id);
  }

  static getRealNoteFromBaseNote(base_note: RealBaseNote): RealNote{
    const base_id = base_note.id;
    return this.getRealNoteFromId(RealNote.baseNoteToNoteIdMap.get(base_id)!);
  }

  static getId(note:Note, accidental:Accidental): RealNoteId{
    const id = RealBaseNote.getId(note, accidental);
    return RealNote.baseNoteToNoteIdMap.get(id)!;
  }

  static getRealNote(note: Note, accidental:Accidental){
    const id = RealNote.getId(note, accidental);
    return this.getRealNoteFromId(id);

  }


  
  getVariant(){
    const n_note = nextNote(this.base_note.note);
    const p_note = previousNote(this.base_note.note);
    if(this.base_note.accidental == Accidental.None){
      if(!hasFlat(n_note)){
        return RealBaseNote.getNote(n_note, Accidental.Flat);
      }
      if(!hasSharp(p_note)){
        return RealBaseNote.getNote(p_note, Accidental.Sharp);
      }
    }
    else if(this.base_note.accidental == Accidental.Sharp){
      if(hasFlat(n_note)){
        return RealBaseNote.getNote(n_note, Accidental.Flat);
      }
    }
    else{
      if(hasSharp(p_note)){
        return RealBaseNote.getNote(p_note, Accidental.Sharp);
      }
    }

    return null;
    //if(hasSharpthis.base_note)
  }
  toString(): string{
    return `${this.base_note.toString()}`;
  }
  //static getRealNoteFrom
}

RealNote.printNotes();

export function getBaseNote(note:Note, accidental: Accidental):BaseNote{
  const index = (note as number)*3 + accidental as number;
  return baseNotes[index];
}

 export class RealNoteTone{
  /*private */static note_tones: Map<number, RealNoteTone> = RealNoteTone.generateRealNoteTones();
  static A4id: number = 48;
  note: RealNote;
  octave: number;
  id: number;
  
  constructor(rn: RealNote, octave: number){
    this.note = rn;
    this.octave = octave;
    this.id = RealNoteTone.getNoteId(rn, octave);
  }
  static generateRealNoteTones(): Map<number, RealNoteTone>{
    let note = RealNote.getRealNote(Note.A, Accidental.None);
    const note_tones = new Map<number, RealNoteTone>();
    for(let i = 0; i < 88; i++){
      const octave = Math.floor((i+9) / 12);
      //console.log(`Octave ${octave}, Note ${note.base_note.toString()}`);
      note_tones.set(i, new RealNoteTone(note, octave));
      note = note.interval(1);
    }
    return note_tones;
  }

  private static addNoteTone(id: number){
    const octave = Math.floor((id+9) / 12);
    //console.log(`Octave ${octave}, Note ${note.base_note.toString()}`);
    const note = RealNote.getRealNote(Note.A, Accidental.None).interval(id);
    RealNoteTone.note_tones.set(id, new RealNoteTone(note, octave));
  }

  static getNoteToneFromId(id: number): RealNoteTone{
    if(!this.note_tones.has(id)){
      this.addNoteTone(id);
    }
    return this.note_tones.get(id)!;
  }

  static getNoteToneFromRealNoteAndOctave(rn: RealNote, octave: number): RealNoteTone{
    //todo
    const id = RealNoteTone.getNoteId(rn, octave);
    return RealNoteTone.getNoteToneFromId(id);
  }

  static getNoteToneFromNoteAndOctave(note: Note, acc: Accidental, octave: number): RealNoteTone{
    const real_note = RealNote.getRealNoteFromId(RealNote.getId(note, acc));
    const id = RealNoteTone.getNoteId(real_note, octave);
    return RealNoteTone.getNoteToneFromId(id);
  }

  static getNoteId(real_note: RealNote, octave: number): number{
    const id = real_note.id - 9 + octave * 12;
    return id;
  }
  getFrequency(){
    const freq_mod = this.id-RealNoteTone.A4id;
    return shiftTone(AToneFrequency, freq_mod);
  }
  toString(): string{
    return `${this.note.toString()}${this.octave}`;
  }
}

console.log(RealNoteTone.note_tones);

const tid = RealNoteTone.getNoteId(RealNote.getRealNote(Note.C, Accidental.None), 1);
console.log(tid);

const rnt = RealNoteTone.getNoteToneFromId(tid);
//console.log(RealNoteTone.getNoteToneFromId(tid).toString());
console.log(rnt.getFrequency());

//console.log(baseNoteToString(getBaseNote(Note.D, Accidental.Sharp)));

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
  const note = baseNoteCOrderNotes[i%numNotes];
  const octave = middleOctave + Math.floor(i/numNotes);
  //console.log(baseNoteToString(note));
  const frequency = shiftTone(AToneFrequency, i+MiddleCId);
  noteToneMap.set(i, {id: i, octave, notation: note, frequency})
}

for(let i = 1; i <= 15; i++){
  const note = baseNoteCOrderNotes[numNotes - i%numNotes];
  const octave = middleOctave - Math.floor(i/numNotes);
  const frequency = shiftTone(AToneFrequency, -i+MiddleCId);
  noteToneMap.set(-i, {id: -i, octave, notation: note, frequency});
}
//console.log(noteToneMap);

//const noteIdMap: Map<NoteTone, number> = new Map();

const alternateBaseNoteMap: Map<BaseNote, BaseNote> = new Map();

function baseNoteEquals(bn1:BaseNote, bn2:BaseNote): boolean{
  if(bn1.note == bn2.note && bn1.accidental == bn2.accidental){
    return true;
  }

  return false;
}

export function hasSharp(n: Note): boolean{
  return n == Note.A || n == Note.C || n == Note.D || n == Note.F || n == Note.G;
}

export function hasFlat(n: Note): boolean{
  return n == Note.A || n == Note.B || n == Note.D || n == Note.E || n == Note.G;
}

export function baseNoteToString(bn:BaseNote): string{
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

export function idIsBlackNote(id: number): boolean{
  const rel = id % 12;
  return rel == 1 || rel == 3 || rel == 6 || rel == 8 || rel == 10;
}


//black notes are flat equivalent
function idWhiteNoteOffset(id: number): number{
  if(id == 2 || id == 3) return id-1;
  if(id == 4 || id == 5 || id == 6) return id - 2;
  if(id == 7 || id == 8) return id - 3;
  if(id == 9 || id == 10) return id - 4;
  if(id == 11) return id - 5;
  return id;
}

export function idToBaseWhiteNote(id: number): number{
  console.log(id)
  const octave = Math.floor(id / 12);
  const offset = idWhiteNoteOffset(id % 12);
  return (octave * 7) + offset;
}

export function shiftTone(tone: number, shift: number):number{
  console.log(tone*Math.pow(2, shift/12));
  return tone*Math.pow(2, shift/12);
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