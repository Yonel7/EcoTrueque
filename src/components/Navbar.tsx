import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X, User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Leaf className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">EcoTrueque</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-green-700 transition">Inicio</Link>
            <Link to="/products" className="px-3 py-2 rounded-md hover:bg-green-700 transition">Productos</Link>
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-green-700 transition">Mi Perfil</Link>
                <button 
                  onClick={logout}
                  className="px-3 py-2 rounded-md bg-green-700 hover:bg-green-800 transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md hover:bg-green-700 transition flex items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md bg-green-700 hover:bg-green-800 transition">
                  Registrarse
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md hover:bg-green-700 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              to="/products" 
              className="block px-3 py-2 rounded-md hover:bg-green-700 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Productos
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md hover:bg-green-700 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mi Perfil
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-green-700 hover:bg-green-800 transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md hover:bg-green-700 transition flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md bg-green-700 hover:bg-green-800 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;