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
import RequestDonation from "./pages/RequestDonation/RequestDonation"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionChat from "./pages/TransactionChat/TransactionChat";
import PickupProposalModal from "./components/PickupProposal/PickupProposal";

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
          <Route
            path="/:donationId/request"
            element = {authenticated ? <RequestDonation/> :  <Navigate to="/" />}
          />
          <Route
            path="/:transactionId/chat"
            element = {authenticated ? <TransactionChat/> :  <Navigate to="/" />}
          />
          <Route
            path="/:transactionId/proposePickup"
            element = {authenticated ? <PickupProposalModal/> :  <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
