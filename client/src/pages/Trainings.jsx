import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const displayDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

const statusBadge = {
  assigned: "bg-info",
  "in-progress": "bg-warning",
  completed: "bg-success",
};

const emptyForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  assignedTo: [],
};

export default function Trainings() {
  const { user } = useSelector((state) => state.auth);
  const isManager = user?.role === "manager";
  const isHR = user?.role === "hr";

  const [trainings, setTrainings] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    API.get("/trainings")
      .then((r) => setTrainings(r.data || []))
      .catch(() => setError("Could not load trainings"));
  }, [tick]);

  useEffect(() => {
    if (!isManager) return;
    API.get("/employees/team")
      .then((r) => setTeam(r.data || []))
      .catch(() => {});
  }, [isManager]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (id) =>
    setForm({
      ...form,
      assignedTo: form.assignedTo.includes(id)
        ? form.assignedTo.filter((x) => x !== id)
        : [...form.assignedTo, id],
    });

  const selectAllTeam = () => {
    if (form.assignedTo.length === team.length) {
      setForm({ ...form, assignedTo: [] });
    } else {
      setForm({ ...form, assignedTo: team.map((m) => m.user._id) });
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editingId) {
        await API.put(`/trainings/${editingId}`, form);
        setMessage("Training program updated successfully");
      } else {
        await API.post("/trainings", form);
        setMessage("Training program created successfully");
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
      assignedTo: (t.participants || []).map((p) => p.user?._id).filter(Boolean),
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete program "${title || "this training"}"?`)) return;
    setMessage("");
    setError("");
    try {
      await API.delete(`/trainings/${id}`);
      setMessage("Training program deleted");
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
      setMessage("Training progress updated successfully");
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const isOwner = (t) => isManager && t.createdBy?._id === user?._id;

  const filteredTrainings = trainings.filter((t) => {
    if (filter === "completed") {
      if (user.role === "employee") {
        return t.participants?.some((p) => p.user?._id === user._id && p.status === "completed");
      }
      return (
        t.participants?.length > 0 &&
        t.participants.every((p) => p.status === "completed")
      );
    }
    if (filter === "in-progress") {
      if (user.role === "employee") {
        return t.participants?.some((p) => p.user?._id === user._id && p.status === "in-progress");
      }
      return t.participants?.some((p) => p.status === "in-progress");
    }
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4" style={{ maxWidth: 1020 }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="page-title mb-1">
              Professional Development & Training
            </h2>
            <div className="subtitle-glass">
              
            </div>
          </div>

          {isManager && (
            <button
              className={`btn ${isFormOpen ? "btn-outline-light" : "btn-primary"}`}
              onClick={() => {
                if (isFormOpen && editingId) resetForm();
                else setIsFormOpen(!isFormOpen);
              }}
            >
              {isFormOpen ? "Close Form" : "+ Create Program"}
            </button>
          )}
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Manager Create / Edit Program Card */}
        {isManager && isFormOpen && (
          <div className="card p-4 mb-4 glow-card-indigo">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary">
                  {editingId ? "Edit Mode" : "New Track"}
                </span>
                <h5 className="mb-0 fw-bold">
                  {editingId ? "Update Training Program" : "Design New Training Track"}
                </h5>
              </div>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Program Title *</label>
                <input
                  className="form-control"
                  name="title"
                  placeholder="e.g. Cloud Architecture & Microservices Certification"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Description & Objectives</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  placeholder="Outline syllabus, key deliverables, and target proficiencies..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    min={form.startDate}
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small text-muted mb-0">
                    Assign to Team Members ({form.assignedTo.length} selected)
                  </label>
                  {team.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-info p-0 text-decoration-none"
                      onClick={selectAllTeam}
                    >
                      {form.assignedTo.length === team.length
                        ? "Deselect All"
                        : "Select All Team"}
                    </button>
                  )}
                </div>

                <div className="row g-2">
                  {team.map((m) => {
                    const isSelected = form.assignedTo.includes(m.user._id);
                    return (
                      <div className="col-md-6" key={m._id}>
                        <div
                          className={`member-check-card d-flex align-items-center gap-3 ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => toggleMember(m.user._id)}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div
                          />
                          <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: "0.85rem" }}>
                            {m.user?.name ? m.user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="fw-bold small">{m.user?.name}</div>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {m.department} • {m.designation || "Member"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {team.length === 0 && (
                    <div className="col-12 text-muted small p-2">
                      No direct team members found. HR must assign you as the reporting manager for employees first.
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                  {editingId ? "Save Changes" : "Launch Program"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="btn-group btn-group-sm" role="group">
            {[
              { id: "all", label: "All Programs" },
              { id: "in-progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn ${
                  filter === f.id ? "btn-primary" : "btn-outline-light"
                }`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-muted small">
            Showing <strong>{filteredTrainings.length}</strong> of{" "}
            <strong>{trainings.length}</strong> programs
          </span>
        </div>

        {/* Trainings Cards List */}
        <div className="d-flex flex-column gap-3">
          {filteredTrainings.map((t) => {
            const myParticipant = t.participants?.find((p) => p.user?._id === user?._id);
            const totalAssigned = t.participants?.length || 0;
            const completedCount =
              t.participants?.filter((p) => p.status === "completed").length || 0;
            const percent = totalAssigned
              ? Math.round((completedCount / totalAssigned) * 100)
              : 0;

            return (
              <div
                key={t._id}
                className="card p-4 glow-card-indigo position-relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span className="badge bg-secondary">
                        {displayDate(t.startDate)} – {displayDate(t.endDate)}
                      </span>
                      <span className="text-muted small">
                        By {t.createdBy?.name || "Corporate L&D"}
                      </span>
                    </div>
                    <h4 className="fw-bold mb-1">{t.title}</h4>
                  </div>

                  {/* Actions for Manager or HR */}
                  <div className="d-flex gap-2">
                    {isOwner(t) && (
                      <button
                        className="btn btn-sm btn-outline-light"
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}
                        onClick={() => handleEdit(t)}
                        title="Edit Program"
                      >
                        Edit
                      </button>
                    )}
                    {(isOwner(t) || isHR) && (
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}
                        onClick={() => handleDelete(t._id, t.title)}
                        title="Delete Program"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {t.description && (
                  <p className="text-secondary mb-3" style={{ fontSize: "0.95rem" }}>
                    {t.description}
                  </p>
                )}

                {/* Overall Cohort Completion Progress Bar */}
                {totalAssigned > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-1">
                      <span>Cohort Completion Rate</span>
                      <strong className="text-dark">{percent}% ({completedCount}/{totalAssigned} finished)</strong>
                    </div>
                    <div
                      className="progress"
                      style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px" }}
                    >
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${percent}%`, borderRadius: "999px", transition: "width 0.4s ease" }}
                      />
                    </div>
                  </div>
                )}

                {/* Interactive Status for Employees vs Participants for Management */}
                {user.role === "employee" ? (
                  <div className="pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">My Status:</span>
                      <span className={`badge ${statusBadge[myParticipant?.status || "assigned"]}`}>
                        {myParticipant?.status || "assigned"}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">Update Progress:</span>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "auto" }}
                        value={myParticipant?.status || "assigned"}
                        onChange={(e) => handleProgress(t._id, e.target.value)}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-top border-secondary border-opacity-25">
                    <div className="text-muted small mb-2 fw-semibold">
                      Enrolled Team Members ({totalAssigned}):
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {t.participants?.map((p) => (
                        <div
                          key={p.user?._id || Math.random()}
                          className="badge bg-secondary d-flex align-items-center gap-2 py-1 px-2"
                        >
                          <span>{p.user?.name || "Employee"}</span>
                          <span
                            className={`badge ${statusBadge[p.status || "assigned"]} text-capitalize`}
                            style={{ fontSize: "0.68rem", padding: "0.15rem 0.4rem" }}
                          >
                            {p.status}
                          </span>
                        </div>
                      ))}
                      {totalAssigned === 0 && (
                        <span className="text-muted small">No participants assigned</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredTrainings.length === 0 && (
            <div className="card p-5 text-center text-muted glow-card-indigo">
              <h5>No Training Programs</h5>
              <p className="mb-0 small">
                {isManager
                  ? "Click 'Create Program' above to design and assign courses to your team."
                  : "You currently have no training programs assigned."}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
