import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Bell, Search, Crown } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { profile, user } = useAuth();

  return (
    <header className="bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 shadow-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-md p-2 text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-purple-400" />
              </div>
              <input
                type="text"
                placeholder="Search clients, workflows..."
                className="block w-80 rounded-lg border border-purple-500/30 bg-slate-800/50 py-2 pl-10 pr-3 text-sm placeholder-purple-400 text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium">
            <Crown className="h-3 w-3" />
            <span>Admin</span>
          </div>

          <button className="relative rounded-full p-2 text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden shadow-lg">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || profile.email}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">
                {profile?.full_name || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-purple-300">{profile?.email || user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}