import React, { useState } from "react";
import { FaLocationArrow } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import LocationMap from "../../components/LocationMap/LocationMap";
import "./Signup.css";

function Signup() {
  const [latLng, setLatLng] = useState({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [goToMyLocation, setGoToMyLocation] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        address,
        coordinates: latLng,
        isAdmin: false,
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/register`,
        payload,
        { withCredentials: true }
      );

      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo-circle">
              <img src="/logo.png" alt="/logo.png" />
            </div>
          </div>
          <div className="welcome-text">
            <h2>Welcome to DonationHub</h2>
            <p>Connecting donors with those in need</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="form-map-wrapper">
            <form id="signupForm" className="form-column" onSubmit={handleSubmit}>
              <div className="signup-header">
                <h2>Sign up & manage fundraisers, donations & more</h2>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  placeholder="Full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="phone"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group password-field" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingRight: "40px" }}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={showPassword ? "./closedEye.png" : "./openEye.png"}
                    alt={showPassword ? "Hide password" : "Show password"}
                    width={20}
                    height={20}
                  />
                </span>
              </div>

              <button type="submit" className="signup-btn">
                Sign up
              </button>
            </form>

            {/* Map Column */}
            <div className="map-column">
              <label style={{ marginBottom: "10px", display: "block" }}>
                Location (Click on the map)
              </label>
              <LocationMap
                setLatLng={setLatLng}
                setAddress={setAddress}
                setGoToMyLocation={setGoToMyLocation}
              />
              <div
                id="coordinates"
                style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}
              >
                <p>
                  {address
                    ? `Selected Address: ${address}`
                    : "Click on the map to select a location."}
                </p>
              </div>
              <button
                type="button"
                className="location-btn"
                onClick={() => goToMyLocation && goToMyLocation()}
              >
                <FaLocationArrow style={{ marginRight: "8px" }} />
                Use My Current Location
              </button>
            </div>
          </div>
          <div className="login-prompt">
            <span>Already a member?</span>
            <Link to="/login" className="login-prompt-p">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
