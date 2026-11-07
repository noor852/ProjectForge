import { useState } from 'react'
import { useEffect } from 'react'
import { fetchMe } from './features/authSlice'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from './navbar'
import { useDispatch } from 'react-redux'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './pages/register';
import Dashboard from './pages/Dashboard'
import Login from './pages/login';


function App() {

  const dispatch = useDispatch();
  return (
      <BrowserRouter>
      <Navbar/>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      
      </BrowserRouter>
  )
}

export default App;
