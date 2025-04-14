import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { AuthContext } from "../../contexts/AuthContext";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { checkAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in both fields!", { autoClose: 2000 });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
        formData,
        { withCredentials: true }
      );

      console.log(response.data);

      if (response.status === 200) {
        toast.success("Login successful!", { autoClose: 1000 });

        await checkAuth();

        if (response.data.isAdmin) {
          navigate("/adminDashboard");
        } else {
          navigate("/home");
        }
      } else {
        toast.error(response.data.message || "Login failed!", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server error. Try again!", {
        autoClose: 2000,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="login-page">
        <div className="login-container">
          <div className="sidebar">
            <div className="logo-container">
              <div className="logo-circle">
                <svg
                  viewBox="0 0 24 24"
                  width={40}
                  height={40}
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4z" />
                </svg>
              </div>
            </div>
            <div className="welcome-text">
              <h2>Welcome to DonationHub</h2>
              <p>Connecting donors with those in need</p>
            </div>
          </div>
          <div className="main-content">
            <div className="login-header">
              <h2>Quickly login using</h2>
            </div>
            <div className="or-divider"></div>
            <form
              id="loginForm"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="form-group flex">
                <input
                  type="text"
                  placeholder="Email ID"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required=""
                />
                {/* <button type="button" className="otp-btn">
                  Get OTP
                </button> */}
              </div>
              <div
                className="form-group password-field"
                style={{ position: "relative" }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  name="password"
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
              <button type="submit" className="login-btn">
                Login
              </button>
            </form>
            <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>
            <div className="login-prompt">
              <span>New to DonationHub?</span>
              <Link to="/signup" className="login-prompt-p">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
