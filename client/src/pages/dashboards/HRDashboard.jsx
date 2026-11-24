import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";

export default function HRDashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>HR Dashboard</h2>
        <p>Welcome, {user.name}</p>
      </div>
    </>
  );
}
