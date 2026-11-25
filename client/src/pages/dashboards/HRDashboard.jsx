import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import LatestAnnouncements from "../../components/LatestAnnouncements";
import useDashboard from "../../hooks/useDashboard";

export default function HRDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, error } = useDashboard();

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Welcome, {user.name}</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        {data && (
          <>
            <div className="row g-3 mt-1">
              <StatCard title="Total employees" value={data.totalEmployees} color="primary" link="/employees" />
              <StatCard title="Present today" value={data.presentToday} color="success" link="/attendance" />
              <StatCard title="Not checked in today" value={data.notCheckedIn} color="danger" link="/attendance" />
              <StatCard title="On leave today" value={data.onLeaveToday} color="info" link="/leaves" />
              <StatCard title="Pending leave requests" value={data.pendingLeaves} color="warning" link="/leaves" />
              <StatCard title="Training programs" value={data.trainingCount} color="primary" link="/trainings" />
              <StatCard title="Announcements" value={data.announcementCount} color="secondary" link="/announcements" />
            </div>

            <div className="row mt-4 g-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header"><strong>Employees by department</strong></div>
                  <table className="table mb-0">
                    <tbody>
                      {data.departments.map((dep) => (
                        <tr key={dep._id}><td>{dep._id}</td><td className="text-end">{dep.count}</td></tr>
                      ))}
                      {data.departments.length === 0 && (
                        <tr><td className="text-muted">No employees yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header"><strong>Accounts by role</strong></div>
                  <table className="table mb-0">
                    <tbody>
                      {data.roles.map((r) => (
                        <tr key={r._id}><td className="text-capitalize">{r._id}</td><td className="text-end">{r.count}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <LatestAnnouncements items={data.announcements} />
          </>
        )}
      </div>
    </>
  );
}
