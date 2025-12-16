import { Routes, Route } from 'react-router-dom'
import { PokeStatsGame } from './games/pokestats'
import { PokeQuizzGame } from './games/pokequizz'
import { Navbar } from './components/Navbar'
import { Home } from './components/Home'
import { Footer } from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokestats" element={<PokeStatsGame />} />
          <Route path="/pokequizz" element={<PokeQuizzGame />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App
