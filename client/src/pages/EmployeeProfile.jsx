import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", address: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/employees/me")
      .then(({ data }) => {
        setProfile(data);
        setForm({ phone: data.phone || "", address: data.address || "" });
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load profile"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await API.put("/employees/me", form);
      setProfile(data);
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 600 }}>
        <h3>My Profile</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {profile && (
          <>
            <table className="table">
              <tbody>
                <tr><th>Name</th><td>{profile.user?.name}</td></tr>
                <tr><th>Email</th><td>{profile.user?.email}</td></tr>
                <tr><th>Role</th><td>{profile.user?.role}</td></tr>
                <tr><th>Department</th><td>{profile.department}</td></tr>
                <tr><th>Designation</th><td>{profile.designation || "-"}</td></tr>
                <tr><th>Manager</th><td>{profile.manager?.name || "-"}</td></tr>
                <tr>
                  <th>Joined</th>
                  <td>{new Date(profile.joiningDate).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>

            <form onSubmit={handleSubmit}>
              <label className="form-label">Phone</label>
              <input className="form-control mb-3" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <label className="form-label">Address</label>
              <input className="form-control mb-3" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <button className="btn btn-primary">Save Changes</button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
