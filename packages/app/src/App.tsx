import { useState } from 'react'
import ButtonPage from './pages'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ButtonPage></ButtonPage>
    </>
  )
}

export default App
