const { getAIReply } = require("./services/ai.service");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { testConnection } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const conversationRoutes = require("./routes/conversation.routes");

const app = express();

app.use(cors());
app.use(express.json());

// ─── Health & Debug ─────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/test-groq", async (req, res) => {
  const r = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
  });

  const body = await r.text();

  res.status(r.status).send(body);
});

// /api/debug — indique quelles clés sont configurées (valeurs masquées).
// Accessible sans auth pour faciliter le diagnostic.
app.get("/api/debug", (_req, res) => {
  const nodeVersion = process.version;
  const [major] = nodeVersion.replace("v", "").split(".").map(Number);

  res.json({
    nodeVersion,
    fetchAvailable: typeof fetch !== "undefined",
    node18Plus: major >= 18,
    groqKeySet: !!process.env.GROQ_API_KEY,
    openaiKeySet: !!process.env.OPENAI_API_KEY,
    dbHost: process.env.DB_HOST || "127.0.0.1",
    dbName: process.env.DB_NAME || "langue_app",
  });
});

// ─── Routes applicatives ────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: "Route inconnue." }));

// Erreur générique
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Erreur serveur." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`\n🚀  API démarrée sur http://localhost:${PORT}`);
  console.log(`🔑  ANTHROPIC_API_KEY : ${process.env.GROQ_API_KEY ? "✅ configurée" : "❌ MANQUANTE — ajoutez-la dans .env"}`);
  console.log(`🔑  OPENAI_API_KEY    : ${process.env.OPENAI_API_KEY    ? "✅ configurée" : "⚠️  absente (transcription mock)"}`);
  await testConnection();
  console.log();
});
