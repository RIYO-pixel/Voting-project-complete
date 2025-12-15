import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. On load, check if cookies exist to restore session
  useEffect(() => {
    const storedConstituency = Cookies.get('constituencyNo');
    const storedPartNo = Cookies.get('partNo');
    const storedUser = Cookies.get('officerUser');

    if (storedConstituency && storedPartNo && storedUser) {
      setAuthData({
        constituencyNo: storedConstituency,
        partNo: storedPartNo,
        username: storedUser,
      });
    }
    setLoading(false);
  }, []);

  // 2. Login Function
  const login = (constituencyNo, partNo, username) => {
    // Set Cookies (expires in 1 day)
    Cookies.set('constituencyNo', constituencyNo, { expires: 1 });
    Cookies.set('partNo', partNo, { expires: 1 });
    Cookies.set('officerUser', username, { expires: 1 });

    // Update State
    setAuthData({
      constituencyNo,
      partNo,
      username,
    });

    // Navigate to candidate check page
    navigate('/check-candidate');
  };

  // 3. Logout Function
  const logout = () => {
    // Remove Cookies
    Cookies.remove('constituencyNo');
    Cookies.remove('partNo');
    Cookies.remove('officerUser');

    // Clear State
    setAuthData(null);

    // Redirect to Login Page
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);