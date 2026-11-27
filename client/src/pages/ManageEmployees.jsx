import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  department: "",
  designation: "",
  manager: "",
  phone: "",
  address: "",
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadEmployees = async (p) => {
    try {
      const { data } = await API.get(`/employees?page=${p}&limit=8`);
      setEmployees(data.employees || []);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    }
  };

  useEffect(() => {
    loadEmployees(page);
  }, [page]);

  useEffect(() => {
    API.get("/employees/managers")
      .then((res) => setManagers(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, {
          name: form.name,
          role: form.role,
          department: form.department,
          designation: form.designation,
          manager: form.manager,
          phone: form.phone,
          address: form.address,
        });
        setMessage("Employee profile updated successfully");
      } else {
        await API.post("/employees", form);
        setMessage("New employee created successfully");
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
      name: emp.user?.name || "",
      email: emp.user?.email || "",
      password: "",
      role: emp.user?.role || "employee",
      department: emp.department || "",
      designation: emp.designation || "",
      manager: emp.manager?._id || "",
      phone: emp.phone || "",
      address: emp.address || "",
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, empName) => {
    if (!window.confirm(`Delete ${empName || "this employee"} and their login account?`)) return;
    setError("");
    setMessage("");
    try {
      await API.delete(`/employees/${id}`);
      setMessage("Employee deleted successfully");
      if (employees.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadEmployees(page);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = emp.user?.name?.toLowerCase() || "";
      const email = emp.user?.email?.toLowerCase() || "";
      const dept = emp.department?.toLowerCase() || "";
      const desig = emp.designation?.toLowerCase() || "";
      const query = search.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        dept.includes(query) ||
        desig.includes(query);

      const matchesRole = roleFilter === "all" || emp.user?.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [employees, search, roleFilter]);

  const getRoleBadge = (role) => {
    switch (role) {
      case "hr":
        return <span className="badge bg-primary text-uppercase">HR</span>;
      case "manager":
        return <span className="badge bg-warning text-uppercase">Manager</span>;
      default:
        return <span className="badge bg-info text-uppercase">Employee</span>;
    }
  };

  return (
    <>
      <Navbar />
      <main className="container-xl py-4 px-3 px-md-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="page-title mb-1">
              Workforce Management
            </h2>
            <div className="subtitle-glass">
              
            </div>
          </div>
          <button
            className={`btn ${isFormOpen ? "btn-outline-light" : "btn-primary"}`}
            onClick={() => {
              if (isFormOpen && editingId) resetForm();
              else setIsFormOpen(!isFormOpen);
            }}
          >
            {isFormOpen ? (
              <span>Close Form</span>
            ) : (
              <span>+ Add New Employee</span>
            )}
          </button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Create / Edit Form Card */}
        {isFormOpen && (
          <div className="card p-4 mb-4 glow-card-indigo">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary">
                  {editingId ? "Edit Mode" : "New Onboarding"}
                </span>
                <h5 className="mb-0 fw-bold">
                  {editingId ? `Edit ${form.name}` : "Register New Employee"}
                </h5>
              </div>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small text-muted">Full Name *</label>
                  <input
                    className="form-control"
                    name="name"
                    placeholder="e.g. Alex Morgan"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Corporate Email *</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    placeholder="alex@staffsync.io"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                  />
                </div>
                {!editingId && (
                  <div className="col-md-4">
                    <label className="form-label small text-muted">Initial Password *</label>
                    <input
                      className="form-control"
                      type="password"
                      name="password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <div className="col-md-3">
                  <label className="form-label small text-muted">System Role *</label>
                  <select
                    className="form-select"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Administrator</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small text-muted">Department *</label>
                  <input
                    className="form-control"
                    name="department"
                    placeholder="e.g. Engineering, Sales"
                    value={form.department}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small text-muted">Designation</label>
                  <input
                    className="form-control"
                    name="designation"
                    placeholder="e.g. Senior Architect"
                    value={form.designation}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small text-muted">Reporting Manager</label>
                  <select
                    className="form-select"
                    name="manager"
                    value={form.manager}
                    onChange={handleChange}
                  >
                    <option value="">No manager (Direct HR / Exec)</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Phone Number</label>
                  <input
                    className="form-control"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label small text-muted">Office / Home Address</label>
                  <input
                    className="form-control"
                    name="address"
                    placeholder="City, State, Country"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 mt-4 d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {editingId ? "Save Changes" : "Onboard Employee"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Directory Controls & Table Card */}
        <div className="card glow-card-indigo p-0 overflow-hidden mb-4">
          <div className="p-3 d-flex justify-content-between align-items-center flex-wrap gap-3 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small">Filter Role:</span>
              <div className="btn-group btn-group-sm" role="group">
                {["all", "employee", "manager", "hr"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`btn btn-sm ${
                      roleFilter === r ? "btn-primary" : "btn-outline-light"
                    } text-capitalize`}
                    onClick={() => setRoleFilter(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-input-wrapper">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search name, dept, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th className="text-end" style={{ width: "16%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const initial = emp.user?.name
                    ? emp.user.name.charAt(0).toUpperCase()
                    : "?";

                  return (
                    <tr key={emp._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle">
                            {initial}
                          </div>
                          <div>
                            <div className="fw-bold">
                              {emp.user?.name || "Unknown"}
                            </div>
                            <div className="text-muted small">
                              {emp.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{getRoleBadge(emp.user?.role)}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {emp.department || "-"}
                        </span>
                      </td>
                      <td className="text-secondary">
                        {emp.designation || <span className="text-muted">-</span>}
                      </td>
                      <td>
                        {emp.manager?.name ? (
                          <span className="badge bg-secondary">
                            {emp.manager.name}
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-light"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(emp)}
                            title="Edit Employee"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(emp._id, emp.user?.name)}
                            title="Delete Employee"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div>No employees found matching the current criteria</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 d-flex justify-content-between align-items-center flex-wrap gap-2 border-top border-secondary border-opacity-25">
            <span className="text-muted small">
              Page <strong>{page}</strong> of <strong>{pages}</strong>
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <button
                className="btn btn-outline-light btn-sm"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
