import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("is_2fa_enabled");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <nav className="app-navbar navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
        <div className="container">
          <NavLink className="navbar-brand fw-bold" to="/">
            Yatra
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#flights">
                  Flights
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#travel"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Travel
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#hotels">
                      Hotels
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#trains">
                      Trains
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="#buses">
                      Buses
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard">
                  Dashboard
                </NavLink>
              </li>
            </ul>

            <div className="d-flex gap-2">
              {isLoggedIn ? (
                <button
                  className="app-navbar-action btn btn-outline-danger"
                  type="button"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              ) : (
                <button
                  className="app-navbar-action btn btn-outline-primary"
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<Landing onLoginClick={() => setIsLoginOpen(true)} />}
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Auth
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => setIsLoggedIn(true)}
        showHero={false}
      />
    </BrowserRouter>
  );
}

export default App;
