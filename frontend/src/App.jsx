import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from './navbar'
import './App.css'
import Navbar from './navbar'

function App() {

  return (
    <>
      <BrowserRouter>
      <Navbar>
        <Routes>
          <Route path='\'element={<Home/>} />
          <Route path='\register' element={<Register/>}/>
          <Route path='\login' element={<Login/>}/>
        </Routes>
      </Navbar>
      </BrowserRouter>
    </>
  )
}

export default App;
