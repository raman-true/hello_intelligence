import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user database - IMPORTANT: Replace 'YOUR_ACTUAL_ADMIN_USER_UUID_HERE' with the UUID you copied from Supabase
const mockUsers = [
  {
    id: 'c9077acd-5197-4967-bbfd-26c94055ce5f', // <--- REPLACE THIS WITH THE ACTUAL UUID FROM SUPABASE
    email: 'admin@pickme.intel',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', // This can remain a mock UUID if 'moderator' role is not used with Supabase foreign keys
    email: 'moderator@pickme.intel',
    password: 'mod123',
    name: 'Moderator User',
    role: 'moderator' as const
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role
        };
        
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}!`);
      } else {
        toast.error('Invalid email or password');
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
