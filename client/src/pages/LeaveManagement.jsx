import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const today = () => new Date().toLocaleDateString("en-CA");
const fmt = (d) => new Date(d).toISOString().slice(0, 10);
const days = (s, e) => Math.round((new Date(e) - new Date(s)) / 86400000) + 1;
const badge = { pending: "bg-warning text-dark", approved: "bg-success", rejected: "bg-danger" };

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
      setMessage("Leave request submitted");
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
    if (comment === null) return; // pressed Cancel
    setMessage("");
    setError("");
    try {
      await API.put(`/leaves/${id}/status`, { status, comment });
      setMessage(`Leave ${status}`);
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Leave Management</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {canApply && (
          <>
            <h5>Apply for Leave</h5>
            <form className="row g-2 mb-4" onSubmit={handleApply}>
              <div className="col-md-3">
                <select className="form-select" name="leaveType" value={form.leaveType} onChange={handleChange}>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="annual">Annual</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-3">
                <input type="date" className="form-control" name="startDate" min={today()}
                  value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <input type="date" className="form-control" name="endDate" min={form.startDate || today()}
                  value={form.endDate} onChange={handleChange} required />
              </div>
              <div className="col-md-12">
                <input className="form-control" name="reason" placeholder="Reason"
                  value={form.reason} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <button className="btn btn-primary">Submit Request</button>
              </div>
            </form>

            <h5>My Leave Requests</h5>
            <div className="table-responsive mb-4">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Type</th><th>From</th><th>To</th><th>Days</th>
                    <th>Reason</th><th>Status</th><th>Comment</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="text-capitalize">{l.leaveType}</td>
                      <td>{fmt(l.startDate)}</td>
                      <td>{fmt(l.endDate)}</td>
                      <td>{days(l.startDate, l.endDate)}</td>
                      <td>{l.reason}</td>
                      <td><span className={`badge ${badge[l.status]}`}>{l.status}</span></td>
                      <td>{l.reviewComment || "-"}</td>
                      <td>
                        {l.status === "pending" && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(l._id)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {myLeaves.length === 0 && (
                    <tr><td colSpan="8" className="text-center">No leave requests yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {canReview && (
          <>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h5 className="mb-0">{user.role === "hr" ? "All Leave Requests" : "Team Leave Requests"}</h5>
              <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
            </div>
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th>
                    <th>Reason</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>{l.employee?.name}</td>
                      <td className="text-capitalize">{l.leaveType}</td>
                      <td>{fmt(l.startDate)}</td>
                      <td>{fmt(l.endDate)}</td>
                      <td>{days(l.startDate, l.endDate)}</td>
                      <td>{l.reason}</td>
                      <td><span className={`badge ${badge[l.status]}`}>{l.status}</span></td>
                      <td>
                        {l.status === "pending" && l.employee?._id !== user._id ? (
                          <>
                            <button className="btn btn-sm btn-success me-2" onClick={() => handleReview(l._id, "approved")}>
                              Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleReview(l._id, "rejected")}>
                              Reject
                            </button>
                          </>
                        ) : (
                          l.reviewedBy?.name ? `by ${l.reviewedBy.name}` : "-"
                        )}
                      </td>
                    </tr>
                  ))}
                  {reviewLeaves.length === 0 && (
                    <tr><td colSpan="8" className="text-center">No requests found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}