import { useEffect, useState } from "react";
import API from "../api/axios";

const thisMonth = () => new Date().toLocaleDateString("en-CA").slice(0, 7);

// escape for CSV, and neutralise cells that spreadsheets would treat as formulas
const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export default function ReportCard() {
  const [month, setMonth] = useState(thisMonth());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!month) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    API.get(`/dashboard/report?month=${month}`)
      .then((r) => !cancelled && setReport(r.data))
      .catch((err) => !cancelled && setError(err.response?.data?.message || "Could not load report"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month]);

  const downloadCsv = () => {
    if (!report) return;
    const head = ["Name", "Email", "Department", "Days Present", "Attendance %", "Approved Leave Days", "Trainings Assigned", "Trainings Completed"];
    const lines = report.rows.map((r) =>
      [r.name, r.email, r.department, r.daysPresent, r.attendancePct, r.leaveDays, r.trainingsAssigned, r.trainingsCompleted]
        .map(csvCell)
        .join(",")
    );
    const blob = new Blob(["\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staffsync-report-${report.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tile = (label, value, suffix = "") => (
    <div className="col-6 col-lg-3" key={label}>
      <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="small text-muted">{label}</div>
        <div className="fs-4 fw-semibold">{value}{suffix}</div>
      </div>
    </div>
  );

  const barColor = (p) => (p >= 85 ? "bg-success" : p >= 60 ? "bg-warning" : "bg-danger");

  return (
    <div className="card p-4 glow-card-indigo">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0">Monthly Report</h5>
          {report && <small className="text-muted">{report.workingDays} working days counted (Mon to Fri)</small>}
        </div>
        <div className="d-flex align-items-center gap-2">
          <input type="month" className="form-control form-control-sm w-auto" value={month}
            max={thisMonth()} onChange={(e) => setMonth(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={downloadCsv}
            disabled={!report || report.rows.length === 0}>
            Download CSV
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && !report && <p className="text-muted mb-0">Loading report...</p>}

      {report && (
        <>
          <div className="row g-3 mb-3">
            {tile("Employees", report.summary.employees)}
            {tile("Avg. attendance", report.summary.avgAttendance, "%")}
            {tile("Approved leave days", report.summary.totalLeaveDays)}
            {tile("Training completion", report.summary.trainingCompletion, "%")}
          </div>
          {report.summary.pendingLeaves > 0 && (
            <div className="small text-muted mb-2">{report.summary.pendingLeaves} leave request(s) still pending</div>
          )}

          <div className="table-responsive" style={{ maxHeight: 340, overflowY: "auto" }}>
            <table className="table align-middle mb-0" style={{ "--bs-table-bg": "transparent", "--bs-table-color": "inherit" }}>
              <thead>
                <tr>
                  <th>Employee</th><th>Department</th><th>Present</th>
                  <th style={{ minWidth: 150 }}>Attendance</th><th>Leave days</th><th>Training</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r) => (
                  <tr key={r.email}>
                    <td>
                      <div className="fw-semibold">{r.name}</div>
                      <small className="text-muted">{r.email}</small>
                    </td>
                    <td>{r.department}</td>
                    <td>{r.daysPresent}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div className={`progress-bar ${barColor(r.attendancePct)}`} style={{ width: `${r.attendancePct}%` }} />
                        </div>
                        <small>{r.attendancePct}%</small>
                      </div>
                    </td>
                    <td>{r.leaveDays}</td>
                    <td>{r.trainingsCompleted}/{r.trainingsAssigned}</td>
                  </tr>
                ))}
                {report.rows.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">No employees to report on</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}