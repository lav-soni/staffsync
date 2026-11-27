import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import LatestAnnouncements from "../../components/LatestAnnouncements";
import useDashboard from "../../hooks/useDashboard";
import ReportCard from "../../components/ReportCard";


export default function HRDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, error } = useDashboard();

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4">
        {/* Welcome Glass Banner */}
        <div className="card p-4 p-md-5 mb-5 glow-card-indigo position-relative overflow-hidden">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-info text-uppercase">Human Resources</span>
                <span className="text-muted small"></span>
              </div>
              <h2 className="page-title mb-2" style={{ fontSize: "2rem" }}>
                Welcome back, {user?.name || "HR Administrator"}
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "1rem", maxWidth: "600px", lineHeight: "1.6" }}>

              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="glass-metric-pill">
                <span className="user-role-dot role-dot-hr" />
                <span className="fw-semibold">HR Executive Portal</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {data && (
          <div className="d-flex flex-column gap-5">
            <section>
              <div className="row g-4">
                <StatCard title="Total Employees" value={data.totalEmployees} color="primary" link="/employees" />
                <StatCard title="Present Today" value={data.presentToday} color="success" link="/attendance" />
                <StatCard title="Not Checked In" value={data.notCheckedIn} color="danger" link="/attendance" />
                <StatCard title="On Leave Today" value={data.onLeaveToday} color="info" link="/leaves" />
                <StatCard title="Pending Leaves" value={data.pendingLeaves} color="warning" link="/leaves" />
                <StatCard title="Training Programs" value={data.trainingCount} color="secondary" link="/trainings" />
                <StatCard title="Announcements" value={data.announcementCount} color="primary" link="/announcements" />
                <StatCard title="Reports" value={data.reportCount} color="warning" link="/reports" />
              </div>
            </section>

            <section className="workforce-overview" aria-label="Employee overview">
              <div className="workforce-fab" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              <div className="workforce-grid">
                {(data.workforce || []).map((person) => {
                  const initial = person.name ? person.name.charAt(0).toUpperCase() : "?";
                  const role = person.role || "employee";
                  return (
                    <article key={person._id} className={`workforce-person role-${role}`}>
                      <div className={`workforce-avatar role-avatar-${role}`}>{initial}</div>
                      <div className="workforce-person-copy">
                        <div className="workforce-person-name">{person.name}</div>
                        <div className="workforce-person-role">
                          <span className={`user-role-dot role-dot-${role}`} />
                          <span className="text-capitalize">{role}</span>
                        </div>
                        <div className="workforce-person-meta">
                          {[person.designation, person.department].filter(Boolean).join(" · ") || person.email}
                        </div>
                      </div>
                    </article>
                  );
                })}
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
