import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Srcc from '../components/srcc.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-black p-16 h-full">
        <Srcc />

      </div>
    </>
  )
}

export default App
