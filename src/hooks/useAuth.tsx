
import { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface Session {
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('access_token');
    console.log('Checking stored token:', token ? 'Token found' : 'No token found');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      console.log('Fetching user with token...');
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('User fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User data received:', data);
        setUser(data.user);
        setSession({ access_token: token });
      } else {
        console.log('Invalid token, removing from storage');
        localStorage.removeItem('access_token');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('access_token');
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Sign in response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Sign in error response:', error);
        throw new Error(error.error || 'Sign in failed');
      }

      const data = await response.json();
      console.log('Sign in successful:', data);
      
      setUser(data.user);
      setSession(data.session);
      localStorage.setItem('access_token', data.session.access_token);
    } catch (error) {
      console.error('Network or parsing error during sign in:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Network connection failed. Please check if the server is running.');
      }
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    console.log('Attempting sign up for:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      console.log('Sign up response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Sign up error response:', error);
        throw new Error(error.error || 'Sign up failed');
      }

      const data = await response.json();
      console.log('Sign up successful:', data);
      
      setUser(data.user);
      setSession(data.session);
      localStorage.setItem('access_token', data.session.access_token);
    } catch (error) {
      console.error('Network or parsing error during sign up:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Network connection failed. Please check if the server is running.');
      }
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setSession(null);
      console.log('Sign out complete');
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
