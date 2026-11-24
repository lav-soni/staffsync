import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import HRDashboard from "./pages/dashboards/HRDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import ManageEmployees from "./pages/ManageEmployees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/hr-dashboard"
        element={<ProtectedRoute roles={["hr"]}><HRDashboard /></ProtectedRoute>}
      />
      <Route
        path="/manager-dashboard"
        element={<ProtectedRoute roles={["manager"]}><ManagerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/employee-dashboard"
        element={<ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>}
      />

      <Route
        path="/employees"
        element={<ProtectedRoute roles={["hr"]}><ManageEmployees /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>}
      />

      <Route
        path="/attendance"
        element={<ProtectedRoute><Attendance /></ProtectedRoute>}
      />

      <Route
        path="/leaves"
        element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>}
      />

    </Routes>
  );
}

