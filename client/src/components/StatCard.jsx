import { Link } from "react-router-dom";

export default function StatCard({ title, value, color = "primary", link }) {
  const card = (
    <div className={`card h-100 border-start border-4 border-${color} shadow-sm`}>
      <div className="card-body">
        <div className="text-muted small">{title}</div>
        <div className="fs-4 fw-semibold text-dark">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="col-6 col-md-4 col-lg-3">
      {link ? <Link to={link} className="text-decoration-none">{card}</Link> : card}
    </div>
  );
}