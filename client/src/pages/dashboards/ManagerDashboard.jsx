import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";
import LatestAnnouncements from "../../components/LatestAnnouncements";
import useDashboard from "../../hooks/useDashboard";

export default function ManagerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, error } = useDashboard();

  const att = data?.myToday ? (data.myToday.checkOut ? "Checked out" : "Checked in") : "Not checked in";

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Welcome, {user.name}</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        {data && (
          <>
            <div className="row g-3 mt-1">
              <StatCard title="My attendance today" value={att} link="/attendance"
                color={data.myToday ? "success" : "warning"} />
              <StatCard title="Team size" value={data.teamSize} color="primary" />
              <StatCard title="Team present today" value={data.presentToday} color="success" link="/attendance" />
              <StatCard title="Team not checked in" value={data.notCheckedIn} color="danger" link="/attendance" />
              <StatCard title="Team on leave today" value={data.onLeaveToday} color="info" link="/leaves" />
              <StatCard title="Pending leave requests" value={data.pendingLeaves} color="warning" link="/leaves" />
              <StatCard title="Training programs created" value={data.programCount} color="primary" link="/trainings" />
              <StatCard title="Trainees in progress" value={data.trainees["in-progress"]} color="warning" link="/trainings" />
              <StatCard title="Trainings completed" value={data.trainees.completed} color="success" link="/trainings" />
            </div>
            <LatestAnnouncements items={data.announcements} />
          </>
        )}
      </div>
    </>
  );
}
