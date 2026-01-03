import { useCallback, useEffect, useRef, useState } from "react";
import * as Note from "./../compose/note"; 
import { Oscillator, OscillatorCollection } from "../compose/audio";
import * as PianoViews from "./PianoView";
import update from "immutability-helper";

type MIDITesterProps = {
  audio_context: AudioContext;
}

type MIDIKeyboardVisualsProps = {
  audio_context: AudioContext;
}

type MIDIRecordingRecord = {
  start_time: number,
  note_down: boolean,
  //duration: number,
  note_id: number
}

type MIDIRecording = {
  start_time: number,
  records: MIDIRecordingRecord[]
};

type KeyboardState = {
  note_ids_down: Set<number>;
  recording: MIDIRecording;
}


export function MIDIKeyboardVisuals(props: MIDIKeyboardVisualsProps){
  const white_keys = 29;
  const oscillatorCollection = useRef<OscillatorCollection>(new OscillatorCollection(props.audio_context));
  const [whiteNotesDown, setWhiteNotesDown] = useState<boolean[]>([...Array(white_keys)].map(() => false));
  const [blackNotesDown, setBlackNotesDown] = useState<boolean[]>([...Array(white_keys)].map(() => false));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if(canvasRef.current != null){
      const ctx = canvasRef.current.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(5, 5, 100, 100);
      console.log(ctx);
    }
  }, [canvasRef.current]);

  //const recording = useRef<MIDIRecordingRecord[]>([]);
  const [recordingState, setRecordingState] = useState<MIDIRecordingRecord[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  //const recording_start_time = useRef(0);
  //const pushed_note_map = useRef(new Set<number>()); // note-id, recording index
  const key_state = useRef<KeyboardState>({
    note_ids_down: new Set<number>(), 
    recording: {start_time: 0, records: []}
  });

  const onKeyboardNote = useCallback((data: MIDIKeyData) =>{
    console.log(data);
    const is_black = Note.idIsBlackNote(data.key_id);
    const id = Note.idToBaseWhiteNote(data.key_id);
    console.log(id);
    changeVisualNote(is_black, id, data.down);
    const play_id = data.key_id - 9-12;
    const note = Note.RealNoteTone.getNoteToneFromId(play_id+Note.RealNoteTone.A4id);
    onPlayNote(note);
    
    addToRecording(note); // event update causing recording to be shakey

  }, [whiteNotesDown, blackNotesDown, recordingState]);

  const keyNoteTest = (data: MIDIKeyData) => {
    const play_id = data.key_id - 9-12;
    const note = Note.RealNoteTone.getNoteToneFromId(play_id+Note.RealNoteTone.A4id);
    onPlayNote(note);
    addToRecording(note); 
  }

  const midiKeyboard = useMIDIKeyboardInput({onKeyboardNote:keyNoteTest});

  function playRecording(){
    const st = key_state.current;
    for(const rec of st.recording.records){
      setTimeout(() => {
        const note = Note.RealNoteTone.getNoteToneFromId(rec.note_id);
        onPlayNote(note);
      }, rec.start_time);
      console.log(rec);
    }
    console.log(recordingState);

  }

  function addToRecording(note: Note.RealNoteTone){
    const st = key_state.current;
    const note_down = !st.note_ids_down.has(note.id);
      if(st.note_ids_down.has(note.id)){
        st.note_ids_down.delete(note.id);
      }else{
        st.note_ids_down.add(note.id);
      }
    if(isRecording){
      const newRecord = {start_time: Date.now()-st.recording.start_time, note_down, note_id: note.id};
      //setRecordingState(update(recordingState, {$push: [newRecord]}));
      st.recording.records.push(newRecord);
    }
  }

  function changeVisualNote(is_black: boolean, id: number,val: boolean){
    console.log(update(whiteNotesDown, {[id]: {$set: val}}));
    if(!is_black){
      setWhiteNotesDown(update(whiteNotesDown, {[id]: {$set: val}}));
    }else{
      setBlackNotesDown(update(blackNotesDown, {[id]: {$set: val}}));
    }
  }
  function onVisualNoteDown(note: PianoViews.VisualNoteFind){
    changeVisualNote(note.visual_note.is_black, note.visual_note.id, true);
    onPlayNote(note.note_tone);
    addToRecording(note.note_tone);
  }
  function onVisualNoteUp(note: PianoViews.VisualNoteFind){
    changeVisualNote(note.visual_note.is_black, note.visual_note.id, false);
    onPlayNote(note.note_tone);
    addToRecording(note.note_tone);
  }
  function onPlayNote(note: Note.RealNoteTone){
    oscillatorCollection.current.toggle(note);
  }
  function handleRecord(){
    const st = key_state.current;
    if(!isRecording){
      st.recording.records = [];
      //setRecordingState([]);
    }
    setIsRecording(!isRecording);
    st.recording.start_time = Date.now();

  } 
  return(
    <div>
    <canvas ref={canvasRef}></canvas>
    Visuals 
    <PianoViews.PianoCanvas white_keys={29} 
    key_width={30} key_height={100} black_key_height_ratio={0.7} 
    black_key_width_ratio={0.6} starting_note={Note.Note.C}
    white_notes_down={whiteNotesDown} 
    black_notes_down={blackNotesDown}
    onKeyboardNoteDown={onVisualNoteDown}
    onKeyboardNoteUp={onVisualNoteUp}
    />
    {/*}
    <PianoView audio_context={props.audio_context} white_keys={29} starting_note={Note.Note.C}
    white_notes_down={whiteNotesDown} black_notes_down={blackNotesDown}
    onKeyboardNoteDown={onVisualNoteDown} onKeyboardNoteUp={onVisualNoteUp}/>*/}
    <button onClick={handleRecord}>{!isRecording ? "Record" : "Stop"}</button>
    <button onClick={playRecording} disabled={isRecording}>Play Recording</button>
    </div>
  );
}

type MIDIKeyboardProps = {
  //onKeyboardNoteDown()
  onKeyboardNote:(data: MIDIKeyData) => void;
}

type MIDIKeyData = {
  down: boolean;
  key_id: number;
  power: number;
}

export function useMIDIKeyboardInput(props: MIDIKeyboardProps){
  const permissions_active = useRef(false);
  const midi_access = useRef<MIDIAccess>();

  function requestMIDIPermissions(){
    if(permissions_active.current) return;
    permissions_active.current = true;
    //console.log("startingup midi");
    navigator.permissions.query({ name: "midi"}).then((result: PermissionStatus) => {
      if (result.state === "granted") {
        // Access granted.
        console.log("granted");
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        permissions_active.current = true;
      } else if (result.state === "prompt") {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        // Using API will prompt for permission
      }else{
        console.log("device cannot use midi");
      }
      // Permission was denied by user prompt or permission policy
    });
  }
  function onMIDISuccess(midiAccess: MIDIAccess){
    console.log("success");
    console.log(midiAccess);
    midi_access.current = midiAccess;
    //listInputsAndOutputs(midiAccess);
    startLoggingMIDIInput(midiAccess);
  }

  function onMIDIFailure(reason: any){
    console.log("fail");
    console.log(reason);  
  }

  function onMIDIMessage(event:MIDIMessageEvent){
    //console.log(event.data);
    if(event.data){
      if(event.data.length == 3){
        const down = event.data[0] == 147;
        const key_id = event.data[1];
        const power = event.data[2];
        const data = {down, key_id, power};
        props.onKeyboardNote(data);
      }
    }
  }

  function startLoggingMIDIInput(midiAccess: MIDIAccess) {
    midiAccess.inputs.forEach((entry) => {
      entry.onmidimessage = onMIDIMessage;
    });
  }

  useEffect(() => {
    if(permissions_active.current) return;

    requestMIDIPermissions();

  }, []);
  useEffect(() => {
    if(midi_access.current){
      midi_access.current.inputs.forEach((entry) => {
        entry.onmidimessage = onMIDIMessage;
      });
    }
  }, [props.onKeyboardNote]);

}

export function MIDITester(props:MIDITesterProps){
  const midi_access = useRef<MIDIAccess | null>(null);
  const oscillator = useRef<Oscillator>(new Oscillator(props.audio_context));
  const oscillatorCollection = useRef<OscillatorCollection>(new OscillatorCollection(props.audio_context));
  const active = useRef(false);
  const startup = useRef(false);
  useEffect(() => {
    if(startup.current) return;
    startup.current = true;
    navigator.permissions.query({ name: "midi"}).then((result: PermissionStatus) => {
      if (result.state === "granted") {
        // Access granted.
        console.log("granted");
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
      } else if (result.state === "prompt") {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        // Using API will prompt for permission
      }else{
        console.log("device cannot use midi");
      }
      // Permission was denied by user prompt or permission policy
    });


  }, []);

  function onMIDISuccess(midiAccess: MIDIAccess){
    console.log("success");
    console.log(midiAccess);
    listInputsAndOutputs(midiAccess);
    startLoggingMIDIInput(midiAccess);
  }

  function onMIDIFailure(reason: any){
    console.log("fail");
    console.log(reason);  
  }

  function listInputsAndOutputs(midiAccess: MIDIAccess) {
    for (const entry of midiAccess.inputs) {
      const input = entry[1];
      console.log(
        `Input port [type:'${input.type}']` +
          ` id:'${input.id}'` +
          ` manufacturer:'${input.manufacturer}'` +
          ` name:'${input.name}'` +
          ` version:'${input.version}'`,
      );
    }
  
    for (const entry of midiAccess.outputs) {
      const output = entry[1];
      console.log(
        `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
      );
    }
  }

  function onMIDIMessage(event:MIDIMessageEvent) {
    console.log(oscillator.current);
    if(event.data){
      let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data?.length} bytes]: `;
      for (const character of event.data) {
        str += `0x${character.toString(16)} `;
      }
      console.log(str);
      if(event.data.length == 3){
        const key_id = event.data[1];
        console.log(key_id);
        if(key_id >= 0 && key_id <= 108){
          if(props.audio_context.state == 'suspended'){
            props.audio_context.resume();
          }
          const id = key_id - 9;
          console.log(id);
          console.log(`playing id ${id+Note.RealNoteTone.A4id}`);
          const note = Note.RealNoteTone.getNoteToneFromId(id+Note.RealNoteTone.A4id);

          oscillatorCollection.current.toggle(note);
          /*
          console.log(note.toString());
          oscillator.current.setFrequency(note.getFrequency());
          if(!oscillator.current.is_playing){
            oscillator.current.play();
          }else{
            oscillator.current.stop();
          }
          */
        }
      }
    }
  }
  
  function startLoggingMIDIInput(midiAccess: MIDIAccess) {
    midiAccess.inputs.forEach((entry) => {
      entry.onmidimessage = onMIDIMessage;
    });
  }
  return (
    <><button onClick={() => {
      active.current = true;
    }}>On</button></>
  )
}