import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import heroImage from "../assets/hero.png";
// import DOMPurify from "../../node_modules/dompurify";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../assets/css/style.css";

function Auth({ isOpen, onClose, showHero = true }) {
  const [emailVerificationStatus, setEmailVerificationStatus] =
    useState("idle");
  const [otpType, setOtpType] = useState("");
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);
  const [registerContactMethod, setRegisterContactMethod] = useState("email");
  const [loginContactMethod, setLoginContactMethod] = useState("email");
  const [otpStatus, setOtpStatus] = useState("idle");
  const [otp, setOtp] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // TOTP MFA states
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [userId, setUserId] = useState(null);

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [loginData, setLoginData] = useState({
    login: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const hasConfirmPassword = registerData.confirmPassword.length > 0;
  const passwordsMatch =
    hasConfirmPassword &&
    registerData.password === registerData.confirmPassword;
  const isEmailSignUp = registerContactMethod === "email";
  const isEmailLogin = loginContactMethod === "email";
  const isContactVerified = otpStatus === "verified";
  const modalOpen = typeof isOpen === "boolean" ? isOpen : isAuthOpen;
  const closeAuth = () => {
    if (onClose) {
      onClose();
    } else {
      setIsAuthOpen(false);
    }
  };

  const carouselSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
      title: "Plan smarter journeys",
      copy: "Keep bookings, routes, and travel ideas ready when you need them.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      title: "Discover new stays",
      copy: "Find places that fit the way you like to travel.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
      title: "Travel with confidence",
      copy: "Start with a verified account and keep your plans close.",
    },
  ];

  // Register Inputs

  const handleRegisterChange = (e) => {
    if (e.target.name === "email") {
      setOtpStatus("idle");
      setOtp("");
    }

    if (e.target.name === "mobile") {
      setOtpStatus("idle");
      setOtp("");
    }

    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  // Login Inputs

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterContactMethodChange = (method) => {
    setRegisterContactMethod(method);
    setEmailVerificationStatus("idle");
    setOtpStatus("idle");
    setOtp("");
  };

  const handleEmailVerification = async () => {
    if (!registerData.email.trim()) {
      alert("Please enter your email first");
      return;
    }

    try {
      // API call
      await api.post("/send-email-otp", {
        email: registerData.email,
      });

      setOtpType("email");
      setOtpStatus("sent");
      setOtp("");

      alert("OTP sent to email");
    } catch (error) {
      alert("Failed to send OTP");
    }
  };

  const handleSendOtp = async () => {
    if (!registerData.mobile.trim()) {
      alert("Please enter your phone number first");
      return;
    }

    try {
      await api.post("/send-phone-otp", {
        mobile: registerData.mobile,
      });

      setOtpType("phone");
      setOtpStatus("sent");
      setOtp("");

      alert("OTP sent to phone");
    } catch (error) {
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    try {
      await api.post("/verify-phone-otp", {
        otp,
        mobile: registerData.mobile,
      });

      setOtpStatus("verified");

      alert("OTP verified successfully");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  const handlePrevSlide = () => {
    setActiveSlide((slide) =>
      slide === 0 ? carouselSlides.length - 1 : slide - 1,
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((slide) =>
      slide === carouselSlides.length - 1 ? 0 : slide + 1,
    );
  };

  // Register Submit

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    if (!isContactVerified) {
      alert(isEmailSignUp ? "Please verify your email" : "Please verify OTP");
      return;
    }

    

    const payload = isEmailSignUp
  ? {
      username: `${registerData.firstName} ${registerData.lastName}`,
      email: registerData.email,
      password: registerData.password,
    }
  : {
      username: `${registerData.firstName} ${registerData.lastName}`,
      mobile: registerData.mobile,
      password: registerData.password,
    };

    try {
      setLoading(true);

      const response = await api.post("/register", payload);

      alert(response.data.message);

      if (response.data.message === "Registration Success") {
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          password: "",
          confirmPassword: "",
        });
        setEmailVerificationStatus("idle");
        setOtpStatus("idle");
        setOtp("");

        setIsSignUp(false);
      }
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.detail || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  // Login Submit

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      login: loginData.login.trim(),
      password: loginData.password,
      login_method: isEmailLogin ? "email" : "phone",
    };

    try {
      setLoading(true);

      const response = await api.post("/login", payload);

      if (response.data.requires_2fa) {
        // 2FA is enabled for this user
        setTotpRequired(true);
        setUserId(response.data.user_id);
        setTotpCode("");
        setLoading(false);
        return;
      }

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("username", loginData.login);
        closeAuth();
        navigate("/dashboard");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // TOTP Verification During Login

  const handleVerifyTotpLogin = async (e) => {
    e.preventDefault();

    if (!totpCode.trim() || totpCode.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/verify-totp-login", {
        code: totpCode,
        user_id: userId,
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("username", loginData.login);
        localStorage.setItem("is_2fa_enabled", "true");

        setTotpRequired(false);
        setTotpCode("");
        closeAuth();
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Invalid TOTP code");
      setTotpCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showHero && (
        <main className="auth-page container-fluid">
          <section className="auth-hero text-center">
            <h1 className="fw-bold mb-3">Yatra</h1>
            <p className="text-secondary mb-4">
              Sign in or create an account to continue your journey.
            </p>
            <button
              type="button"
              className="btn auth-submit-btn"
              onClick={() => setIsAuthOpen(true)}
            >
              Open Login
            </button>
          </section>
        </main>
      )}

      {modalOpen && (
        <div
          className="auth-modal modal d-block"
          role="dialog"
          aria-modal="true"
          aria-label="Authentication"
          onClick={closeAuth}
        >
          <div className="modal-dialog modal-dialog-centered auth-modal-dialog">
            <div
              className="modal-content border-0 bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="btn-close auth-close"
                aria-label="Close"
                onClick={closeAuth}
              />

              <div
                className={`auth-card card border-0 ${isSignUp ? "right-panel-active" : ""}`}
              >
                <div className="auth-forms">
                  {/* SIGN UP */}
                  <div className="form-container sign-up-container">
                    <form className="auth-form" onSubmit={handleRegisterSubmit}>
                      <h1 className="fw-bold mb-1">Create Account</h1>

                      <span className="text-secondary mb-2">
                        Use your {isEmailSignUp ? "email" : "phone"} for
                        registration
                      </span>

                      <div className="name-row">
                        <input
                          className="form-control"
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          autoComplete="given-name"
                          required
                        />
                        <input
                          className="form-control"
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          autoComplete="family-name"
                          required
                        />
                      </div>

                      <div
                        className="auth-contact-toggle"
                        role="group"
                        aria-label="Choose signup contact method"
                      >
                        <button
                          type="button"
                          className={`btn ${isEmailSignUp ? "active" : ""}`}
                          onClick={() =>
                            handleRegisterContactMethodChange("email")
                          }
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          className={`btn ${!isEmailSignUp ? "active" : ""}`}
                          onClick={() =>
                            handleRegisterContactMethodChange("phone")
                          }
                        >
                          Phone
                        </button>
                      </div>

                      {isEmailSignUp ? (
                        <>
                          <div className="inline-action-field">
                            <input
                              className="form-control"
                              type="email"
                              name="email"
                              placeholder="Email"
                              value={registerData.email}
                              onChange={handleRegisterChange}
                              autoComplete="email"
                              required
                            />
                            <button
                              type="button"
                              className="btn auth-inline-btn"
                              onClick={handleEmailVerification}
                              disabled={otpStatus === "verified"}
                            >
                              {otpStatus === "verified"
                                ? "Verified"
                                : "Send OTP"}
                            </button>
                            {otpStatus === "sent" && (
                              <div className="inline-action-field">
                                <input
                                  className="form-control"
                                  type="text"
                                  placeholder="Enter Email OTP"
                                  value={otp}
                                  onChange={(e) => setOtp(e.target.value)}
                                />

                                <button
                                  type="button"
                                  className="btn auth-inline-btn"
                                  onClick={handleVerifyOtp}
                                >
                                  Verify
                                </button>
                              </div>
                            )}
                          </div>
                          <div
                            className={`verification-status ${emailVerificationStatus}`}
                          >
                            {emailVerificationStatus === "sent"
                              ? "Please check your email"
                              : emailVerificationStatus === "verified"
                                ? "Email verified"
                                : ""}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="inline-action-field">
                            <input
                              className="form-control"
                              type="tel"
                              name="mobile"
                              placeholder="Enter Phone Number"
                              value={registerData.mobile}
                              onChange={handleRegisterChange}
                              autoComplete="tel"
                              inputMode="tel"
                              required
                            />
                            <button
                              type="button"
                              className="btn auth-inline-btn"
                              onClick={handleSendOtp}
                              disabled={otpStatus === "verified"}
                            >
                              {otpStatus === "verified"
                                ? "Verified"
                                : "Send OTP"}
                            </button>
                          </div>
                          {otpStatus === "sent" && (
                            <div className="inline-action-field">
                              <input
                                className="form-control"
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                inputMode="numeric"
                                required
                              />
                              <button
                                type="button"
                                className="btn auth-inline-btn"
                                onClick={handleVerifyOtp}
                              >
                                Verify
                              </button>
                            </div>
                          )}
                          <div className={`verification-status ${otpStatus}`}>
                            {otpStatus === "verified" ? "Phone verified" : ""}
                          </div>
                        </>
                      )}

                      <div className="password-row">
                        <div className="password-field">
                          <input
                            className="form-control"
                            type={showRegisterPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            className="btn password-eye"
                            onClick={() =>
                              setShowRegisterPassword((show) => !show)
                            }
                            aria-label={
                              showRegisterPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            <i
                              className={`bi ${showRegisterPassword ? "bi-eye-slash" : "bi-eye"}`}
                            ></i>
                          </button>
                        </div>

                        <div className="password-field">
                          <input
                            className="form-control"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            className="btn password-eye"
                            onClick={() =>
                              setShowConfirmPassword((show) => !show)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                          >
                            <i
                              className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                            ></i>
                          </button>
                        </div>
                      </div>

                      <div
                        className={`password-match ${hasConfirmPassword ? (passwordsMatch ? "matched" : "unmatched") : "text-center"}`}
                      >
                        {hasConfirmPassword
                          ? passwordsMatch
                            ? "Password matched"
                            : "Password not matched"
                          : "Confirm your password"}
                      </div>

                      <button
                        className="btn auth-submit-btn mt-2"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Please wait..." : "Register"}
                      </button>
                      <div className="google-login">
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100 google-btn"
                          onClick={() =>
                            alert(
                              "Google Sign-In functionality is not implemented yet.",
                            )
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 48 48"
                          >
                            <path
                              fill="#FFC107"
                              d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.19 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                            />
                            <path
                              fill="#FF3D00"
                              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.318 4.337-17.694 10.691z"
                            />
                            <path
                              fill="#4CAF50"
                              d="M24 44c5.167 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.651 36 24 36c-5.17 0-9.628-3.33-11.287-7.946l-6.522 5.025C9.53 39.556 16.227 44 24 44z"
                            />
                            <path
                              fill="#1976D2"
                              d="M43.611 20.083H42V20H24v8h11.303c-1.118 3.158-3.35 5.61-6.084 7.57l.003-.002 6.19 5.238C34.971 41.205 44 34.5 44 24c0-1.341-.138-2.65-.389-3.917z"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="mobile-switch">
                        <span>Already have an account?</span>
                        <button
                          type="button"
                          className="btn btn-link link-button"
                          onClick={() => setIsSignUp(false)}
                        >
                          Sign In
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* SIGN IN */}

                  <div className="form-container sign-in-container">
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                      <h1 className="fw-bold mb-1">Sign In</h1>

                      <span className="text-secondary mb-2">
                        Use your account
                      </span>

                      <div
                        className="auth-contact-toggle"
                        role="group"
                        aria-label="Choose login contact method"
                      >
                        <button
                          type="button"
                          className={`btn ${isEmailLogin ? "active" : ""}`}
                          onClick={() => setLoginContactMethod("email")}
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          className={`btn ${!isEmailLogin ? "active" : ""}`}
                          onClick={() => setLoginContactMethod("phone")}
                        >
                          Phone
                        </button>
                      </div>

                      <input
                        className="form-control"
                        type={isEmailLogin ? "email" : "tel"}
                        name="login"
                        placeholder={isEmailLogin ? "Email" : "Phone Number"}
                        value={loginData.login}
                        onChange={handleLoginChange}
                        autoComplete={isEmailLogin ? "email" : "tel"}
                        inputMode={isEmailLogin ? "email" : "tel"}
                        required
                      />
                      <div className="password-field w-100">
                        <input
                          className="form-control"
                          type={showLoginPassword ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className="btn password-eye"
                          onClick={() => setShowLoginPassword((show) => !show)}
                          aria-label={
                            showLoginPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <i
                            className={`bi ${showLoginPassword ? "bi-eye-slash" : "bi-eye"}`}
                          ></i>
                        </button>
                      </div>

                      <div className="form-options d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 w-100">
                        <label
                          className="form-check remember-option m-0"
                          htmlFor="rememberMe"
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                          />
                          <span className="form-check-label">Remember Me</span>
                        </label>
                        <button
                          type="button"
                          className="btn btn-link link-button"
                          onClick={() =>
                            alert(
                              "Forgot Password functionality is not implemented yet.",
                            )
                          }
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        className="btn auth-submit-btn mt-2"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Please wait..." : "Sign In"}
                      </button>
                      <div className="mobile-switch">
                        <span>New here?</span>
                        <button
                          type="button"
                          className="btn btn-link link-button"
                          onClick={() => setIsSignUp(true)}
                        >
                          Create Account
                        </button>
                      </div>
                    </form>

                    {/* TOTP MFA VERIFICATION */}
                    {totpRequired && (
                      <form
                        className="auth-form"
                        onSubmit={handleVerifyTotpLogin}
                      >
                        <h1 className="fw-bold mb-1">
                          Two-Factor Authentication
                        </h1>
                        <span className="text-secondary mb-3">
                          Enter the 6-digit code from your authenticator app
                        </span>

                        <input
                          className="form-control text-center"
                          type="text"
                          placeholder="000000"
                          value={totpCode}
                          onChange={(e) =>
                            setTotpCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          inputMode="numeric"
                          maxLength="6"
                          required
                          autoFocus
                        />

                        <button
                          className="btn auth-submit-btn mt-3"
                          type="submit"
                          disabled={loading || totpCode.length !== 6}
                        >
                          {loading ? "Verifying..." : "Verify Code"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-link link-button w-100 mt-2"
                          onClick={() => {
                            setTotpRequired(false);
                            setTotpCode("");
                            setUserId(null);
                            setLoginData({ login: "", password: "" });
                          }}
                        >
                          Back to Login
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <aside className="auth-carousel" aria-label="Travel highlights">
                  <div className="auth-carousel-slide">
                    <img
                      src={carouselSlides[activeSlide].image}
                      alt=""
                      className="auth-carousel-image"
                    />
                    <div className="auth-carousel-caption">
                      <h2>{carouselSlides[activeSlide].title}</h2>
                      <p>{carouselSlides[activeSlide].copy}</p>
                    </div>
                    <div className="auth-carousel-actions">
                      <button
                        type="button"
                        className="btn carousel-nav"
                        onClick={handlePrevSlide}
                        aria-label="Previous slide"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <div className="auth-carousel-dots">
                        {carouselSlides.map((slide, index) => (
                          <button
                            type="button"
                            key={slide.title}
                            className={`carousel-dot ${activeSlide === index ? "active" : ""}`}
                            onClick={() => setActiveSlide(index)}
                            aria-label={`Show ${slide.title}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className="btn carousel-nav"
                        onClick={handleNextSlide}
                        aria-label="Next slide"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Auth;
