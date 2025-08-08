import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface OfficerUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  telegram_id?: string;
  plan_id?: string;
  credits_remaining: number;
  total_credits: number;
  status: string;
  department?: string;
  rank?: string;
  badge_number?: string;
}

interface OfficerAuthContextType {
  officer: OfficerUser | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  updateOfficerState: (updates: Partial<OfficerUser>) => void;
  isLoading: boolean;
}

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(undefined);

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (!context) {
    throw new Error('useOfficerAuth must be used within an OfficerAuthProvider');
  }
  return context;
};

interface OfficerAuthProviderProps {
  children: ReactNode;
}

// Mock officer database
const mockOfficers = [
  {
    id: '1',
    name: 'Inspector Ramesh Kumar',
    mobile: '+91 9791103607',
    email: 'ramesh@police.gov.in',
    password: 'officer123',
    telegram_id: '@rameshcop',
    plan_id: null,
    credits_remaining: 32,
    total_credits: 50,
    status: 'Active',
    department: 'Cyber Crime',
    rank: 'Inspector',
    badge_number: 'CC001'
  },
  {
    id: '2',
    name: 'ASI Priya Sharma',
    mobile: '+91 9876543210',
    email: 'priya@police.gov.in',
    password: 'officer123',
    telegram_id: '@priyacop',
    plan_id: null,
    credits_remaining: 45,
    total_credits: 50,
    status: 'Active',
    department: 'Intelligence',
    rank: 'Assistant Sub Inspector',
    badge_number: 'INT002'
  },
  {
    id: '3',
    name: 'SI Rajesh Patel',
    mobile: '+91 9123456789',
    email: 'rajesh@police.gov.in',
    password: 'officer123',
    telegram_id: '@rajeshcop',
    plan_id: null,
    credits_remaining: 12,
    total_credits: 50,
    status: 'Suspended', // Changed to Suspended for testing
    department: 'Crime Branch',
    rank: 'Sub Inspector',
    badge_number: 'CB003'
  },
];

// Function to authenticate officer with Supabase
const authenticateWithSupabase = async (identifier: string, password: string) => {
  try {
    const { data: officers, error } = await supabase
      .from('officers')
      .select('*')
      .or(`email.eq.${identifier},mobile.eq.${identifier}`)
      // Removed .eq('status', 'Active') to fetch all officers regardless of status
      .limit(1);

    if (error) throw error;
    
    if (!officers || officers.length === 0) {
      throw new Error('Invalid credentials'); // Generic message for not found
    }

    const officer = officers[0];
    
    // In a real application, password hashing and verification should happen securely on the backend.
    // This is a simplified mock for frontend demonstration.
    const expectedHash = `$2b$10$${btoa(password).slice(0, 53)}`; // Simplified mock hash
    const passwordMatch = officer.password_hash === expectedHash;
    
    if (!passwordMatch) {
      throw new Error('Invalid credentials'); // Generic message for password mismatch
    }

    // Check officer status AFTER successful password match
    if (officer.status === 'Suspended') {
      throw new Error('Account suspended'); // Specific error for suspended accounts
    }

    return {
      id: officer.id,
      name: officer.name,
      mobile: officer.mobile,
      email: officer.email,
      telegram_id: officer.telegram_id,
      plan_id: officer.plan_id,
      credits_remaining: officer.credits_remaining,
      total_credits: officer.total_credits,
      status: officer.status,
      department: officer.department,
      rank: officer.rank,
      badge_number: officer.badge_number
    };
  } catch (error) {
    console.error('Supabase authentication error:', error);
    throw error; // Re-throw the specific error or generic one
  }
};

export const OfficerAuthProvider: React.FC<OfficerAuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [officer, setOfficer] = useState<OfficerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedOfficer = localStorage.getItem('officer_auth_user');
    if (storedOfficer) {
      try {
        const officerData = JSON.parse(storedOfficer);
        setOfficer(officerData);
      } catch (error) {
        localStorage.removeItem('officer_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay
    
    try {
      const officerData = await authenticateWithSupabase(identifier, password);
      setOfficer(officerData);
      localStorage.setItem('officer_auth_user', JSON.stringify(officerData));
      toast.success(`Welcome back, ${officerData.name}!`);
      setIsLoading(false);
      return;
    } catch (error: any) { // Catch the error from Supabase authentication
      console.log('Supabase auth failed, trying mock data:', error);

      // Handle specific suspended account error from Supabase
      if (error.message === 'Account suspended') {
        toast.error('Your account is suspended. Please recharge to activate it.');
        setIsLoading(false);
        throw error; // Re-throw to stop further processing
      }
      
      // Fallback to mock data if Supabase authentication fails for other reasons
      const foundOfficer = mockOfficers.find(o => 
        (o.email === identifier || o.mobile === identifier || o.mobile.replace('+91 ', '') === identifier) && 
        o.password === password
      );
      
      if (foundOfficer) {
        // Check status for mock officer as well
        if (foundOfficer.status === 'Suspended') {
          toast.error('Your account is suspended. Please recharge to activate it.');
          setIsLoading(false);
          throw new Error('Account suspended'); // Re-throw to stop further processing
        }

        const officerData: OfficerUser = {
          id: foundOfficer.id,
          name: foundOfficer.name,
          mobile: foundOfficer.mobile,
          email: foundOfficer.email,
          telegram_id: foundOfficer.telegram_id,
          plan_id: foundOfficer.plan_id,
          credits_remaining: foundOfficer.credits_remaining,
          total_credits: foundOfficer.total_credits,
          status: foundOfficer.status,
          department: foundOfficer.department,
          rank: foundOfficer.rank,
          badge_number: foundOfficer.badge_number
        };
        
        setOfficer(officerData);
        localStorage.setItem('officer_auth_user', JSON.stringify(officerData));
        toast.success(`Welcome back, ${officerData.name}!`);
      } else {
        // If neither Supabase nor mock data works, show generic invalid credentials
        toast.error('Invalid credentials. Please check your email/mobile and password.');
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setOfficer(null);
    localStorage.removeItem('officer_auth_user');
    navigate('/officer/login');
    toast.success('Logged out successfully');
  };

  const updateOfficerState = (updates: Partial<OfficerUser>) => {
    setOfficer(prev => {
      if (!prev) return null;
      const updatedOfficer = { ...prev, ...updates };
      localStorage.setItem('officer_auth_user', JSON.stringify(updatedOfficer));
      return updatedOfficer;
    });
  };

  return (
    <OfficerAuthContext.Provider value={{ officer, login, logout, updateOfficerState, isLoading }}>
      {children}
    </OfficerAuthContext.Provider>
  );
};
