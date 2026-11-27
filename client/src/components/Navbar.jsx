import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const reduxUser = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Safe fallback to localStorage or default so navbar NEVER disappears
  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }
  }

  // If on login page, don't show the dashboard navbar
  if (location.pathname === "/login") return null;

  // Safe defaults if user is still loading
  const safeUser = user || { name: "User", role: "employee", email: "" };
  const role = safeUser.role || "employee";
  const name = safeUser.name || safeUser.email?.split("@")[0] || "User";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flow-navbar-wrapper">
      <div className="flow-navbar-container">
        <nav className="flow-navbar" aria-label="Main Navigation">
          {/* Brand Logo with Sleek SVG Mark */}
          <Link to={`/${role}-dashboard`} className="flow-brand">
            <span className="flow-brand-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <span className="flow-brand-text">StaffSync</span>
          </Link>

          {/* Center Navigation Links */}
          <div className="flow-nav-links d-none d-lg-flex">
            <Link
              className={`flow-nav-item ${isActive(`/${role}-dashboard`) ? "active" : ""}`}
              to={`/${role}-dashboard`}
            >
              Dashboard
            </Link>

            {role === "hr" && (
              <Link
                className={`flow-nav-item ${isActive("/employees") ? "active" : ""}`}
                to="/employees"
              >
                Employees
              </Link>
            )}

            <Link
              className={`flow-nav-item ${isActive("/attendance") ? "active" : ""}`}
              to="/attendance"
            >
              Attendance
            </Link>

            <Link
              className={`flow-nav-item ${isActive("/leaves") ? "active" : ""}`}
              to="/leaves"
            >
              Leaves
            </Link>

            <Link
              className={`flow-nav-item ${isActive("/announcements") ? "active" : ""}`}
              to="/announcements"
            >
              Announcements
            </Link>

            <Link
              className={`flow-nav-item ${isActive("/trainings") ? "active" : ""}`}
              to="/trainings"
            >
              Trainings
            </Link>

            <Link
              className={`flow-nav-item ${isActive("/profile") ? "active" : ""}`}
              to="/profile"
            >
              Profile
            </Link>
          </div>

          {/* Right Action Controls: User Badge, Notifications, and Prominent Logout */}
          <div className="flow-nav-actions">
            <div className="flow-user-pill d-none d-md-flex">
              <span className={`user-role-dot role-dot-${role}`} />
              <span className="flow-user-name">{name}</span>
              <span className="flow-user-role">{role}</span>
            </div>

            <NotificationBell />

            {/* Glowing Gradient Logout Button (Always Prominently Visible) */}
            <button
              type="button"
              className="flow-logout-btn"
              onClick={() => dispatch(logout())}
              aria-label="Logout"
              title="Sign out of StaffSync"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="flow-hamburger-btn d-lg-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger-bar ${mobileMenuOpen ? "open-1" : ""}`} />
              <span className={`hamburger-bar ${mobileMenuOpen ? "open-2" : ""}`} />
              <span className={`hamburger-bar ${mobileMenuOpen ? "open-3" : ""}`} />
            </button>
          </div>
        </nav>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <div className="flow-mobile-menu">
            <div className="flow-mobile-links">
              <Link
                className={`flow-mobile-link ${isActive(`/${role}-dashboard`) ? "active" : ""}`}
                to={`/${role}-dashboard`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              {role === "hr" && (
                <Link
                  className={`flow-mobile-link ${isActive("/employees") ? "active" : ""}`}
                  to="/employees"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Employees
                </Link>
              )}

              <Link
                className={`flow-mobile-link ${isActive("/attendance") ? "active" : ""}`}
                to="/attendance"
                onClick={() => setMobileMenuOpen(false)}
              >
                Attendance
              </Link>

              <Link
                className={`flow-mobile-link ${isActive("/leaves") ? "active" : ""}`}
                to="/leaves"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaves
              </Link>

              <Link
                className={`flow-mobile-link ${isActive("/announcements") ? "active" : ""}`}
                to="/announcements"
                onClick={() => setMobileMenuOpen(false)}
              >
                Announcements
              </Link>

              <Link
                className={`flow-mobile-link ${isActive("/trainings") ? "active" : ""}`}
                to="/trainings"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trainings
              </Link>

              <Link
                className={`flow-mobile-link ${isActive("/profile") ? "active" : ""}`}
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>

              <div className="flow-mobile-user-row">
                <span className={`user-role-dot role-dot-${role}`} />
                <span>Signed in as <strong>{name}</strong> ({role})</span>
              </div>

              <button
                type="button"
                className="flow-logout-btn w-100 justify-content-center mt-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  dispatch(logout());
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
