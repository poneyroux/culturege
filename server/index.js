/* server/index.js
   – API Express (médiathèque + “catch-all” React en prod)
   – Compatible développement (Vite 5173) et production (build React)
------------------------------------------------------------------ */
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

/* ---------- constantes ---------- */
const PORT = process.env.PORT || 5001; // API
const FRONT_PATH = path.join(process.cwd(), "dist"); // build Vite
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

/* ---------- préparation ---------- */
await fs.mkdir(IMAGES_DIR, { recursive: true });

/* ---------- app ---------- */
const app = express();
app.use(cors());
app.use(morgan("dev")); // logs HTTP

/* ---------- fichiers statiques ---------- */
app.use("/images", express.static(IMAGES_DIR));

/* ---------- stockage via multer ---------- */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, IMAGES_DIR),

  // → garde le nom d’origine
  filename: async (_, file, cb) => {
    // si un fichier du même nom existe, on le remplace
    // (supprime cette ligne si tu préfères bloquer le doublon)
    try {
      await fs.unlink(path.join(IMAGES_DIR, file.originalname));
    } catch {}
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/* ---------- routes API médiathèque ---------- */
app.get("/api/media", async (_, res) => {
  const files = await fs.readdir(IMAGES_DIR);
  const list = await Promise.all(
    files
      .filter((f) => /\.(png|jpe?g|gif|webp|svg)$/i.test(f))
      .map(async (f) => {
        const stats = await fs.stat(path.join(IMAGES_DIR, f));
        return {
          name: f,
          url: `/images/${f}`,
          size: stats.size,
          created_at: stats.birthtime,
        };
      })
  );
  res.json(list);
});

app.post("/api/media/upload", upload.array("images"), (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ error: "Aucun fichier" });
  res.json({ success: true, files: req.files.map((f) => f.filename) });
});
app.delete("/api/media/:file", async (req, res) => {
  try {
    await fs.unlink(path.join(IMAGES_DIR, req.params.file));
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: "Introuvable" });
  }
});

/* ---------- production : servir le front ---------- */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(FRONT_PATH)); // assets React
  app.get("*", (_, res) => res.sendFile(path.join(FRONT_PATH, "index.html")));
}

/* ---------- démarrage ---------- */
app.listen(PORT, () => {
  console.log(`API prête → http://localhost:${PORT}`);
});
