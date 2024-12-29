// mi-tienda/src/components/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="navbar bg-base-100 w-full fixed top-0 left-0 z-10">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">Mi Tienda</Link>
      </div>
    </nav>
  )
}

export default Navbar