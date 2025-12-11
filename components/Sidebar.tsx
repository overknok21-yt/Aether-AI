import React from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  LogOut, 
  Sparkles,
  Zap,
  BrainCircuit
} from 'lucide-react';
import { NavSection, AppMode, User } from '../types';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  currentMode: AppMode;
  onToggleMode: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onNavigate, 
  currentMode, 
  onToggleMode,
  user,
  onLogout
}) => {
  
  const navItemClass = (section: NavSection) => `
    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${activeSection === section 
      ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-900/50' 
      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}
  `;

  return (
    <div className="w-72 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Aether
        </h1>
      </div>

      {/* Mode Toggle */}
      <div className="mb-8 px-2">
        <div className="bg-zinc-900 p-1 rounded-lg flex relative">
          <button
            onClick={onToggleMode}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all z-10 ${
              currentMode === 'flash' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            Flash
          </button>
          <button
            onClick={onToggleMode}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all z-10 ${
              currentMode === 'detail' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Detail
          </button>
          
          {/* Animated Background */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-700 rounded-md transition-transform duration-300 ease-out ${
              currentMode === 'detail' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
            }`}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          {currentMode === 'flash' ? 'Gemini 2.5 Flash Lite • Fast' : 'Gemini 3 Pro • Reasoning'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <button onClick={() => onNavigate('chat')} className={navItemClass('chat')}>
          <MessageSquare className="w-5 h-5" />
          <span>Chat & Analyze</span>
        </button>
        <button onClick={() => onNavigate('imagine')} className={navItemClass('imagine')}>
          <ImageIcon className="w-5 h-5" />
          <span>Imagine</span>
        </button>
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t border-zinc-800 pt-4 px-2">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group">
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-zinc-700" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <button onClick={onLogout} className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;