import { Link } from "react-router-dom";

export default function LatestAnnouncements({ items }) {
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between">
        <strong>Latest Announcements</strong>
        <Link to="/announcements">View all</Link>
      </div>
      <ul className="list-group list-group-flush">
        {items.map((a) => (
          <li key={a._id} className="list-group-item">
            <div className="fw-semibold">{a.title}</div>
            <small className="text-muted">
              {a.postedBy?.name} | {new Date(a.createdAt).toLocaleDateString()}
            </small>
          </li>
        ))}
        {items.length === 0 && <li className="list-group-item text-muted">No announcements yet</li>}
      </ul>
    </div>
  );
}