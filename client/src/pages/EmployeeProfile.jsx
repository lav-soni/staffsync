import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const FILE_BASE =
  (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(
    "/api",
    "",
  ) + "/uploads/";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", address: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    API.get("/employees/me")
      .then(({ data }) => {
        if (!isMounted) return;

        setProfile(data);
        setForm({
          phone: data.phone || "",
          address: data.address || "",
        });
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Could not load your profile.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const { data } = await API.put("/employees/me", form);
      setProfile(data);
      setMessage("Contact details updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (event) => {
    const chosenFile = event.target.files?.[0] || null;
    setFile(chosenFile);
    setPreview(chosenFile ? URL.createObjectURL(chosenFile) : "");
  };

  const handleUpload = async () => {
    if (!file) return;

    setMessage("");
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const { data } = await API.put("/employees/me/photo", formData);
      setProfile(data);
      setFile(null);
      setPreview("");
      setMessage("Profile photo updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload your photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const photoSrc =
    preview ||
    (profile?.photo
      ? profile.photo.startsWith("http")
        ? profile.photo
        : FILE_BASE + profile.photo
      : "");

  const employeeName = profile?.user?.name || "Employee";
  const initial = employeeName.charAt(0).toUpperCase();

  const formatDate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not provided";

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case "hr":
        return <span className="badge bg-primary">Human Resources</span>;
      case "manager":
        return <span className="badge bg-warning text-dark">Manager</span>;
      case "employee":
        return <span className="badge bg-info text-dark">Employee</span>;
      default:
        return (
          <span className="badge bg-secondary">
            {role || "Team Member"}
          </span>
        );
    }
  };

  const overviewItems = [
    {
      label: "Full name",
      value: employeeName,
    },
    {
      label: "Corporate email",
      value: profile?.user?.email || "Not provided",
      breakable: true,
    },
    {
      label: "Department",
      value: profile?.department || "Not assigned",
    },
    {
      label: "Designation",
      value: profile?.designation || "Not assigned",
    },
    {
      label: "Reporting manager",
      value: profile?.manager?.name || "Direct reporting",
    },
    {
      label: "Date joined",
      value: formatDate(profile?.joiningDate),
    },
  ];

  return (
    <>
      <Navbar />

      <main className="container-xl px-3 px-md-4 py-4" style={{ maxWidth: 1100 }}>
        <header className="mb-4">
          <p className="text-primary small fw-semibold text-uppercase mb-1">
            
          </p>
          <h1 className="h2 fw-bold mb-1">My Profile</h1>
          <p className="text-muted mb-0">
            
          </p>
        </header>

        {message && (
          <div className="alert alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {profile && (
          <>
            <section
              className="card border-0 shadow-sm mb-4"
              aria-labelledby="profile-heading"
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center flex-wrap gap-4">
                  <div className="position-relative">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={`${employeeName}'s profile`}
                        className="rounded-circle border"
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 96, height: 96, fontSize: "2rem" }}
                        aria-label={`Profile initials: ${initial}`}
                      >
                        {initial}
                      </div>
                    )}

                    <span
                      className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle"
                      style={{ width: 18, height: 18 }}
                      title="Active account"
                    />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      {getRoleBadge(profile.role)}
                      <span className="badge bg-light text-dark border">
                        {profile.department || "Department not assigned"}
                      </span>
                    </div>

                    <h2 id="profile-heading" className="h4 fw-bold mb-1">
                      {employeeName}
                    </h2>
                    <p className="text-muted mb-3">
                      {profile.user?.email || "Email not provided"}
                    </p>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <label
                        htmlFor="avatar-upload"
                        className="btn btn-sm btn-outline-secondary mb-0"
                        style={{ cursor: "pointer" }}
                      >
                        {file ? "Choose a different photo" : "Change photo"}
                      </label>

                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="visually-hidden"
                        onChange={handleFileChange}
                      />

                      {file && (
                        <>
                          <span className="small text-muted">{file.name}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={isUploading}
                            onClick={handleUpload}
                          >
                            {isUploading ? "Uploading…" : "Save photo"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="row g-4">
              <section className="col-lg-7" aria-labelledby="employment-heading">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="mb-4">
                      <p className="text-primary small fw-semibold text-uppercase mb-1">
                        
                      </p>
                      <h2 id="employment-heading" className="h5 fw-bold mb-1">
                        Employment Overview
                      </h2>
                      <p className="text-muted small mb-0">
                        
                      </p>
                    </div>

                    <div className="row row-cols-1 row-cols-sm-2 g-3">
                      {overviewItems.map((item) => (
                        <div className="col" key={item.label}>
                          <div className="h-100 rounded border bg-light-subtle p-3">
                            <div className="small text-muted mb-1">
                              {item.label}
                            </div>
                            <div
                              className={`fw-semibold ${
                                item.breakable ? "text-break" : ""
                              }`}
                            >
                              {item.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="col-lg-5" aria-labelledby="contact-heading">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="mb-4">
                      <p className="text-primary small fw-semibold text-uppercase mb-1">
                        
                      </p>
                      <h2 id="contact-heading" className="h5 fw-bold mb-1">
                        Contact Details
                      </h2>
                      <p className="text-muted small mb-0">
                        
                        
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          className="form-control"
                          placeholder="+1 (555) 234-5678"
                          value={form.phone}
                          onChange={(event) =>
                            setForm({ ...form, phone: event.target.value })
                          }
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="address" className="form-label">
                          Residential address
                        </label>
                        <textarea
                          id="address"
                          className="form-control"
                          rows={4}
                          placeholder="Street, city, postal code"
                          value={form.address}
                          onChange={(event) =>
                            setForm({ ...form, address: event.target.value })
                          }
                        />
                      </div>

                      <button
                        className="btn btn-primary w-100"
                        type="submit"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving…" : "Update contact details"}
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}

