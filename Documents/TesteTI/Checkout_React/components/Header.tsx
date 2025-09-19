
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  cartItemCount: number;
  currentView: View;
  setView: (view: View) => void;
}

const LogoIcon: React.FC = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18M5.464 5.464l13.072 13.072m0-13.072L5.464 18.536"></path>
  </svg>
);

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-gray-300 hover:bg-blue-600 hover:text-white'
    }`}
  >
    {children}
    {label}
  </button>
);


export const Header: React.FC<HeaderProps> = ({ cartItemCount, setView, currentView }) => {
  return (
    <header className="bg-blue-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <LogoIcon />
              <span className="text-white text-xl font-bold">Nova Concursos</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <NavButton label="Produtos" isActive={currentView === 'products'} onClick={() => setView('products')} />
             <NavButton label="Admin" isActive={currentView === 'admin'} onClick={() => setView('admin')} />
            <button onClick={() => setView('cart')} className="relative flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-blue-600 hover:text-white">
                <span>Carrinho</span>
                {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                    {cartItemCount}
                </span>
                )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
