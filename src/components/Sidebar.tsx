import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Workflow, 
  Settings, 
  User, 
  LogOut,
  X,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { signOut, profile, user } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Initiating sign out from sidebar...');
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload even if there's an error to ensure clean state
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-xl border-r border-purple-500/20 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-purple-500/20">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ClientsHub
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-2 text-purple-300 hover:bg-purple-500/20 hover:text-purple-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30 shadow-lg'
                      : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
                  }`
                }
                onClick={() => onClose()}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-purple-500/20">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                Account
              </p>
              <p className="text-sm text-purple-200 truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-purple-400 truncate">
                {profile?.email || user?.email}
              </p>
            </div>
            <button 
              onClick={handleSignOut}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium text-purple-200 rounded-lg hover:bg-purple-500/20 hover:text-white transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}