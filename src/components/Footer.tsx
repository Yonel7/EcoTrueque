import React from 'react';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Leaf className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">EcoTrueque</span>
            </div>
            <p className="text-green-200 mb-4">
              Plataforma de intercambio de productos ecológicos sin uso de dinero.
              Promovemos la economía circular y el cuidado del medio ambiente.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-green-200 hover:text-white transition">Inicio</a></li>
              <li><a href="/products" className="text-green-200 hover:text-white transition">Productos</a></li>
              <li><a href="/login" className="text-green-200 hover:text-white transition">Iniciar Sesión</a></li>
              <li><a href="/register" className="text-green-200 hover:text-white transition">Registrarse</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-green-300" />
                <span className="text-green-200">contacto@ecotrueque.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-300" />
                <span className="text-green-200">+123 456 7890</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-300" />
                <span className="text-green-200">Ciudad Ecológica, País Verde</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-green-700 mt-8 pt-6 text-center text-green-300">
          <p>&copy; {new Date().getFullYear()} EcoTrueque. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;