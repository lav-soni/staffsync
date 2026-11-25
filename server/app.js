require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const morgan = require("morgan");

const app = express();

const origins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : true; // allow all locally; set CLIENT_URL in production

app.use(cors({ origin: origins }));
app.use(compression()); // smaller responses
app.use(express.json());
if (process.env.NODE_ENV !== "test")
  app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev")); // request log with response times

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("StaffSync API running"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = app;