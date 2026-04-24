type Int32 = number;
type Float = number;

export const NoteStateEnum = {
  Default: 0,
  Playing: 1,
  Hovered: 2,
  Selected: 3,
  Preview: 4, //special case for adding notes
} as const;

export type NoteState = (typeof NoteStateEnum)[keyof typeof NoteStateEnum];

export type MIDINote = {
  id: Int32,
  beat: Float,
  length: Float,
  state: NoteState
}

export const PlayStateEnum = {
  Stopped: 0,
  Playing: 1
} as const;

export type PlayState = (typeof PlayStateEnum)[keyof typeof PlayStateEnum];

export const GridEditStateEnum = {
  Default: 0,
  Adding: 1,
  Deleting: 2,
} as const;

export type GridEditState = (typeof GridEditStateEnum)[keyof typeof GridEditStateEnum];

export type MIDINoteEdge = {
  is_low_edge: boolean;
  note: MIDINote;
}

export type NoteIdFloat = {
  id: Int32,
  beat_fl: Float
}

export function MIDINoteCmp(n1: MIDINote, n2: MIDINote): Int32{
  return n1.beat - n2.beat;
}
