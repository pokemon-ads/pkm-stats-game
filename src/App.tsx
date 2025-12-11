import { Routes, Route } from 'react-router-dom'
import { PokeStatsGame } from './games/pokestats'
import { Navbar } from './components/Navbar'
import { Home } from './components/Home'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokestats" element={<PokeStatsGame />} />
      </Routes>
    </div>
  )
}

export default App
