// src/pages/WelcomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import backgroundImage from "../assets/rainbow.jpg";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch("/notice.txt")
      .then((res) => res.text())
      .then((data) => {
        const items = data.split(";").map((n) => n.trim()).filter(Boolean);
        setNotices(items);
      })
      .catch((err) => console.error("Error loading notices:", err));
  }, []);

  return (
    <div className="welcome-container">
      {/* ====== Banner / Notice Bar ====== */}
      <div className="notice-banner">
          <div className="scrolling-text">
            {notices.length > 0 ? (
              notices.map((notice, idx) => (
                <span key={idx} className="notice-item">
                  {notice}
                </span>
              ))
            ) : (
              <span className="notice-item">📢 Welcome! Stay tuned for updates...</span>
            )}
          </div>
        </div>

      {/* Background Image */}
      <img src={backgroundImage} alt="Festival" className="background-img" />

      {/* Overlay with text & buttons */}
      <div className="overlay">
        <div className="text-section">
          <h1>Welcome to Saptarang Society Web Portal ✨</h1>
          <p>A celebration of unity, devotion, and togetherness.</p>

          <div className="buttons">
            <button className="login-btn" onClick={() => navigate("/login")}>
              LOGIN
            </button>
            <button className="signup-btn" onClick={() => navigate("/signup")}>
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
