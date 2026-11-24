import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const emptyForm = {
  name: "", email: "", password: "", role: "employee",
  department: "", designation: "", manager: "", phone: "", address: "",
};

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEmployees = async (p) => {
    try {
      const { data } = await API.get(`/employees?page=${p}&limit=5`);
      setEmployees(data.employees);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    }
  };

  useEffect(() => {
    loadEmployees(page);
  }, [page]);

  useEffect(() => {
    API.get("/employees/managers").then((res) => setManagers(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, {
          name: form.name, role: form.role, department: form.department,
          designation: form.designation, manager: form.manager,
          phone: form.phone, address: form.address,
        });
        setMessage("Employee updated");
      } else {
        await API.post("/employees", form);
        setMessage("Employee created");
      }
      resetForm();
      loadEmployees(page);
      API.get("/employees/managers").then((res) => setManagers(res.data));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setForm({
      name: emp.user.name,
      email: emp.user.email,
      password: "",
      role: emp.user.role,
      department: emp.department,
      designation: emp.designation || "",
      manager: emp.manager?._id || "",
      phone: emp.phone || "",
      address: emp.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee and their login account?")) return;
    try {
      await API.delete(`/employees/${id}`);
      setMessage("Employee deleted");
      if (employees.length === 1 && page > 1) setPage(page - 1);
      else loadEmployees(page);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3>Manage Employees</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form className="row g-2 mb-4" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <input className="form-control" name="name" placeholder="Full name"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <input className="form-control" type="email" name="email" placeholder="Email"
              value={form.email} onChange={handleChange} required disabled={!!editingId} />
          </div>
          {!editingId && (
            <div className="col-md-4">
              <input className="form-control" type="password" name="password"
                placeholder="Temporary password" value={form.password}
                onChange={handleChange} required minLength={6} />
            </div>
          )}
          <div className="col-md-3">
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div className="col-md-3">
            <input className="form-control" name="department" placeholder="Department"
              value={form.department} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input className="form-control" name="designation" placeholder="Designation"
              value={form.designation} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <select className="form-select" name="manager" value={form.manager} onChange={handleChange}>
              <option value="">No manager</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <input className="form-control" name="phone" placeholder="Phone"
              value={form.phone} onChange={handleChange} />
          </div>
          <div className="col-md-8">
            <input className="form-control" name="address" placeholder="Address"
              value={form.address} onChange={handleChange} />
          </div>
          <div className="col-12">
            <button className="btn btn-primary me-2">
              {editingId ? "Update Employee" : "Add Employee"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Department</th>
                <th>Designation</th><th>Manager</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.user?.name}</td>
                  <td>{emp.user?.email}</td>
                  <td>{emp.user?.role}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.manager?.name || "-"}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(emp)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="7" className="text-center">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-center align-items-center gap-3">
          <button className="btn btn-outline-primary btn-sm" disabled={page <= 1}
            onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {pages}</span>
          <button className="btn btn-outline-primary btn-sm" disabled={page >= pages}
            onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </>
  );
}