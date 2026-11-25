import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const FILE_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace("/api", "") + "/uploads/";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", address: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
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

  const handleFileChange = (e) => {
    const chosen = e.target.files[0];
    setFile(chosen || null);
    setPreview(chosen ? URL.createObjectURL(chosen) : "");
  };

  const handleUpload = async () => {
    if (!file) return;
    setMessage("");
    setError("");
    try {
      const data = new FormData();
      data.append("photo", file); // field name must match upload.single("photo")
      const res = await API.put("/employees/me/photo", data);
      setProfile(res.data);
      setFile(null);
      setPreview("");
      setMessage("Photo updated");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  const photoSrc = preview || (profile?.photo ? (profile.photo.startsWith("http") ? profile.photo : FILE_BASE + profile.photo) : "");

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 600 }}>
        <h3>My Profile</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {profile && (
          <>
            <div className="d-flex align-items-center gap-3 mb-3">
              {photoSrc ? (
                <img src={photoSrc} alt="Profile"
                  style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div className="bg-secondary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 100, height: 100, borderRadius: "50%", fontSize: 36 }}>
                  {profile.user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <input type="file" accept="image/png, image/jpeg, image/webp"
                  className="form-control mb-2" onChange={handleFileChange} />
                <button className="btn btn-sm btn-primary" disabled={!file} onClick={handleUpload}>
                  Upload Photo
                </button>
              </div>
            </div>

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
