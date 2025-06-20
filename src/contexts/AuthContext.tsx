import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  displayPreference: 'nickname' | 'firstName' | 'fullName';
  isEmailVerified: boolean;
  has2FA: boolean;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  enable2FA: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  disable2FA: (password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  inviteUser: (email: string, firstName: string, lastName: string) => Promise<void>;
  getDisplayName: () => string;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  displayPreference?: 'nickname' | 'firstName' | 'fullName';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock storage functions (replace with actual API calls)
const authStorage = {
  getUser: (): User | null => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem('user');
  },
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
  removeToken: () => {
    localStorage.removeItem('token');
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      const user = authStorage.getUser();
      const token = authStorage.getToken();
      
      if (user && token) {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API call - replace with actual authentication
      if (email === 'demo@sportify.com' && password === 'demo123') {
        const mockUser: User = {
          id: '1',
          email,
          firstName: 'Demo',
          lastName: 'User',
          nickname: 'DemoAthlete',
          displayPreference: 'nickname',
          isEmailVerified: true,
          has2FA: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        
        const mockToken = 'mock-jwt-token';
        
        authStorage.setUser(mockUser);
        authStorage.setToken(mockToken);
        
        setState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Ungültige Anmeldedaten');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen'
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API call - replace with actual registration
      const mockUser: User = {
        id: Date.now().toString(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        displayPreference: data.displayPreference || 'firstName',
        isEmailVerified: false,
        has2FA: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      const mockToken = 'mock-jwt-token';
      
      authStorage.setUser(mockUser);
      authStorage.setToken(mockToken);
      
      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registrierung fehlgeschlagen'
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Mock API call for logout
      authStorage.removeUser();
      authStorage.removeToken();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Mock API call for password reset
    console.log('Password reset requested for:', email);
  };

  const confirmResetPassword = async (token: string, newPassword: string): Promise<void> => {
    // Mock API call for password reset confirmation
    console.log('Password reset confirmed with token:', token);
  };

  const verifyEmail = async (token: string): Promise<void> => {
    // Mock API call for email verification
    if (state.user) {
      const updatedUser = { ...state.user, isEmailVerified: true };
      authStorage.setUser(updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const resendVerification = async (): Promise<void> => {
    // Mock API call for resending verification email
    console.log('Verification email resent');
  };

  const enable2FA = async (): Promise<{ qrCode: string; backupCodes: string[] }> => {
    // Mock API call for enabling 2FA
    if (state.user) {
      const updatedUser = { ...state.user, has2FA: true };
      authStorage.setUser(updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    }
    
    return {
      qrCode: 'mock-qr-code-url',
      backupCodes: ['123456', '789012', '345678']
    };
  };

  const disable2FA = async (password: string): Promise<void> => {
    // Mock API call for disabling 2FA
    if (state.user) {
      const updatedUser = { ...state.user, has2FA: false };
      authStorage.setUser(updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (state.user) {
      const updatedUser = { ...state.user, ...data };
      authStorage.setUser(updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const deleteAccount = async (password: string): Promise<void> => {
    // Mock API call for account deletion
    authStorage.removeUser();
    authStorage.removeToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const inviteUser = async (email: string, firstName: string, lastName: string): Promise<void> => {
    // Mock API call for user invitation
    console.log('User invitation sent to:', email);
  };

  const getDisplayName = (): string => {
    if (!state.user) return '';
    
    switch (state.user.displayPreference) {
      case 'nickname':
        return state.user.nickname || state.user.firstName;
      case 'firstName':
        return state.user.firstName;
      case 'fullName':
        return `${state.user.firstName} ${state.user.lastName}`;
      default:
        return state.user.firstName;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    confirmResetPassword,
    verifyEmail,
    resendVerification,
    enable2FA,
    disable2FA,
    updateProfile,
    deleteAccount,
    inviteUser,
    getDisplayName,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 