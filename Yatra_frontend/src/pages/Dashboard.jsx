import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Traveller";

  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(
    localStorage.getItem("is_2fa_enabled") === "true"
  );

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const enable2FA = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await api.post(
        "/enable-totp",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQrCode(response.data.qr_code);
      setShowSetup(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate QR Code");
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      if (!code.trim() || code.length !== 6) {
        alert("Please enter a valid 6-digit code");
        return;
      }

      await api.post(
        "/verify-totp-setup",
        {
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("is_2fa_enabled", "true");

      setIs2FAEnabled(true);
      setShowSetup(false);
      setCode("");

      alert("2FA Enabled Successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Invalid Verification Code");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      await api.post(
        "/disable-totp",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("is_2fa_enabled", "false");
      setIs2FAEnabled(false);

      alert("2FA Disabled Successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">Welcome back</p>

          <h1>Hi, {username}</h1>

          <p className="dashboard-intro">
            Your travel dashboard is ready. Manage upcoming bookings, discover
            deals, and keep your journeys on track.
          </p>
        </div>

        <div className="dashboard-summary">
          <article>
            <span>Trips planned</span>
            <strong>4</strong>
          </article>

          <article>
            <span>Upcoming bookings</span>
            <strong>2</strong>
          </article>

          <article>
            <span>Rewards earned</span>
            <strong>1,280</strong>
          </article>
        </div>
      </section>

      <section className="dashboard-card">
        <h2>🔒 Secure Your Account</h2>

        <p>
          Enable Two-Factor Authentication (2FA) using an authenticator app to
          add an extra layer of security to your account.
        </p>

        {!is2FAEnabled ? (
          !showSetup ? (
            <button
              className="btn btn-primary"
              onClick={enable2FA}
              disabled={loading}
            >
              {loading ? "Loading..." : "Enable 2FA with Authenticator"}
            </button>
          ) : (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                maxWidth: "400px",
              }}
            >
              <div>
                <h3 className="mb-3">Scan QR Code</h3>
                <p className="text-secondary mb-3">
                  Use an authenticator app like Google Authenticator, Microsoft
                  Authenticator, or Authy to scan this QR code.
                </p>
                {qrCode && (
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR Code"
                    width="250"
                    style={{ border: "1px solid #ddd", padding: "10px" }}
                  />
                )}
              </div>

              <div>
                <label htmlFor="totp-code" className="form-label">
                  Enter the 6-digit code from your authenticator app:
                </label>
                <input
                  id="totp-code"
                  type="text"
                  className="form-control text-center"
                  placeholder="000000"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  maxLength="6"
                  style={{ fontSize: "24px", letterSpacing: "10px" }}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={verify2FA}
                  disabled={loading || code.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowSetup(false);
                    setCode("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )
        ) : (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#e7f3ff",
              borderRadius: "5px",
              border: "1px solid #b3d9ff",
            }}
          >
            <p className="text-success mb-2">
              <i className="bi bi-check-circle-fill"></i> 2FA is enabled on
              your account
            </p>
            <p className="text-secondary mb-3">
              Your account is now protected with Two-Factor Authentication. You
              will need to enter a code from your authenticator app each time
              you login.
            </p>
            <button
              className="btn btn-danger"
              onClick={disable2FA}
              disabled={loading}
            >
              {loading ? "Processing..." : "Disable 2FA"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
      