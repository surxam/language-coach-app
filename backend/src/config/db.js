const mysql = require("mysql2/promise");
require("dotenv").config();

// Pool de connexions MySQL — réutilisé partout dans l'API.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "langue_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: false,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ Connexion MySQL OK");
  } catch (err) {
    console.error("❌ Impossible de se connecter à MySQL :", err.message);
  }
}

module.exports = { pool, testConnection };
