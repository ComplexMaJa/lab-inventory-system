import express from "express";
import path from "path";
import cors from "cors";
import mysql from "mysql2/promise";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// ── Database connection ──────────────────────────────────────
// Edit these values to match your phpMyAdmin / XAMPP setup
const pool = mysql.createPool({
  host:     "localhost",
  user:     "root",
  password: "",               // ← put your MySQL password here if needed
  database: "db_lab_komputer",
  port:     3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json());

// ── Auto-create tables if they don't exist ──────────────────
async function initDb() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pengguna (
        id_user      INT AUTO_INCREMENT PRIMARY KEY,
        username     VARCHAR(50)  NOT NULL UNIQUE,
        password     VARCHAR(100) NOT NULL,
        nama_lengkap VARCHAR(100) NOT NULL,
        role         ENUM('admin','petugas') DEFAULT 'petugas'
      )
    `);
    // Seed default admin if table is empty
    await pool.execute(`
      INSERT IGNORE INTO pengguna (username, password, nama_lengkap, role)
      VALUES ('admin', 'admin123', 'Administrator', 'admin')
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventaris (
        id_barang   INT AUTO_INCREMENT PRIMARY KEY,
        nama_barang VARCHAR(100) NOT NULL,
        kode_aset   VARCHAR(50)  UNIQUE,
        kondisi     ENUM('Baik','Rusak','Perbaikan') DEFAULT 'Baik',
        stok        INT DEFAULT 0,
        tgl_update  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✔  Tables ready.");
  } catch (error) {
    console.error("✘  DB init failed:", (error as any).message);
  }
}

// ── API Routes ───────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.execute(
      "SELECT id_user, username, nama_lengkap, role FROM pengguna WHERE username=? AND password=?",
      [username, password]
    );
    const users = rows as any[];
    if (users.length === 0) {
      return res.status(401).json({ error: "Username atau password salah" });
    }
    res.json({ message: "Login berhasil", user: users[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inventaris", async (req, res) => {
  try {
    const { nama_barang, kode_aset, kondisi, stok } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO inventaris (nama_barang, kode_aset, kondisi, stok) VALUES (?, ?, ?, ?)",
      [nama_barang, kode_aset, kondisi || "Baik", stok || 0]
    );
    res.json({ message: "Success", id: (result as any).insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Read all
app.get("/api/inventaris", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM inventaris ORDER BY tgl_update DESC"
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update
app.put("/api/inventaris/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, kode_aset, kondisi, stok } = req.body;
    await pool.execute(
      "UPDATE inventaris SET nama_barang=?, kode_aset=?, kondisi=?, stok=? WHERE id_barang=?",
      [nama_barang, kode_aset, kondisi, stok, id]
    );
    res.json({ message: "Updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
app.delete("/api/inventaris/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM inventaris WHERE id_barang=?", [id]);
    res.json({ message: "Deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stats for dashboard
app.get("/api/stats", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*)                                    AS total,
        COUNT(CASE WHEN kondisi='Baik'      THEN 1 END) AS baik,
        COUNT(CASE WHEN kondisi='Rusak'     THEN 1 END) AS rusak,
        COUNT(CASE WHEN kondisi='Perbaikan' THEN 1 END) AS perbaikan
      FROM inventaris
    `);
    res.json((rows as any)[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ── Start ────────────────────────────────────────────────────
async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀  Server → http://localhost:${PORT}\n`);
  });
}

startServer().catch(console.error);
