import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  if (!user) return null;

  const link = "text-white text-decoration-none";

  return (
    <nav className="navbar navbar-dark bg-dark px-3 flex-wrap gap-2">
      <div className="d-flex flex-wrap gap-3 align-items-center">
        <span className="navbar-brand mb-0">StaffSync</span>
        <Link className={link} to={`/${user.role}-dashboard`}>Dashboard</Link>
        {user.role === "hr" && <Link className={link} to="/employees">Employees</Link>}
        <Link className={link} to="/attendance">Attendance</Link>
        <Link className={link} to="/leaves">Leaves</Link>
        <Link className={link} to="/announcements">Announcements</Link>
        <Link className={link} to="/trainings">Trainings</Link>
        <Link className={link} to="/profile">My Profile</Link>
      </div>
      <div className="d-flex align-items-center gap-2">
        <NotificationBell />
        <button className="btn btn-sm btn-outline-light" onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>
    </nav>
  );
}
