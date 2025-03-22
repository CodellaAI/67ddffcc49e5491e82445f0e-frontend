
"use client"

import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from "@/lib/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("token");
      
      if (token) {
        try {
          // Set the token for all future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Fetch current user data
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to authenticate token:", error);
          Cookies.remove("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await apiLogin(email, password);
    
    // Save token to cookies
    Cookies.set("token", token, { expires: 7 }); // Expires in 7 days
    
    // Set the token for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    setUser(user);
    return user;
  };

  const register = async (email, username, password) => {
    const { token, user } = await apiRegister(email, username, password);
    
    // Save token to cookies
    Cookies.set("token", token, { expires: 7 }); // Expires in 7 days
    
    // Set the token for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear cookies and state even if the API call fails
      Cookies.remove("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
