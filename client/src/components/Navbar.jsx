import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  if (!user) return null;

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <div className="d-flex gap-3 align-items-center">
        <span className="navbar-brand mb-0">StaffSync</span>
        <Link className="text-white text-decoration-none" to={`/${user.role}-dashboard`}>
          Dashboard
        </Link>

        <Link className="text-white text-decoration-none" to="/attendance">
          Attendance
        </Link>

        <Link className="text-white text-decoration-none" to="/leaves">
          Leaves
        </Link>


        
        {user.role === "hr" && (
          <Link className="text-white text-decoration-none" to="/employees">
            Employees
          </Link>
        )}
        <Link className="text-white text-decoration-none" to="/profile">
          My Profile
        </Link>
      </div>
      <button className="btn btn-sm btn-outline-light" onClick={() => dispatch(logout())}>
        Logout
      </button>
    </nav>
  );
}
