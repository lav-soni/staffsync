import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate(`/${user.role}-dashboard`);
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>StaffSync</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="demo-box">
        <p>Demo accounts</p>
        <button className="demo-button" type="button" onClick={() => setForm({ email: "hr@test.com", password: "123456" })}>HR</button>
        <button className="demo-button" type="button" onClick={() => setForm({ email: "manager@test.com", password: "123456" })}>Manager</button>
        <button className="demo-button" type="button" onClick={() => setForm({ email: "riya@test.com", password: "123456" })}>Employee</button>
        </div>
      </div>
    </div>
  );
}