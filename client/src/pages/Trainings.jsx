import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const fmt = (d) => new Date(d).toISOString().slice(0, 10);
const badge = {
  assigned: "bg-secondary",
  "in-progress": "bg-warning text-dark",
  completed: "bg-success",
};
const emptyForm = { title: "", description: "", startDate: "", endDate: "", assignedTo: [] };

export default function Trainings() {
  const { user } = useSelector((state) => state.auth);
  const isManager = user.role === "manager";

  const [trainings, setTrainings] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/trainings").then((r) => setTrainings(r.data)).catch(() => setError("Could not load trainings"));
  }, [tick]);

  useEffect(() => {
    if (!isManager) return;
    API.get("/employees/team").then((r) => setTeam(r.data)).catch(() => {});
  }, [isManager]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (id) =>
    setForm({
      ...form,
      assignedTo: form.assignedTo.includes(id)
        ? form.assignedTo.filter((x) => x !== id)
        : [...form.assignedTo, id],
    });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editingId) {
        await API.put(`/trainings/${editingId}`, form);
        setMessage("Training updated");
      } else {
        await API.post("/trainings", form);
        setMessage("Training created");
      }
      resetForm();
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title,
      description: t.description || "",
      startDate: fmt(t.startDate),
      endDate: fmt(t.endDate),
      assignedTo: t.participants.map((p) => p.user._id),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this training program?")) return;
    setMessage("");
    setError("");
    try {
      await API.delete(`/trainings/${id}`);
      setMessage("Training deleted");
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleProgress = async (id, status) => {
    setMessage("");
    setError("");
    try {
      await API.put(`/trainings/${id}/progress`, { status });
      setMessage("Progress updated");
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const isOwner = (t) => isManager && t.createdBy?._id === user._id;

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 900 }}>
        <h3>Training Programs</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {isManager && (
          <form className="card p-3 mb-4" onSubmit={handleSubmit}>
            <h5>{editingId ? "Edit program" : "Create a program"}</h5>
            <input className="form-control mb-2" name="title" placeholder="Title"
              value={form.title} onChange={handleChange} required />
            <textarea className="form-control mb-2" rows="2" name="description" placeholder="Description"
              value={form.description} onChange={handleChange} />
            <div className="row g-2 mb-2">
              <div className="col-md-6">
                <label className="form-label mb-0">Start date</label>
                <input type="date" className="form-control" name="startDate"
                  value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label mb-0">End date</label>
                <input type="date" className="form-control" name="endDate" min={form.startDate}
                  value={form.endDate} onChange={handleChange} required />
              </div>
            </div>

            <label className="form-label mb-1">Assign to team members</label>
            <div className="mb-3">
              {team.map((m) => (
                <div className="form-check" key={m._id}>
                  <input className="form-check-input" type="checkbox" id={m._id}
                    checked={form.assignedTo.includes(m.user._id)}
                    onChange={() => toggleMember(m.user._id)} />
                  <label className="form-check-label" htmlFor={m._id}>
                    {m.user.name} ({m.department})
                  </label>
                </div>
              ))}
              {team.length === 0 && (
                <small className="text-muted">No team members yet. HR must set you as an employee's manager.</small>
              )}
            </div>
            <div>
              <button className="btn btn-primary me-2">{editingId ? "Update" : "Create"}</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        )}

        {trainings.map((t) => (
          <div key={t._id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h5 className="card-title">{t.title}</h5>
                <div>
                  {isOwner(t) && (
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(t)}>Edit</button>
                  )}
                  {(isOwner(t) || user.role === "hr") && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {t.description && <p className="card-text">{t.description}</p>}
              <small className="text-muted">
                {fmt(t.startDate)} to {fmt(t.endDate)} | Created by {t.createdBy?.name}
              </small>

              {user.role === "employee" ? (
                <div className="mt-3 d-flex align-items-center gap-2">
                  <span>My progress:</span>
                  <select className="form-select w-auto" value={t.participants[0]?.status || "assigned"}
                    onChange={(e) => handleProgress(t._id, e.target.value)}>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ) : (
                <div className="mt-3">
                  <strong>Participants</strong>
                  <div>
                    {t.participants.map((p) => (
                      <span key={p.user._id} className={`badge me-2 mt-1 ${badge[p.status]}`}>
                        {p.user.name}: {p.status}
                      </span>
                    ))}
                    {t.participants.length === 0 && <span className="text-muted ms-2">Nobody assigned</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {trainings.length === 0 && <p className="text-center text-muted">No training programs yet</p>}
      </div>
    </>
  );
}