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
      setMessage("Announcement posted");
      setPage(1);
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not post");
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
      <div className="container mt-4" style={{ maxWidth: 800 }}>
        <h3>Announcements</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {canPost && (
          <form className="card p-3 mb-4" onSubmit={handlePost}>
            <h5>Post an announcement</h5>
            <input
              className="form-control mb-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="form-control mb-2"
              rows="3"
              placeholder="Message"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
            />
            <div>
              <button className="btn btn-primary">Post</button>
            </div>
          </form>
        )}

        {items.map((a) => (
          <div key={a._id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h5 className="card-title">{a.title}</h5>
                {canDelete(a) && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a._id)}>
                    Delete
                  </button>
                )}
              </div>
              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{a.body}</p>
              <small className="text-muted">
                Posted by {a.postedBy?.name || "Unknown"} ({a.postedBy?.role || "-"}) on{" "}
                {new Date(a.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted">No announcements yet</p>}

        <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
          <button className="btn btn-outline-primary btn-sm" disabled={page <= 1}
            onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {pages}</span>
          <button className="btn btn-outline-primary btn-sm" disabled={page >= pages}
            onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </>
  );
}