import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api/axios";
import Navbar from "../components/Navbar";


const today = () => new Date().toLocaleDateString("en-CA");
const time = (d) => (d ? new Date(d).toLocaleTimeString() : "-");

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
      setMessage(type === "check-in" ? "Checked in" : "Checked out");
      setTick((t) => t + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  const todayRecord = records.find((r) => r.date === today());

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Attendance</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card p-3 mb-4">
          <h5>Today ({today()})</h5>
          <p className="mb-2">
            Check-in: {time(todayRecord?.checkIn)} &nbsp;|&nbsp; Check-out: {time(todayRecord?.checkOut)}
          </p>
          <div>
            <button className="btn btn-success me-2" onClick={() => mark("check-in")}
              disabled={!!todayRecord}>Check In</button>
            <button className="btn btn-warning" onClick={() => mark("check-out")}
              disabled={!todayRecord || !!todayRecord.checkOut}>Check Out</button>
          </div>
        </div>

        <h5>My Records</h5>
        <div className="table-responsive mb-4">
          <table className="table table-striped">
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{r.date}</td><td>{time(r.checkIn)}</td><td>{time(r.checkOut)}</td><td>{r.status}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan="4" className="text-center">No records yet</td></tr>}
            </tbody>
          </table>
        </div>

        {(isHR || isManager) && (
          <>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h5 className="mb-0">{isHR ? "All Employees" : "My Team"}</h5>
              <input type="date" className="form-control w-auto" value={date}
                onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="table-responsive mb-4">
              <table className="table table-striped">
                <thead>
                  <tr><th>Name</th><th>Department</th><th>Status</th><th>Check In</th><th>Check Out</th></tr>
                </thead>
                <tbody>
                  {daily.map((e) => (
                    <tr key={e._id}>
                      <td>{e.name}</td>
                      <td>{e.department}</td>
                      <td>
                        <span className={`badge ${e.record ? "bg-success" : "bg-danger"}`}>
                          {e.record ? "Present" : "Absent"}
                        </span>
                      </td>
                      <td>{time(e.record?.checkIn)}</td>
                      <td>{time(e.record?.checkOut)}</td>
                    </tr>
                  ))}
                  {daily.length === 0 && <tr><td colSpan="5" className="text-center">No employees found</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {isHR && (
          <>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h5 className="mb-0">Monthly Report</h5>
              <input type="month" className="form-control w-auto" value={month}
                onChange={(e) => setMonth(e.target.value)} />
            </div>
            <table className="table table-striped">
              <thead><tr><th>Name</th><th>Email</th><th>Days Present</th></tr></thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.email}><td>{r.name}</td><td>{r.email}</td><td>{r.daysPresent}</td></tr>
                ))}
                {report.length === 0 && <tr><td colSpan="3" className="text-center">No data for this month</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
