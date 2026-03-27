import { createContext, useContext, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(() => authService.isAuthenticated());
  const [userInfo, setUserInfo] = useState(() => {
    const token = authService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { username: payload.unique_name, role: payload.role };
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password);
    setIsAuth(true);
    setUserInfo({ username: data.username, role: data.role });
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuth(false);
    setUserInfo(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
