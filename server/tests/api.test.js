require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

const TEST_URI = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/staffsync_test";
const api = request(app);

const auth = (t) => ({ Authorization: `Bearer ${t}` });
const login = async (email, password = "123456") =>
  (await api.post("/api/auth/login").send({ email, password })).body.token;
const future = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
};

let hr, manager, emp, managerId, leaveId;

beforeAll(async () => {
  if (!/test/i.test(TEST_URI)) throw new Error("Test database name must contain 'test'");
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropDatabase();
  await User.create({ name: "HR", email: "hr@t.com", password: "123456", role: "hr" });
  hr = await login("hr@t.com");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Authentication", () => {
  test("wrong password is rejected", async () => {
    const res = await api.post("/api/auth/login").send({ email: "hr@t.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("correct login returns token and role", async () => {
    const res = await api.post("/api/auth/login").send({ email: "hr@t.com", password: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe("hr");
  });

  test("protected route without token returns 401", async () => {
    expect((await api.get("/api/employees")).status).toBe(401);
  });

  test("register without token returns 401", async () => {
    const res = await api.post("/api/auth/register").send({ name: "X", email: "x@t.com", password: "123456" });
    expect(res.status).toBe(401);
  });
});

describe("Employee management", () => {
  test("HR creates a manager", async () => {
    const res = await api.post("/api/employees").set(auth(hr)).send({
      name: "Manager", email: "mgr@t.com", password: "123456", role: "manager", department: "Engineering",
    });
    expect(res.status).toBe(201);
    managerId = res.body.user._id;
    manager = await login("mgr@t.com");
  });

  test("HR creates an employee under that manager", async () => {
    const res = await api.post("/api/employees").set(auth(hr)).send({
      name: "Emp", email: "emp@t.com", password: "123456", role: "employee",
      department: "Engineering", manager: managerId,
    });
    expect(res.status).toBe(201);
    emp = await login("emp@t.com");
  });

  test("duplicate email is rejected", async () => {
    const res = await api.post("/api/employees").set(auth(hr)).send({
      name: "Emp2", email: "emp@t.com", password: "123456", department: "Engineering",
    });
    expect(res.status).toBe(400);
  });

  test("missing department is rejected", async () => {
    const res = await api.post("/api/employees").set(auth(hr)).send({
      name: "Emp3", email: "emp3@t.com", password: "123456",
    });
    expect(res.status).toBe(400);
  });

  test("employee cannot list employees (403)", async () => {
    expect((await api.get("/api/employees").set(auth(emp))).status).toBe(403);
  });

  test("employee cannot register users (403)", async () => {
    const res = await api.post("/api/auth/register").set(auth(emp)).send({
      name: "Y", email: "y@t.com", password: "123456",
    });
    expect(res.status).toBe(403);
  });

  test("HR lists 2 employees", async () => {
    const res = await api.get("/api/employees").set(auth(hr));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  test("employee reads own profile", async () => {
    const res = await api.get("/api/employees/me").set(auth(emp));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("emp@t.com");
  });
});

describe("Attendance management", () => {
  test("check in works once per day", async () => {
    expect((await api.post("/api/attendance/check-in").set(auth(emp))).status).toBe(201);
    expect((await api.post("/api/attendance/check-in").set(auth(emp))).status).toBe(400);
  });

  test("check out works once per day", async () => {
    expect((await api.post("/api/attendance/check-out").set(auth(emp))).status).toBe(200);
    expect((await api.post("/api/attendance/check-out").set(auth(emp))).status).toBe(400);
  });

  test("manager sees own team's attendance", async () => {
    const res = await api.get("/api/attendance/team").set(auth(manager));
    expect(res.status).toBe(200);
    expect(res.body.team).toHaveLength(1);
    expect(res.body.team[0].record).not.toBeNull();
  });

  test("HR monthly report counts 1 day present", async () => {
    const res = await api.get("/api/attendance/report").set(auth(hr));
    expect(res.status).toBe(200);
    expect(res.body.data.find((r) => r.email === "emp@t.com").daysPresent).toBe(1);
  });

  test("employee cannot open HR report (403)", async () => {
    expect((await api.get("/api/attendance/report").set(auth(emp))).status).toBe(403);
  });
});

describe("Leave management", () => {
  const body = { leaveType: "casual", startDate: future(3), endDate: future(5), reason: "Family event" };

  test("employee applies for leave", async () => {
    const res = await api.post("/api/leaves").set(auth(emp)).send(body);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
    leaveId = res.body._id;
  });

  test("overlapping dates are rejected", async () => {
    const res = await api.post("/api/leaves").set(auth(emp)).send({ ...body, startDate: future(4), endDate: future(6) });
    expect(res.status).toBe(400);
  });

  test("past start date is rejected", async () => {
    const res = await api.post("/api/leaves").set(auth(emp)).send({ ...body, startDate: "2020-01-01", endDate: "2020-01-02" });
    expect(res.status).toBe(400);
  });

  test("employee cannot approve leave (403)", async () => {
    const res = await api.put(`/api/leaves/${leaveId}/status`).set(auth(emp)).send({ status: "approved" });
    expect(res.status).toBe(403);
  });

  test("manager approves team member's leave", async () => {
    const res = await api.put(`/api/leaves/${leaveId}/status`).set(auth(manager)).send({ status: "approved", comment: "Enjoy" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  test("already reviewed request cannot be reviewed again", async () => {
    const res = await api.put(`/api/leaves/${leaveId}/status`).set(auth(manager)).send({ status: "rejected" });
    expect(res.status).toBe(400);
  });

  test("employee receives a notification", async () => {
    const res = await api.get("/api/notifications").set(auth(emp));
    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  test("manager cannot approve own leave", async () => {
    const mine = await api.post("/api/leaves").set(auth(manager)).send({ ...body, startDate: future(10), endDate: future(11) });
    expect(mine.status).toBe(201);
    const res = await api.put(`/api/leaves/${mine.body._id}/status`).set(auth(manager)).send({ status: "approved" });
    expect(res.status).toBe(403);
  });
});

describe("Dashboards", () => {
  test("employee dashboard", async () => {
    const res = await api.get("/api/dashboard").set(auth(emp));
    expect(res.status).toBe(200);
    expect(res.body.leaves.approved).toBe(1);
    expect(res.body.daysPresent).toBe(1);
  });

  test("manager dashboard", async () => {
    const res = await api.get("/api/dashboard").set(auth(manager));
    expect(res.status).toBe(200);
    expect(res.body.teamSize).toBe(1);
    expect(res.body.presentToday).toBe(1);
  });

  test("HR dashboard", async () => {
    const res = await api.get("/api/dashboard").set(auth(hr));
    expect(res.status).toBe(200);
    expect(res.body.totalEmployees).toBe(2);
  });

  test("dashboard needs a token", async () => {
    expect((await api.get("/api/dashboard")).status).toBe(401);
  });
});