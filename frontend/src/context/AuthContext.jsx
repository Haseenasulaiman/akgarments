import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("ak_token"));
  const [loading, setLoading] = useState(!!token);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      try {
        const { data } = await api.get("/users/me");
        setUser(data);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("ak_token");
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, [token]);

  const handleLogin = (payload) => {
    setToken(payload.token);
    localStorage.setItem("ak_token", payload.token);
    setUser(payload.user || null);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    handleLogin(data);
    toast.success("Welcome back to akgarments");
    if (data.user?.role === "admin") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
    toast.success("Registered. Check email for OTP.");
    navigate("/verify-otp", { state: { email: payload.email } });
  };

  const verifyOtp = async (email, otp) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    handleLogin(data);
    toast.success("Account verified");
    window.location.href = "/";
  };

  const requestPasswordReset = async (email) => {
    await api.post("/auth/request-password-reset", { email });
    toast.success("Password reset link sent to your email");
  };

  const resetPassword = async (token, password) => {
    const { data } = await api.post("/auth/reset-password", {
      token,
      password,
    });
    handleLogin(data);
    toast.success("Password updated");
    window.location.href = "/";
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ak_token");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        register,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

