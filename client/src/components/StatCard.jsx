import { Link } from "react-router-dom";

// Clean minimal SVG line icons (no emojis)
const icons = {
  primary: (
    // Users / Workforce
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  success: (
    // Check circle / verified
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  danger: (
    // Alert / clock warning
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    // Hourglass / pending
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </svg>
  ),
  info: (
    // Calendar / schedule
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  secondary: (
    // Bullhorn / Broadcast
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  )
};

const colorStyles = {
  primary: {
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.35)",
    glow: "rgba(56, 189, 248, 0.25)"
  },
  success: {
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.35)",
    glow: "rgba(52, 211, 153, 0.25)"
  },
  danger: {
    color: "#fb7185",
    bg: "rgba(251, 113, 133, 0.12)",
    border: "rgba(251, 113, 133, 0.35)",
    glow: "rgba(251, 113, 133, 0.25)"
  },
  warning: {
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.35)",
    glow: "rgba(251, 191, 36, 0.25)"
  },
  info: {
    color: "#22d3ee",
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.35)",
    glow: "rgba(34, 211, 238, 0.25)"
  },
  secondary: {
    color: "#a78bfa",
    bg: "rgba(167, 139, 250, 0.12)",
    border: "rgba(167, 139, 250, 0.35)",
    glow: "rgba(167, 139, 250, 0.25)"
  }
};

export default function StatCard({ title, value, color = "primary", link }) {
  const theme = colorStyles[color] || colorStyles.primary;
  const icon = icons[color] || icons.primary;

  const cardContent = (
    <div
      className="modern-stat-card"
      style={{
        "--theme-color": theme.color,
        "--theme-bg": theme.bg,
        "--theme-border": theme.border,
        "--theme-glow": theme.glow
      }}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        <div className="stat-card-icon-badge" style={{ color: theme.color, backgroundColor: theme.bg, borderColor: theme.border }}>
          {icon}
        </div>
      </div>

      <div className="stat-card-metric-row">
        <span className="stat-card-number">{value ?? "-"}</span>
      </div>

      {link && (
        <div className="stat-card-footer">
          <span className="stat-card-link-text">
            <span>View Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="col-12 col-sm-6 col-lg-3">
      {link ? (
        <Link to={link} className="text-decoration-none d-block h-100">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </div>
  );
}
