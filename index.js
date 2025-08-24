// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Warning: SUPABASE_URL or SUPABASE_KEY missing — set env vars before running.");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "");

function log(req, status, extra = {}) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      path: req.path,
      method: req.method,
      status,
      ...extra,
    })
  );
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
  log(req, 200);
});

// dbtest: query employee table
app.get("/dbtest", async (req, res) => {
  try {
    const { data, error } = await supabase.from("employee").select("employee_id");
    if (error) {
      log(req, 500, { error: error.message });
      return res.status(500).json({ error: error.message });
    }
    log(req, 200, { rowCount: data?.length ?? 0 });
    res.json({ success: true, data });
  } catch (err) {
    log(req, 500, { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// create a task
app.post("/tasks", async (req, res) => {
  const { title, employee_id } = req.body || {};
  if (!title || !employee_id) {
    log(req, 400);
    return res.status(400).json({ error: "title and employee_id required" });
  }
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, employee_id, status: "Pending" }])
      .select();
    if (error) {
      log(req, 500, { error: error.message });
      return res.status(500).json({ error: error.message });
    }
    log(req, 201, { inserted: data?.length ?? 0 });
    res.json({ success: true, task: data?.[0] ?? null });
  } catch (err) {
    log(req, 500, { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// list tasks
app.get("/tasks", async (req, res) => {
  try {
    const employee_id = req.query.employee_id;
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (employee_id) query = query.eq("employee_id", employee_id);
    const { data, error } = await query;
    if (error) {
      log(req, 500, { error: error.message });
      return res.status(500).json({ error: error.message });
    }
    log(req, 200, { rowCount: data?.length ?? 0 });
    res.json({ success: true, tasks: data });
  } catch (err) {
    log(req, 500, { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// activity - Manager only via header 'x-role: Manager'
app.get("/activity", async (req, res) => {
  const role = req.header("x-role");
  if (role !== "Manager") {
    log(req, 403, { role });
    return res.status(403).json({ error: "Forbidden. Manager role required." });
  }
  try {
    const { data, error } = await supabase.from("activity").select("*").order("created_at", { ascending: false });
    if (error) {
      log(req, 500, { error: error.message });
      return res.status(500).json({ error: error.message });
    }
    log(req, 200, { rowCount: data?.length ?? 0 });
    res.json({ success: true, activities: data });
  } catch (err) {
    log(req, 500, { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// diagnostics
app.get("/diagnostics", (req, res) => {
  const info = {
    status: "ok",
    supabaseUrl: SUPABASE_URL ? "present" : "missing",
    now: new Date().toISOString(),
    nodeVersion: process.version,
  };
  log(req, 200, info);
  res.json(info);
});

app.listen(PORT, () => {
  console.log(`WorksSyncPlus container listening on ${PORT}`);
});
