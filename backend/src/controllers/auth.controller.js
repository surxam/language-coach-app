const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { signToken } = require("../utils/jwt");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Le nom est requis." });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Adresse e-mail invalide." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet e-mail." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), hashed]
    );

    const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase().trim() };
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Erreur serveur lors de la création du compte." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "E-mail et mot de passe requis." });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    const row = rows[0];
    if (!row) {
      return res.status(401).json({ message: "E-mail ou mot de passe incorrect." });
    }

    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).json({ message: "E-mail ou mot de passe incorrect." });
    }

    const user = { id: row.id, name: row.name, email: row.email };
    const token = signToken(user);

    return res.json({ token, user });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
}

// GET /api/auth/me  (protégé)
async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { signup, login, me };
