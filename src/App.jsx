import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Deals from './pages/Deals.jsx'
import PartEx from './pages/PartEx.jsx'
import Bikes from './pages/Bikes.jsx'
import ToDo from './pages/ToDo.jsx'
import NewDeal from './pages/NewDeal.jsx'

function App() {
  return (
    <Routes>
      {/* First load goes to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/part-ex" element={<PartEx />} />
      <Route path="/bikes" element={<Bikes />} />
      <Route path="/to-do" element={<ToDo />} />
      <Route path="/new-deal" element={<NewDeal />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
