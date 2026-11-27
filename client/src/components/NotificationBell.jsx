import { useEffect, useState, useRef } from "react";
import API from "../api/axios";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const load = () =>
    API.get("/notifications")
      .then((r) => {
        setItems(r.data?.notifications || []);
        setUnread(r.data?.unreadCount || 0);
      })
      .catch(() => {});

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const markRead = async (n) => {
    if (n.read) return;
    await API.put(`/notifications/${n._id}/read`).catch(() => {});
    load();
  };

  const markAll = async () => {
    await API.put("/notifications/read-all").catch(() => {});
    load();
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <button
        type="button"
        className="flow-bell-btn"
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        aria-label="Notifications"
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unread > 0 && (
          <span className="flow-bell-badge">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="liquid-dropdown-menu">
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-light border-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>Notifications</span>
              {unread > 0 && (
                <span className="badge bg-danger" style={{ fontSize: "0.68rem" }}>{unread} unread</span>
              )}
            </div>
            {items.length > 0 && (
              <button
                className="btn btn-sm btn-link text-info text-decoration-none p-0"
                style={{ fontSize: "0.82rem" }}
                onClick={markAll}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {items.length === 0 ? (
              <div className="text-center py-4 text-muted" style={{ fontSize: "0.88rem" }}>
                No notifications to display
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className="p-3 border-bottom border-light border-opacity-10"
                  style={{
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    backgroundColor: n.read ? "transparent" : "rgba(56, 189, 248, 0.08)",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => markRead(n)}
                >
                  <div className="d-flex align-items-start gap-2">
                    {!n.read && (
                      <span
                        className="rounded-circle mt-1"
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: "#38bdf8",
                          boxShadow: "0 0 8px #38bdf8",
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <div className={n.read ? "text-muted" : "text-dark fw-semibold"}>
                        {n.message}
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                        {new Date(n.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
