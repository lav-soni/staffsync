import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const today = () => new Date().toLocaleDateString("en-CA");
const time = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "-");

export default function Attendance() {
  const { user } = useSelector((state) => state.auth);
  const isHR = user.role === "hr";
  const isManager = user.role === "manager";

  const [records, setRecords] = useState([]);
  const [daily, setDaily] = useState([]);
  const [report, setReport] = useState([]);
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(today().slice(0, 7));
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/attendance/my").then((r) => setRecords(r.data)).catch(() => {});
  }, [tick]);

  useEffect(() => {
    if (!isHR && !isManager) return;
    const url = isHR ? "/attendance" : "/attendance/team";
    API.get(`${url}?date=${date}`).then((r) => setDaily(r.data.team)).catch(() => {});
  }, [date, tick, isHR, isManager]);

  useEffect(() => {
    if (!isHR) return;
    API.get(`/attendance/report?month=${month}`).then((r) => setReport(r.data.data)).catch(() => {});
  }, [month, tick, isHR]);

  const mark = async (type) => {
    setMessage("");
    setError("");
    try {
      await API.post(`/attendance/${type}`);
      setMessage(type === "check-in" ? "Check-in logged successfully." : "Check-out logged successfully.");
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  };

  const todayRecord = records.find((r) => r.date === today());

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4">
        <div className="mb-4">
          <h2 className="page-title mb-1">
            Attendance Records
          </h2>
          <div className="subtitle-glass"></div>
        </div>

        {message && <div className="alert alert-success mb-4">{message}</div>}
        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {/* Action Punch Card */}
        <div className="card p-4 p-md-5 mb-5 glow-card-indigo">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary">Daily Status</span>
                <span className="text-muted small">Date: {today()}</span>
              </div>
              <h4 className="fw-bold mb-2">Today's Punch Status</h4>
              <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                Check-in: <strong className="text-info">{time(todayRecord?.checkIn)}</strong> &nbsp;|&nbsp; Check-out: <strong className="text-warning">{time(todayRecord?.checkOut)}</strong>
              </p>
            </div>

            <div className="d-flex gap-3">
              <button
                className="btn btn-success px-4 py-2"
                onClick={() => mark("check-in")}
                disabled={!!todayRecord}
              >
                Check In
              </button>
              <button
                className="btn btn-warning px-4 py-2"
                onClick={() => mark("check-out")}
                disabled={!todayRecord || !!todayRecord.checkOut}
              >
                Check Out
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-5">
          {/* My Records Card */}
          <div className="card glow-card-cyan">
            <div className="card-header d-flex justify-content-between align-items-center py-3 px-4">
              <strong>My Attendance History</strong>
              <span className="badge bg-info">{records.length} Records</span>
            </div>
            <div className="table-responsive p-2">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-medium py-3">{r.date}</td>
                      <td className="py-3">{time(r.checkIn)}</td>
                      <td className="py-3">{time(r.checkOut)}</td>
                      <td className="py-3">
                        <span className={`badge ${r.status === "present" ? "bg-success" : "bg-warning"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">No records logged yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* HR / Manager Daily Team Attendance */}
          {(isHR || isManager) && (
            <div className="card glow-card-purple">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4">
                <strong>{isHR ? "Workforce Daily Presence" : "Team Daily Presence"}</strong>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Date:</span>
                  <input
                    type="date"
                    className="form-control form-control-sm w-auto"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive p-2">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((e) => (
                      <tr key={e._id}>
                        <td className="fw-medium py-3">{e.name}</td>
                        <td className="py-3">{e.department}</td>
                        <td className="py-3">
                          <span className={`badge ${e.record ? "bg-success" : "bg-danger"}`}>
                            {e.record ? "Present" : "Absent"}
                          </span>
                        </td>
                        <td className="py-3">{time(e.record?.checkIn)}</td>
                        <td className="py-3">{time(e.record?.checkOut)}</td>
                      </tr>
                    ))}
                    {daily.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">No employees recorded for this date</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HR Monthly Report */}
          {isHR && (
            <div className="card glow-card-indigo">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-4">
                <strong>Monthly Attendance Summary</strong>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Month:</span>
                  <input
                    type="month"
                    className="form-control form-control-sm w-auto"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive p-2">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Email Address</th>
                      <th className="text-end">Days Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((r) => (
                      <tr key={r.email}>
                        <td className="fw-medium py-3">{r.name}</td>
                        <td className="text-muted py-3">{r.email}</td>
                        <td className="text-end py-3">
                          <span className="badge bg-success">{r.daysPresent} days</span>
                        </td>
                      </tr>
                    ))}
                    {report.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-4">No report data for this month</td>
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
