import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL Collection - Lazy Initialization
let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth Login Endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const db = getPool();
      const [rows]: any = await db.execute(
        "SELECT * FROM `users` WHERE `username` = ? AND `password` = ?",
        [username, password]
      );

      if (rows.length > 0) {
        const user = rows[0];
        res.json({
          userId: user.userId,
          username: user.username,
          fullname: user.fullname,
          role: user.role,
          createdAt: user.createdAt || new Date().toISOString()
        });
      } else {
        res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generic MySQL DB Proxy endpoints
  app.post("/api/db/:table/list", async (req, res) => {
    try {
      const { table } = req.params;
      const { where } = req.body || {}; // e.g., { where: { observerId: '...' } }
      const db = getPool();
      
      let query = `SELECT * FROM \`${table}\``;
      const values: any[] = [];
      
      if (where && Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map(key => {
          values.push(where[key]);
          return `\`${key}\` = ?`;
        });
        query += ` WHERE ${conditions.join(" AND ")}`;
      }
      
      const [rows] = await db.execute(query, values);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/db/:table/create", async (req, res) => {
    try {
      const { table } = req.params;
      const data = req.body;
      const db = getPool();
      
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(",");
      const query = `INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(",")}) VALUES (${placeholders})`;
      
      const [result]: any = await db.execute(query, values as any);
      res.json({ id: result.insertId || data.id || data.userId || data.teacherId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite integration
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

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
