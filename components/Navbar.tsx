
import React from 'react';
import { User } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: 'dashboard' | 'new' | 'landing') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">Z</span>
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">ZenJournal</span>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-gray-500 italic">Welcome, {user.name}</span>
              <Button 
                variant="ghost" 
                onClick={onLogout} 
                className="p-2 text-gray-500 hover:text-rose-500 rounded-full"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => onNavigate('landing')}>Sign In</Button>
              <Button variant="primary" onClick={() => onNavigate('landing')}>Get Started</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
