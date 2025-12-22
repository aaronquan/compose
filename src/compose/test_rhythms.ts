import { Rhythm } from "./rhythm";

export const fourBeatBar = new Rhythm();
fourBeatBar.addRNote(1);
fourBeatBar.addRNote(1);
fourBeatBar.addRNote(1);
fourBeatBar.addRNote(1);


export const halfNoteBeatBar = new Rhythm();
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);
halfNoteBeatBar.addRNote(0.5);

export const offBeatRestBar = new Rhythm();
for(let i = 0; i < 4; i++){
  offBeatRestBar.addRNote(0.5, true);
  offBeatRestBar.addRNote(0.5);
}

export const claveBar = new Rhythm();
claveBar.addRNote(1.5);
claveBar.addRNote(1.5);
claveBar.addRNote(1);

export const doubleClaveBar = new Rhythm();
doubleClaveBar.addRNote(0.75);
doubleClaveBar.addRNote(0.75);
doubleClaveBar.addRNote(0.5);
doubleClaveBar.addRNote(0.75);
doubleClaveBar.addRNote(0.75);
doubleClaveBar.addRNote(0.5);

export const lastNote = new Rhythm();
lastNote.addRNote(3, true);
lastNote.addRNote(1);

export const uncondensedRest = new Rhythm();
uncondensedRest.addRNote(0.5, true);
uncondensedRest.addRNote(0.5, true);
uncondensedRest.addRNote(0.5, true);
uncondensedRest.addRNote(0.5, true);
uncondensedRest.addRNote(0.75, true);
uncondensedRest.addRNote(0.75, true);
uncondensedRest.addRNote(0.5, true);

export const mixedRest = new Rhythm();
mixedRest.addRNote(0.5, true);
mixedRest.addRNote(0.75, true);
mixedRest.addRNote(0.5);
mixedRest.addRNote(0.25, true);
mixedRest.addRNote(0.5, true);
mixedRest.addRNote(0.5, true);
mixedRest.addRNote(0.25);
mixedRest.addRNote(0.25);
mixedRest.addRNote(0.25, true);
mixedRest.addRNote(0.25, true);

export const triplet = new Rhythm();
triplet.addRNote(0.33);
triplet.addRNote(0.33, true);
triplet.addRNote(0.34);
triplet.addRNote(0.33);
triplet.addRNote(0.33);
triplet.addRNote(0.34);
triplet.addRNote(0.66);
triplet.addRNote(0.66);
triplet.addRNote(0.67);