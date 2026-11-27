import { Link } from "react-router-dom";

export default function LatestAnnouncements({ items = [] }) {
  return (
    <div className="card mt-4 glow-card-secondary">
      <div className="card-header d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
            <path d="m3 11 18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
          <strong className="text-dark">Latest Announcements</strong>
        </div>
        <Link
          to="/announcements"
          className="btn btn-sm btn-outline-light"
          style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem", borderRadius: "8px" }}
        >
          View all
        </Link>
      </div>

      <ul className="list-group list-group-flush">
        {items.map((a) => (
          <li
            key={a._id}
            className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4"
          >
            <div>
              <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.95rem" }}>{a.title}</div>
              <small className="text-muted">
                Posted by <span className="text-info">{a.postedBy?.name || "Admin"}</span> •{" "}
                {new Date(a.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </small>
            </div>
            <span className="badge bg-secondary text-uppercase" style={{ fontSize: "0.7rem" }}>Official</span>
          </li>
        ))}

        {items.length === 0 && (
          <li className="list-group-item text-center text-muted py-4">
            No active announcements
          </li>
        )}
      </ul>
    </div>
  );
}
