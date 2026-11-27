import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const today = () => new Date().toLocaleDateString("en-CA");
const fmt = (d) => new Date(d).toISOString().slice(0, 10);
const days = (s, e) => Math.round((new Date(e) - new Date(s)) / 86400000) + 1;
const badge = { pending: "bg-warning", approved: "bg-success", rejected: "bg-danger" };

const emptyForm = { leaveType: "casual", startDate: "", endDate: "", reason: "" };

export default function LeaveManagement() {
  const { user } = useSelector((state) => state.auth);
  const canApply = user.role === "employee" || user.role === "manager";
  const canReview = user.role === "manager" || user.role === "hr";

  const [form, setForm] = useState(emptyForm);
  const [myLeaves, setMyLeaves] = useState([]);
  const [reviewLeaves, setReviewLeaves] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canApply) return;
    API.get("/leaves/my").then((r) => setMyLeaves(r.data)).catch(() => {});
  }, [tick, canApply]);

  useEffect(() => {
    if (!canReview) return;
    API.get(`/leaves${filter ? `?status=${filter}` : ""}`)
      .then((r) => setReviewLeaves(r.data))
      .catch(() => {});
  }, [filter, tick, canReview]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApply = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await API.post("/leaves", form);
      setMessage("Leave request submitted successfully");
      setForm(emptyForm);
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit request");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    setMessage("");
    setError("");
    try {
      await API.delete(`/leaves/${id}`);
      setMessage("Leave request cancelled");
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel");
    }
  };

  const handleReview = async (id, status) => {
    const comment = window.prompt(`Comment for ${status} (optional):`);
    if (comment === null) return;
    setMessage("");
    setError("");
    try {
      await API.put(`/leaves/${id}/status`, { status, comment });
      setMessage(`Leave request ${status}`);
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4">
        <div className="mb-4">
          <h2 className="page-title mb-1">
            Leave Management
          </h2>
          <div className="subtitle-glass"></div>
        </div>

        {message && <div className="alert alert-success mb-4">{message}</div>}
        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <div className="d-flex flex-column gap-5">
          {canApply && (
            <>
              {/* Apply Card */}
              <div className="card p-4 p-md-5 glow-card-indigo">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-primary">New Request</span>
                  <h4 className="mb-0 fw-bold">Apply for Leave</h4>
                </div>

                <form className="row g-3" onSubmit={handleApply}>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">Leave Type</label>
                    <select className="form-select" name="leaveType" value={form.leaveType} onChange={handleChange}>
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="annual">Annual Leave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      min={today()}
                      value={form.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="endDate"
                      min={form.startDate || today()}
                      value={form.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-primary w-100" type="submit">
                      Submit Request
                    </button>
                  </div>
                  <div className="col-12 mt-3">
                    <label className="form-label small text-muted">Reason for Absence</label>
                    <input
                      className="form-control"
                      name="reason"
                      placeholder="State reason for absence..."
                      value={form.reason}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </form>
              </div>

              {/* My Leave Requests Card */}
              <div className="card glow-card-cyan">
                <div className="card-header d-flex justify-content-between align-items-center py-3 px-4">
                  <strong>My Leave Requests</strong>
                  <span className="badge bg-info">{myLeaves.length} Applications</span>
                </div>
                <div className="table-responsive p-2">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Reviewer Note</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLeaves.map((l) => (
                        <tr key={l._id}>
                          <td className="text-capitalize fw-medium py-3">{l.leaveType}</td>
                          <td className="py-3">{fmt(l.startDate)}</td>
                          <td className="py-3">{fmt(l.endDate)}</td>
                          <td className="py-3">
                            <span className="badge bg-secondary">{days(l.startDate, l.endDate)} days</span>
                          </td>
                          <td className="py-3">{l.reason}</td>
                          <td className="py-3">
                            <span className={`badge ${badge[l.status]}`}>{l.status}</span>
                          </td>
                          <td className="text-muted small py-3">{l.reviewComment || "-"}</td>
                          <td className="text-end py-3">
                            {l.status === "pending" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancel(l._id)}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {myLeaves.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">No leave requests submitted yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Manager / HR Review Section */}
          {canReview && (
            <div className="card glow-card-purple">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4">
                <strong>{user.role === "hr" ? "All Workforce Leave Requests" : "Team Leave Requests"}</strong>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Status:</span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All Statuses</option>
                  </select>
                </div>
              </div>
              <div className="table-responsive p-2">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewLeaves.map((l) => (
                      <tr key={l._id}>
                        <td className="fw-medium py-3">{l.employee?.name}</td>
                        <td className="text-capitalize py-3">{l.leaveType}</td>
                        <td className="py-3">{fmt(l.startDate)}</td>
                        <td className="py-3">{fmt(l.endDate)}</td>
                        <td className="py-3">
                          <span className="badge bg-secondary">{days(l.startDate, l.endDate)} days</span>
                        </td>
                        <td className="py-3">{l.reason}</td>
                        <td className="py-3">
                          <span className={`badge ${badge[l.status]}`}>{l.status}</span>
                        </td>
                        <td className="text-end py-3">
                          {l.status === "pending" && l.employee?._id !== user._id ? (
                            <div className="d-inline-flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleReview(l._id, "approved")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleReview(l._id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small">
                              {l.reviewedBy?.name ? `Reviewed by ${l.reviewedBy.name}` : "-"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reviewLeaves.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">No requests found matching criteria</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
