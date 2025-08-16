// src/pages/WelcomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import backgroundImage from "../assets/rainbow.jpg"; // update with your Krishna/rainbow image

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      {/* Background Image */}
      <img src={backgroundImage} alt="Festival" className="background-img" />

      {/* Overlay with text & buttons */}
      <div className="overlay">
        <div className="text-section">
          <h1>Welcome to Saptarang Society Web Portal ✨</h1>
          <p>A celebration of unity, devotion, and togetherness.</p>

          <div className="buttons">
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              LOGIN
            </button>
            <button
              className="signup-btn"
              onClick={() => navigate("/signup")}
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>

      {/* Floating musical chords */}
      <div className="musical-chords">
        <span>♪</span>
        <span>♫</span>
        <span>♬</span>
        <span>♩</span>
      </div>
    </div>
  );
};

export default WelcomePage;
