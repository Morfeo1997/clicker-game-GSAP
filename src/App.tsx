import { useState } from 'react'
import Game from './components/EscapeGame'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main>
        <Game />
      </main>
    </>
  )
}

export default App
