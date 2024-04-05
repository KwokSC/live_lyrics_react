import "./MainPage.scss";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <div className="banner">
        <img src="./images/banner.png" alt="banner"></img>
      </div>
      <div className="head-bar" />
      <div className="welcome-container">
        <h1>
          BuskLive - <br /> The busk live enhancement platform
        </h1>
        <p>
          Engagement, resonance, empathy, <br /> All start from here...
        </p>
        <div className="entrance-button">
          <div className="nav-buttons">
            <button
              onClick={() => {
                navigate("/explore");
              }}
            >
              Explore
            </button>
            <button
              onClick={() => {
                navigate("/login");
              }}
            >
              Login
            </button>
          </div>
          <div className="social-buttons">
            <a
              href="https://www.linkedin.com/in/chunkie0518/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fi fi-brands-linkedin"></i>
            </a>
            <a
              href="https://github.com/KwokSC"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fi fi-brands-github"></i>
            </a>
            <a
              href="https://www.instagram.com/beefanatic0518/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fi fi-brands-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
