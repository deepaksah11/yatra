import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Enable2FA() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Traveller";

  const [is2FAEnabled, setIs2FAEnabled] = useState(
    localStorage.getItem("is_2fa_enabled") === "true"
  );

  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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
      alert(error.response?.data?.detail || "Failed to generate QR code");
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
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Invalid verification code");
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
          <p className="dashboard-eyebrow">Account Security</p>
          <h1>Two-Factor Authentication</h1>
          <p className="dashboard-intro">
            Protect your Yatra account with an additional layer of security.
          </p>
        </div>
      </section>

      <section className="dashboard-card">
        <h2>🔐 Authenticator Setup</h2>

        {!is2FAEnabled ? (
          !showSetup ? (
            <>
              <p>
                Two-Factor Authentication adds an extra layer of security to your
                account. You'll need to enter a code from an authenticator app
                each time you login.
              </p>
              <p className="text-secondary">
                Supported apps: Google Authenticator, Microsoft Authenticator,
                Authy, and more.
              </p>
              <button
                className="btn btn-primary"
                onClick={enable2FA}
                disabled={loading}
              >
                {loading ? "Generating..." : "Enable 2FA"}
              </button>
            </>
          ) : (
            <div style={{ maxWidth: "500px" }}>
              <h3 className="mb-3">Step 1: Scan QR Code</h3>
              <p className="text-secondary mb-3">
                Open your authenticator app and scan this QR code.
              </p>
              {qrCode && (
                <div style={{ marginBottom: "20px" }}>
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="2FA QR Code"
                    width="200"
                    style={{ border: "1px solid #ddd", padding: "10px" }}
                  />
                </div>
              )}

              <h3 className="mb-3">Step 2: Enter Verification Code</h3>
              <p className="text-secondary mb-3">
                Enter the 6-digit code from your authenticator app to confirm
                the setup.
              </p>
              <div className="mb-3">
                <label htmlFor="totp-code" className="form-label">
                  6-Digit Code
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
              padding: "20px",
              backgroundColor: "#d4edda",
              borderRadius: "5px",
              border: "1px solid #c3e6cb",
            }}
          >
            <h3 className="text-success mb-3">
              <i className="bi bi-check-circle-fill"></i> 2FA is Active
            </h3>
            <p className="mb-3">
              Your account is now protected with Two-Factor Authentication. Each
              time you login, you'll need to enter a code from your authenticator
              app in addition to your password.
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

export default Enable2FA;
        