import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate(`/${user.role}-dashboard`);
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  const handleDemo = (email, password) => {
    setForm({ email, password });
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        {/* Ambient card aura glow */}
        <div className="login-card-glow" />

        <div className="login-card">
          <div className="login-brand-header">
            <div className="login-brand-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h1>StaffSync</h1>
            <p className="subtitle">Enterprise Workforce & HR Operations Platform</p>
          </div>

          {error && (
            <div className="login-error-glass">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group-glass">
              <label>Work Email</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group-glass">
              <label>Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn-liquid" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="demo-section-glass">
            <div className="demo-label-divider">
              <span>Quick Demo Access</span>
            </div>
            <div className="demo-pills-row">
              <button
                type="button"
                className="demo-pill-btn pill-hr"
                onClick={() => handleDemo("hr@test.com", "123456")}
              >
                <span className="pill-dot hr-dot" />
                HR Admin
              </button>
              <button
                type="button"
                className="demo-pill-btn pill-manager"
                onClick={() => handleDemo("manager@test.com", "123456")}
              >
                <span className="pill-dot manager-dot" />
                Manager
              </button>
              <button
                type="button"
                className="demo-pill-btn pill-employee"
                onClick={() => handleDemo("employee@test.com", "123456")}
              >
                <span className="pill-dot employee-dot" />
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
