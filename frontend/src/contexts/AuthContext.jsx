import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      setUserId(null);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/authCheck`,
        {
          withCredentials: true,
        }
      );

      if (response.data?.authenticated) {
        setAuthenticated(true);
        setUser(response.data.user || null);
        setIsAdmin(response.data.user?.isAdmin || false);
        setUserId(response.data.user?._id);
      } else {
        setAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
        setUserId(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        isAdmin,
        user,
        setUser,
        checkAuth,
        loading,
        userId,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
