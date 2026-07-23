/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Fonds sombres ──────────────────────────────────
        dark: {
          DEFAULT: "#0F0F1A",   // fond principal très sombre
          card:    "#1A1A2E",   // cartes et surfaces
          border:  "#2A2A45",   // bordures subtiles
          muted:   "#252540",   // éléments secondaires
        },
        // ── Primaire indigo/violet ─────────────────────────
        brand: {
          DEFAULT: "#6366F1",
          dark:    "#4F46E5",
          light:   "#818CF8",
          glow:    "rgba(99,102,241,0.3)",
        },
        // ── Accents ───────────────────────────────────────
        record: {
          DEFAULT: "#EF4444",   // bouton micro rouge
          dark:    "#DC2626",
          glow:    "rgba(239,68,68,0.4)",
        },
        success: {
          DEFAULT: "#22C55E",   // vert succès
          dark:    "#16A34A",
          light:   "#DCFCE7",
        },
        score: {
          high:   "#22C55E",    // score ≥ 8
          mid:    "#F59E0B",    // score 5-8
          low:    "#EF4444",    // score < 5
        },
        // ── Textes ────────────────────────────────────────
        text: {
          primary:   "#F1F5F9",
          secondary: "#94A3B8",
          muted:     "#64748B",
        },
      },
    },
  },
  plugins: [],
};
