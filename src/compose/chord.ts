export enum Chord{
  A = "A", B = "B", C = "C", D = "D", E = "E", F = "F", G = "G"
}

export const default_chord = Chord.A;
export const chord_choices = Object.values(Chord);

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