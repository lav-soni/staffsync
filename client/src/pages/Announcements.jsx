import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Announcements() {
  const { user } = useSelector((state) => state.auth);
  const canPost = user.role === "hr" || user.role === "manager";

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/announcements?page=${page}&limit=5`)
      .then((r) => {
        setItems(r.data.announcements);
        setPages(r.data.pages);
      })
      .catch(() => setError("Could not load announcements"));
  }, [page, tick]);

  const handlePost = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await API.post("/announcements", form);
      setForm({ title: "", body: "" });
      setMessage("Announcement posted successfully");
      setPage(1);
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not post announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    setMessage("");
    setError("");
    try {
      await API.delete(`/announcements/${id}`);
      setMessage("Announcement deleted");
      if (items.length === 1 && page > 1) setPage(page - 1);
      else setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete");
    }
  };

  const canDelete = (a) =>
    user.role === "hr" || (user.role === "manager" && a.postedBy?._id === user._id);

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4" style={{ maxWidth: 960 }}>
        <div className="mb-4">
          <h2 className="page-title mb-1">
            Company Announcements
          </h2>
          <div className="subtitle-glass"></div>
        </div>

        {message && <div className="alert alert-success mb-4">{message}</div>}
        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {canPost && (
          <form className="card p-4 p-md-5 mb-5 glow-card-indigo" onSubmit={handlePost}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-primary"></span>
              <h4 className="mb-0 fw-bold">Publish New Announcement</h4>
            </div>

            <div className="mb-3">
              <label className="form-label small text-muted">Title</label>
              <input
                className="form-control"
                placeholder="e.g. Company Townhall & Product Roadmap Update"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small text-muted">Message Content</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Compose your update message..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </div>

            <div>
              <button className="btn btn-primary px-4 py-2" type="submit">
                Publish Announcement
              </button>
            </div>
          </form>
        )}

        <div className="d-flex flex-column gap-4">
          {items.map((a) => (
            <div key={a._id} className="card glow-card-secondary">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h4 className="fw-bold mb-0">{a.title}</h4>
                  {canDelete(a) && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(a._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="card-text text-secondary my-3" style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "1rem" }}>
                  {a.body}
                </p>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top border-light border-opacity-10 mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="user-role-dot role-dot-hr" />
                    <span className="small fw-semibold">{a.postedBy?.name || "Administration"}</span>
                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: "0.65rem" }}>
                      {a.postedBy?.role || "StaffSync"}
                    </span>
                  </div>
                  <span className="text-muted small">
                    {new Date(a.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="card p-5 text-center text-muted">
              <span>No announcements posted yet</span>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
            <button
              className="btn btn-outline-light btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="badge bg-secondary px-3 py-2">
              Page {page} of {pages}
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </>
  );
}
