import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import LatestAnnouncements from "../../components/LatestAnnouncements";
import useDashboard from "../../hooks/useDashboard";
import ReportCard from "../../components/ReportCard";

export default function ManagerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, error } = useDashboard();

  const att = data?.myToday ? (data.myToday.checkOut ? "Checked out" : "Checked in") : "Not checked in";

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4">
        {/* Welcome Glass Banner */}
        <div className="card p-4 p-md-5 mb-5 glow-card-purple position-relative overflow-hidden">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-secondary text-uppercase">Team Lead / Manager</span>
                <span className="text-muted small">• Operations Center</span>
              </div>
              <h2 className="page-title mb-2" style={{ fontSize: "2rem" }}>
                Welcome back, {user?.name || "Manager"}
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "1rem", maxWidth: "600px", lineHeight: "1.6" }}>

              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="glass-metric-pill">
                <span className="user-role-dot role-dot-manager" />
                <span className="fw-semibold">Team Size: {data ? data.teamSize : "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {data && (
          <div className="d-flex flex-column gap-5">
            <section>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Team Performance & Attendance</h4>
                <span className="text-muted small">Daily Status</span>
              </div>
              <div className="row g-4">
                <StatCard
                  title="My Attendance Today"
                  value={att}
                  link="/attendance"
                  color={data.myToday ? "success" : "warning"}
                />
                <StatCard title="Team Size" value={data.teamSize} color="primary" />
                <StatCard title="Team Present Today" value={data.presentToday} color="success" link="/attendance" />
                <StatCard title="Team Not Checked In" value={data.notCheckedIn} color="danger" link="/attendance" />
                <StatCard title="Team On Leave Today" value={data.onLeaveToday} color="info" link="/leaves" />
                <StatCard title="Pending Leave Requests" value={data.pendingLeaves} color="warning" link="/leaves" />
                <StatCard title="Training Programs" value={data.programCount} color="primary" link="/trainings" />
                <StatCard title="Trainees In Progress" value={data.trainees["in-progress"]} color="warning" link="/trainings" />
                <StatCard title="Trainings Completed" value={data.trainees.completed} color="success" link="/trainings" />
                <StatCard title="Reports" value={data.reportCount} color="warning" link="/reports" />
              </div>
            </section>

            <div className="mt-4">
              <ReportCard />
            </div>

            <section>
              <LatestAnnouncements items={data.announcements} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
