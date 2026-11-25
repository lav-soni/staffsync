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
      <div className="container mt-4">
        <h3>Welcome, {user.name}</h3>
        {error && <div className="alert alert-danger">{error}</div>}

        {data && (
          <>
            <div className="row g-3 mt-1">
              <StatCard title="Today's attendance" value={att} link="/attendance"
                color={data.myToday ? "success" : "warning"} />
              <StatCard title="Days present this month" value={data.daysPresent} color="info" link="/attendance" />
              <StatCard title="Pending leaves" value={data.leaves.pending} color="warning" link="/leaves" />
              <StatCard title="Approved leaves" value={data.leaves.approved} color="success" link="/leaves" />
              <StatCard title="Rejected leaves" value={data.leaves.rejected} color="danger" link="/leaves" />
              <StatCard title="Trainings not started" value={data.trainings.assigned} color="secondary" link="/trainings" />
              <StatCard title="Trainings in progress" value={data.trainings["in-progress"]} color="warning" link="/trainings" />
              <StatCard title="Trainings completed" value={data.trainings.completed} color="success" link="/trainings" />
            </div>
            <LatestAnnouncements items={data.announcements} />
          </>
        )}
      </div>
    </>
  );
}