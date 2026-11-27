import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import LatestAnnouncements from "../../components/LatestAnnouncements";
import useDashboard from "../../hooks/useDashboard";

export default function EmployeeDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, error } = useDashboard();

  const att = data?.myToday ? (data.myToday.checkOut ? "Checked out" : "Checked in") : "Not checked in";

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4">
        {/* Welcome Glass Banner */}
        <div className="card p-4 p-md-5 mb-5 glow-card-success position-relative overflow-hidden">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success text-uppercase">Employee Workspace</span>
                <span className="text-muted small"></span>
              </div>
              <h2 className="page-title mb-2" style={{ fontSize: "2rem" }}>
                Welcome, {user?.name || "Employee"}
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "1rem", maxWidth: "600px", lineHeight: "1.6" }}>
                
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="glass-metric-pill">
                <span className={`user-role-dot ${data?.myToday ? "role-dot-employee" : "role-dot-warning"}`} />
                <span className="fw-semibold">Status: {att}</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {data && (
          <div className="d-flex flex-column gap-5">
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Overview & Activity</h4>
                <span className="text-muted small">Personal Dashboard</span>
              </div>
              <div className="row g-4">
                <StatCard
                  title="Today's Attendance"
                  value={att}
                  link="/attendance"
                  color={data.myToday ? "success" : "warning"}
                />
                <StatCard title="Days Present This Month" value={data.daysPresent} color="info" link="/attendance" />
                <StatCard title="Pending Leaves" value={data.leaves?.pending ?? 0} color="warning" link="/leaves" />
                <StatCard title="Approved Leaves" value={data.leaves?.approved ?? 0} color="success" link="/leaves" />
                <StatCard title="Rejected Leaves" value={data.leaves?.rejected ?? 0} color="danger" link="/leaves" />
                <StatCard title="Trainings Assigned" value={data.trainings?.assigned ?? 0} color="secondary" link="/trainings" />
                <StatCard title="Trainings In Progress" value={data.trainings?.["in-progress"] ?? 0} color="warning" link="/trainings" />
                <StatCard title="Trainings Completed" value={data.trainings?.completed ?? 0} color="success" link="/trainings" />
              </div>
            </section>

            <section>
              <LatestAnnouncements items={data.announcements} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
