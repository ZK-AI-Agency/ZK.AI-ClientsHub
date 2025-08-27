import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import AdminPortal from './components/AdminPortal';
import ClientPortal from './components/ClientPortal';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If no user session, show login
  if (!user) {
    console.log('🔐 No user session, showing login form');
    return <AuthForm />;
  }

  // If user exists but no profile, show loading (profile might still be fetching)
  if (!profile) {
    console.log('👤 User exists but profile loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-300">Setting up your profile...</p>
          <p className="mt-2 text-sm text-purple-400">Logged in as: {user.email}</p>
        </div>
      </div>
    );
  }

  // Route based on user role
  if (profile?.role === 'admin') {
    console.log('🔀 Routing to Admin Portal for user:', user.email);
    return <AdminPortal />;
  } else {
    console.log('🔀 Routing to Client Portal for user:', user.email, 'role:', profile?.role);
    return <ClientPortal />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;