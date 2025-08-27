import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  createClient: (email: string, password: string, fullName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Clear all auth state
  const clearAuthState = () => {
    console.log('🧹 Clearing auth state');
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
  };

  // Fetch user profile with retry logic
  const fetchProfile = async (userId: string, retries = 3): Promise<Profile | null> => {
    if (!supabase) return null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Fetching profile for user ${userId} (attempt ${attempt}/${retries})`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, this is expected for new users
            console.log('👤 Profile not found, user may need to complete registration');
            return null;
          }
          throw error;
        }

        console.log('✅ Profile fetched successfully:', data.role);
        return data;
      } catch (error) {
        console.error(`❌ Profile fetch attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          console.error('💥 All profile fetch attempts failed');
          return null;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
    
    return null;
  };

  // Initialize authentication
  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      if (!hasSupabaseConfig || !supabase) {
        console.log('❌ Supabase not configured');
        if (mounted) {
          setError('Supabase is not configured. Please connect to Supabase.');
          setLoading(false);
          setInitialized(true);
        }
        return;
      }

      try {
        console.log('🔄 Initializing authentication...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          clearAuthState();
          setLoading(false);
          setInitialized(true);
          return;
        }

        console.log('📋 Initial session:', session ? 'Found' : 'None');
        
        if (session?.user) {
          console.log('👤 User found in session:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Fetch profile
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          console.log('👤 No active session found');
          clearAuthState();
        }
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (mounted) {
          clearAuthState();
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      if (!supabase) return;
      
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        try {
          switch (event) {
            case 'SIGNED_IN':
            case 'TOKEN_REFRESHED':
              if (session?.user) {
                console.log('✅ User authenticated:', session.user.email);
                setSession(session);
                setUser(session.user);
                setError(null);
                
                // Fetch fresh profile
                const userProfile = await fetchProfile(session.user.id);
                if (mounted) {
                  setProfile(userProfile);
                }
              }
              break;
              
            case 'SIGNED_OUT':
              console.log('👋 User signed out');
              clearAuthState();
              break;
              
            case 'USER_UPDATED':
              if (session?.user) {
                console.log('🔄 User updated:', session.user.email);
                setSession(session);
                setUser(session.user);
              }
              break;
              
            default:
              // Handle other events or session changes
              if (session?.user) {
                setSession(session);
                setUser(session.user);
                
                // Only fetch profile if we don't have one or user changed
                if (!profile || profile.id !== session.user.id) {
                  const userProfile = await fetchProfile(session.user.id);
                  if (mounted) {
                    setProfile(userProfile);
                  }
                }
              } else {
                clearAuthState();
              }
          }
        } catch (error) {
          console.error('💥 Error handling auth state change:', error);
          if (mounted) {
            setError('Authentication error occurred');
          }
        } finally {
          if (mounted && !initialized) {
            setLoading(false);
            setInitialized(true);
          }
        }
      });
      
      authSubscription = subscription;
    };

    // Initialize auth and set up listener
    initializeAuth();
    setupAuthListener();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const signOut = async () => {
    if (!supabase) return;
    
    console.log('👋 Signing out...');
    
    try {
      setLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
      }
      
      // Clear state immediately
      clearAuthState();
      
      console.log('✅ Sign out complete');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('💥 Unexpected error during sign out:', error);
      // Force reload even on error
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const createClient = async (email: string, password: string, fullName?: string) => {
    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Create user with admin privileges
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          requires_password_change: true
        }
      });

      if (error) throw error;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'client'
        });

      if (profileError) throw profileError;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signOut,
    updateProfile,
    createClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}