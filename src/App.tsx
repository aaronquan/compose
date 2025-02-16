import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import ComposeWorkspace from './interface/ComposeWorkspace'
import PianoKeys from './interface/PianoKeys'
import { SineGenerator } from './interface/SoundGenerator'

function App() {
  //
  return (
    <>
      <div>
        <ComposeWorkspace/>
        <SineGenerator/>
        <PianoKeys/>
      </div>
    </>
  )
}

export default App
