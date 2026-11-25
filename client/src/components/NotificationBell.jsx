import { useEffect, useState } from "react";
import API from "../api/axios";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = () =>
    API.get("/notifications")
      .then((r) => {
        setItems(r.data.notifications);
        setUnread(r.data.unreadCount);
      })
      .catch(() => {});

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // refresh every 30 seconds
    return () => clearInterval(timer);
  }, []);

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
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-sm btn-outline-light position-relative"
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
      >
        🔔
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card shadow"
          style={{ position: "absolute", right: 0, top: "110%", width: 320, zIndex: 1000 }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>Notifications</strong>
            <button className="btn btn-link btn-sm p-0" onClick={markAll}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {items.length === 0 && <p className="text-center text-muted my-3">No notifications</p>}
            {items.map((n) => (
              <div
                key={n._id}
                className={`p-2 border-bottom ${n.read ? "" : "bg-light fw-semibold"}`}
                style={{ cursor: "pointer", fontSize: 14 }}
                onClick={() => markRead(n)}
              >
                {n.message}
                <div className="text-muted fw-normal" style={{ fontSize: 12 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
