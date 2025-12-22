import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { CircularArray } from './utils/array'

import ComposeWorkspace from './interface/ComposeWorkspace'
import PianoKeys from './interface/PianoKeys'
import { SineGenerator } from './interface/SoundGenerator'
import RhythmTester from './interface/RhythmTester'
import { MIDIKeyboardVisuals, MIDITester } from './interface/MIDITester'
import PianoView, { PianoCanvas } from './interface/PianoView'
import { Note } from './compose/note'
import { TempoSetter } from './interface/components/Tempo'

function App() {
  const audio_context = useRef(new AudioContext());
  //
  useEffect(() => {
    /*
    
    */
  }, []);

  function testTempoChange(tempo: number){
    console.log(`Tempo changed to ${tempo}`);
  }

  return (
    <>
      <div>
        <RhythmTester audio_context={audio_context.current}/>
        <PianoKeys audio_context={audio_context.current}/>
        <MIDIKeyboardVisuals audio_context={audio_context.current}/>
        <TempoSetter audio_context={audio_context.current} onTempoChange={testTempoChange}/>
        {/*ss
        <MIDITester audio_context={audio_context.current}/>
        /*<PianoView white_keys={29} starting_note={Note.C} audio_context={audio_context.current}/>*/}
        {/*
        <ComposeWorkspace/>
        <SineGenerator/>
        <PianoKeys/>
        */}
      </div>
    </>
  )
}

export default App;
