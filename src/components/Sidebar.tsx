'use client';

import { 
  FolderKanban, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  X,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onLogout: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
  { icon: FolderKanban, label: 'Projects', href: '#' },
  { icon: BarChart3, label: 'Analytics', href: '#' },
  { icon: Users, label: 'Team', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export default function Sidebar({ isOpen, onClose, userName, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-dark-800 border-r border-dark-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 flex items-center justify-between border-b border-dark-700 h-16">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary-600/20">
                <LayoutDashboard className="w-5 h-5 text-primary-400" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">MiniSaaS</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 lg:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  item.active 
                    ? 'bg-primary-600/10 text-primary-400 border border-primary-600/20' 
                    : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${
                  item.active ? 'text-primary-400' : 'text-dark-400 group-hover:text-white'
                }`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer / User Profile */}
          <div className="p-4 border-t border-dark-700">
            <div className="p-4 rounded-2xl bg-dark-900/50 border border-dark-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-600/20">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userName}</p>
                  <p className="text-xs text-dark-400 truncate">Pro Plan</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-dark-800 hover:bg-red-500/10 text-dark-300 hover:text-red-400 border border-dark-600 hover:border-red-500/30 transition-all duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
