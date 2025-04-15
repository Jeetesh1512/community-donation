import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { AuthContext } from "./contexts/AuthContext";
import Login from "./pages/Login/Login";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import FrontPage from "./pages/FrontPage/FrontPage";
import Signup from "./pages/Signup/Signup";
import Home from "./pages/Home/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.withCredentials = true;

function App() {
  const { authenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              authenticated ? (
                isAdmin ? (
                  <Navigate to="/adminDashboard" />
                ) : (
                  <Navigate to="/home" />
                )
              ) : (
                <FrontPage />
              )
            }
          />
          <Route
            path="/login"
            element={
              authenticated ? (
                isAdmin ? (
                  <Navigate to="/adminDashboard" />
                ) : (
                  <Navigate to="/home" />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={authenticated ? <Navigate to="/" /> : <Signup />}
          />
          <Route
            path="/adminDashboard"
            element={
              authenticated ? (
                isAdmin ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/home" />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/home"
            element={authenticated ? <Home /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
