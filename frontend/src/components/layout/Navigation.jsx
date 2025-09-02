import React from 'react'

const Navigation = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MEP Projects</h1>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-8">
            <a href="#" className="inline-flex items-center px-1 pt-1 text-gray-900">
              Inicio
            </a>
            <a href="#projects" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
              Proyectos
            </a>
            <a href="#sectors" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
              Sectores
            </a>
            <a href="#contact" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-900">
              Contacto
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navigation
