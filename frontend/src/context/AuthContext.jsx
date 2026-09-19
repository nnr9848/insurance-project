import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Session expired or invalid token', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const roles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_ADMIN');
  const isManager = roles.includes('ROLE_MANAGER') && !isSuperAdmin;
  const isAdvisor = roles.includes('ROLE_ADVISOR');
  const isPospAgent = roles.includes('ROLE_POSP_AGENT');
  const isStaff = roles.includes('ROLE_STAFF');
  const isClient = roles.includes('ROLE_USER');

  // Capability permissions
  const canManageUsers = isSuperAdmin || isManager;
  const canCreateUsers = isSuperAdmin;
  const canCreateAdmins = isSuperAdmin;
  const canCreateManagers = isSuperAdmin;
  const canCreateAdvisors = isSuperAdmin;
  const canCreatePosp = isSuperAdmin;
  const canAccessCRM = isSuperAdmin || isManager || isAdvisor || isStaff || isPospAgent;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      roles,
      isSuperAdmin,
      isManager,
      isAdvisor,
      isPospAgent,
      isStaff,
      isClient,
      canManageUsers,
      canCreateUsers,
      canCreateAdmins,
      canCreateManagers,
      canCreateAdvisors,
      canCreatePosp,
      canAccessCRM
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
