'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginApi, registerApi } from '../lib/api';

export const AuthContext = createContext(null);

// Helper to resolve session based on route context (Parent vs Admission Team)
const getStoredSession = (path = '') => {
  if (typeof window === 'undefined') return { token: null, user: null };

  const adminToken = localStorage.getItem('admission_admin_token') || localStorage.getItem('admin_token');
  const adminUserStr = localStorage.getItem('admission_admin_user') || localStorage.getItem('admin_user');
  
  const parentToken = localStorage.getItem('admission_parent_token') || localStorage.getItem('parent_token');
  const parentUserStr = localStorage.getItem('admission_parent_user') || localStorage.getItem('parent_user');

  const genericToken = localStorage.getItem('admission_token');
  const genericUserStr = localStorage.getItem('admission_user');

  let adminUser = null;
  let parentUser = null;
  let genericUser = null;

  try { if (adminUserStr) adminUser = JSON.parse(adminUserStr); } catch (e) {}
  try { if (parentUserStr) parentUser = JSON.parse(parentUserStr); } catch (e) {}
  try { if (genericUserStr) genericUser = JSON.parse(genericUserStr); } catch (e) {}

  if (adminUser) adminUser.role = (adminUser.role || 'admission_team').toLowerCase();
  if (parentUser) parentUser.role = (parentUser.role || 'parent').toLowerCase();
  if (genericUser) genericUser.role = (genericUser.role || 'parent').toLowerCase();

  // If path is specifically under /admission
  if (path.startsWith('/admission')) {
    if (adminToken && adminUser) return { token: adminToken, user: adminUser };
    if (genericToken && genericUser && genericUser.role === 'admission_team') return { token: genericToken, user: genericUser };
    return { token: null, user: null };
  }

  // If path is specifically under /parent
  if (path.startsWith('/parent')) {
    if (parentToken && parentUser) return { token: parentToken, user: parentUser };
    if (genericToken && genericUser && genericUser.role === 'parent') return { token: genericToken, user: genericUser };
    return { token: null, user: null };
  }

  // On public pages (/login, /register, /, etc.), prioritize last stored user
  if (adminToken && adminUser) return { token: adminToken, user: adminUser };
  if (parentToken && parentUser) return { token: parentToken, user: parentUser };
  if (genericToken && genericUser) return { token: genericToken, user: genericUser };

  return { token: null, user: null };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage based on active route context
  useEffect(() => {
    try {
      localStorage.removeItem('eduflow_admission_mock_db_v2');
      localStorage.removeItem('eduflow_mock_students');
      localStorage.removeItem('eduflow_mock_db');

      const session = getStoredSession(pathname || '');
      setToken(session.token);
      setUser(session.user);
    } catch (e) {
      console.error('Failed to restore session from localStorage', e);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await loginApi(credentials);
      const payload = res?.data || res;
      const authToken = payload?.token || res?.token;
      const authUser = payload?.user || res?.user;

      if (!authUser || !authToken) {
        throw new Error(res?.message || 'Login failed: invalid response from server');
      }

      const normalizedUser = {
        ...authUser,
        role: (authUser.role || 'parent').toLowerCase()
      };

      // Store in role-isolated keys to prevent token conflicts
      if (normalizedUser.role === 'admission_team') {
        localStorage.setItem('admission_admin_token', authToken);
        localStorage.setItem('admission_admin_user', JSON.stringify(normalizedUser));
      } else {
        localStorage.setItem('admission_parent_token', authToken);
        localStorage.setItem('admission_parent_user', JSON.stringify(normalizedUser));
      }

      // Generic fallback for backward compatibility
      localStorage.setItem('admission_token', authToken);
      localStorage.setItem('admission_user', JSON.stringify(normalizedUser));

      setToken(authToken);
      setUser(normalizedUser);
      showToast(`Welcome back, ${normalizedUser.name || 'User'}!`, 'success');

      if (normalizedUser.role === 'admission_team') {
        router.push('/admission/dashboard');
      } else {
        router.push('/parent/dashboard');
      }
      return { token: authToken, user: normalizedUser };
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerApi(userData);
      const payload = res?.data || res;
      const authToken = payload?.token || res?.token;
      const authUser = payload?.user || res?.user;

      if (!authUser || !authToken) {
        throw new Error(res?.message || 'Registration failed: invalid response from server');
      }

      const normalizedUser = {
        ...authUser,
        role: (authUser.role || 'parent').toLowerCase()
      };

      // Save to Parent isolated storage
      localStorage.setItem('admission_parent_token', authToken);
      localStorage.setItem('admission_parent_user', JSON.stringify(normalizedUser));
      localStorage.setItem('admission_token', authToken);
      localStorage.setItem('admission_user', JSON.stringify(normalizedUser));

      setToken(authToken);
      setUser(normalizedUser);
      showToast('Account created successfully! Welcome.', 'success');
      router.push('/parent/dashboard');
      return { token: authToken, user: normalizedUser };
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (forcedRole) => {
    const currentRole = forcedRole || (user?.role || (pathname?.startsWith('/admission') ? 'admission_team' : 'parent'));

    try {
      if (currentRole === 'admission_team') {
        localStorage.removeItem('admission_admin_token');
        localStorage.removeItem('admission_admin_user');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        const genericUser = localStorage.getItem('admission_user');
        if (genericUser && genericUser.includes('admission_team')) {
          localStorage.removeItem('admission_token');
          localStorage.removeItem('admission_user');
        }
      } else {
        localStorage.removeItem('admission_parent_token');
        localStorage.removeItem('admission_parent_user');
        localStorage.removeItem('parent_token');
        localStorage.removeItem('parent_user');
        const genericUser = localStorage.getItem('admission_user');
        if (genericUser && !genericUser.includes('admission_team')) {
          localStorage.removeItem('admission_token');
          localStorage.removeItem('admission_user');
        }
      }
    } catch (e) {
      // ignore
    }

    setUser(null);
    setToken(null);
    showToast('Logged out successfully.', 'info');
    router.push('/login');
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: '#F0FDF4',
          border: '#BBF7D0',
          color: '#166534',
          iconBg: '#DCFCE7',
          iconColor: '#15803D'
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FECDD3',
          color: '#991B1B',
          iconBg: '#FEE2E2',
          iconColor: '#DC2626'
        };
      default:
        return {
          bg: '#F0F9FF',
          border: '#BAE6FD',
          color: '#075985',
          iconBg: '#E0F2FE',
          iconColor: '#0284C7'
        };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        showToast
      }}
    >
      {children}

      {/* Professional Floating Toast Notifications */}
      <div
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100vw - 3rem)'
        }}
      >
        {toasts.map((toast) => {
          const style = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
                color: style.color,
                fontSize: '0.86rem',
                lineHeight: 1.45,
                fontWeight: 500,
                animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Icon Badge */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: style.iconBg,
                  color: style.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}
              >
                {toast.type === 'success' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>

              {/* Message */}
              <div style={{ flex: 1, paddingTop: '1px' }}>
                {toast.message}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: style.color,
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
