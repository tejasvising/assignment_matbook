const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "data.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open DB:", err);
    process.exit(1);
  }
});

const init = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
  });
};

module.exports = { db, init };
