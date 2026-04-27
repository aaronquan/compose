import { MIDIGrid } from "./../engine/grid";
import { expect, test } from 'vitest';


test("midi", () => {
  const grid = new MIDIGrid(20, 1);
  console.log(grid.closestNote({id: 0, beat_fl: 1.5}));
  grid.addNote(0, 1, 1);
  grid.addNote(0, 3);
  console.log(grid.closestNote({id: 0, beat_fl: 0}));
  console.log(grid.closestNote({id: 0, beat_fl: 1.5}));
  console.log(grid.closestNote({id: 0, beat_fl: 2.51}));
});