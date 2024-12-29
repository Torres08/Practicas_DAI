import './App.css'
import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router basename="/react-tienda">
      <div className="App">
        <header className="App-header">
          <Navbar />
        </header>
        <main className="pt-16">
          <Routes>
            <Route path="" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App