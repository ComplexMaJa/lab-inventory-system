import express from "express";
import path from "path";
import cors from "cors";
import mysql from "mysql2/promise";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_lab_komputer",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Database initialization
async function initDb() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventaris (
        id_barang INT AUTO_INCREMENT PRIMARY KEY,
        nama_barang VARCHAR(100) NOT NULL,
        kode_aset VARCHAR(50) UNIQUE,
        kondisi ENUM('Baik', 'Rusak', 'Perbaikan') DEFAULT 'Baik',
        stok INT,
        tgl_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Database table 'inventaris' ensured.");
  } catch (error) {
    console.error("Database initialization failed. Please ensure MySQL is running and the database exists.", (error as any).message);
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Create
app.post("/api/inventaris", async (req, res) => {
  try {
    const { nama_barang, kode_aset, kondisi, stok } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO inventaris (nama_barang, kode_aset, kondisi, stok) VALUES (?, ?, ?, ?)",
      [nama_barang, kode_aset, kondisi || 'Baik', stok || 0]
    );
    res.json({ message: "Success", id: (result as any).insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Read
app.get("/api/inventaris", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM inventaris ORDER BY tgl_update DESC");
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
      "UPDATE inventaris SET nama_barang = ?, kode_aset = ?, kondisi = ?, stok = ? WHERE id_barang = ?",
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
    await pool.execute("DELETE FROM inventaris WHERE id_barang = ?", [id]);
    res.json({ message: "Deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Statistics
app.get("/api/stats", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN kondisi = 'Baik' THEN 1 END) as baik,
        COUNT(CASE WHEN kondisi = 'Rusak' THEN 1 END) as rusak,
        COUNT(CASE WHEN kondisi = 'Perbaikan' THEN 1 END) as perbaikan
      FROM inventaris
    `);
    res.json((rows as any)[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
