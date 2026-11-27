import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const HRDashboard = lazy(() => import("./pages/dashboards/HRDashboard"));
const ManagerDashboard = lazy(() => import("./pages/dashboards/ManagerDashboard"));
const EmployeeDashboard = lazy(() => import("./pages/dashboards/EmployeeDashboard"));
const ManageEmployees = lazy(() => import("./pages/ManageEmployees"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const Attendance = lazy(() => import("./pages/Attendance"));
const LeaveManagement = lazy(() => import("./pages/LeaveManagement"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Trainings = lazy(() => import("./pages/Trainings"));

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
    <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const guard = (el, roles) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <div className="liquid-app-wrapper">
      {/* Dynamic ambient liquid glow orbs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />
      <div className="ambient-blob blob-4" />

      {/* Main app content layer */}
      <div className="app-content-layer">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/hr-dashboard" element={guard(<HRDashboard />, ["hr"])} />
            <Route path="/manager-dashboard" element={guard(<ManagerDashboard />, ["manager"])} />
            <Route path="/employee-dashboard" element={guard(<EmployeeDashboard />, ["employee"])} />
            <Route path="/employees" element={guard(<ManageEmployees />, ["hr"])} />
            <Route path="/profile" element={guard(<EmployeeProfile />)} />
            <Route path="/attendance" element={guard(<Attendance />)} />
            <Route path="/leaves" element={guard(<LeaveManagement />)} />
            <Route path="/announcements" element={guard(<Announcements />)} />
            <Route path="/trainings" element={guard(<Trainings />)} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
