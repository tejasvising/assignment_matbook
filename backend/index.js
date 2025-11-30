const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

const { db, init } = require("./db");
const { formSchema } = require("./schema");
const { validateSubmission } = require("./validation");

init();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// GET form schema
app.get("/api/form-schema", (req, res) => {
  res.json(formSchema);
});

// POST submission
app.post("/api/submissions", (req, res) => {
  const payload = req.body || {};

  const { valid, errors } = validateSubmission(payload);
  if (!valid) {
    return res.status(400).json({ success: false, errors });
  }

  const id = uuidv4();
  const createdAt = dayjs().toISOString();

  const stmt = db.prepare("INSERT INTO submissions (id, payload, createdAt) VALUES (?, ?, ?)");
  stmt.run(id, JSON.stringify(payload), createdAt, function (err) {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ success: false, message: "Failed to store submission" });
    }

    res.status(201).json({ success: true, id, createdAt });
  });
});

// GET submissions with pagination & sorting
// Query params: page (1-based), limit, sortBy, sortOrder
app.get("/api/submissions", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "ASC" : "DESC";

  const offset = (page - 1) * limit;

  // Only allow sorting on createdAt to meet assignment
  const allowedSortBy = ["createdAt"];
  const orderColumn = allowedSortBy.includes(sortBy) ? sortBy : "createdAt";

  db.get("SELECT COUNT(*) as cnt FROM submissions", [], (err, row) => {
    if (err) {
      console.error("DB count error:", err);
      return res.status(500).json({ message: "Failed to fetch submissions count" });
    }
    const total = row.cnt;
    const totalPages = Math.ceil(total / limit);

    db.all(
      `SELECT id, payload, createdAt FROM submissions ORDER BY ${orderColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      [limit, offset],
      (err2, rows) => {
        if (err2) {
          console.error("DB fetch error:", err2);
          return res.status(500).json({ message: "Failed to fetch submissions" });
        }

        // Parse payload JSON
        const items = rows.map((r) => ({
          id: r.id,
          createdAt: r.createdAt,
          payload: JSON.parse(r.payload)
        }));

        res.json({
          success: true,
          page,
          limit,
          total,
          totalPages,
          items
        });
      }
    );
  });
});

// GET single submission
app.get("/api/submissions/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT id, payload, createdAt FROM submissions WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "DB error" });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({
      success: true,
      id: row.id,
      createdAt: row.createdAt,
      payload: JSON.parse(row.payload)
    });
  });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
