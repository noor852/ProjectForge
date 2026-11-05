import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from './navbar'
import './App.css'
import Home from './home';
import Register from './register';
import Login from './login'


function App() {

  return (
      <BrowserRouter>
      <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      
      </BrowserRouter>
  )
}

export default App;
