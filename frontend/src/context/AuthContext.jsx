// frontend/src/context/AuthContext.jsx
import { useReducer, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './auth/authContext';
import { authReducer } from './auth/authReducer';

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token')
  });

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email,
      password
    });
    
    if (response.data) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      return response.data;
    }
    
    throw new Error('Error de autenticación');
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  // Verificar token al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Configurar el token en los headers de axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};