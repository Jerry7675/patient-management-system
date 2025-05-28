import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PatientDashboard from './pages/patient/PatientDashboard.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
function App() {
  const [count, setCount] = useState(0)

  return (
   <div className="flex flex-col justify-center items-center h-screen text-3xl text-red-500 bg-gradient-to-r from-red-100 to-red-500">
  testing
</div>

  )
}

export default App
