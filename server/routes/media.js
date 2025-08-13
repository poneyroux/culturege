import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

/* -------- multer -------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${ts}-${base}${ext}`);
  },
});
const upload = multer({ storage });

/* -------- GET /api/media -------- */
router.get("/", async (_, res) => {
  const files = await fs.readdir(IMAGES_DIR);
  const images = await Promise.all(
    files
      .filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f))
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
  res.json(images);
});

/* -------- POST /api/media/upload -------- */
router.post("/upload", upload.array("images"), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "Aucun fichier" });
  res.json({ success: true, files: req.files.map((f) => f.filename) });
});

/* -------- DELETE /api/media/:file -------- */
router.delete("/:file", async (req, res) => {
  try {
    await fs.unlink(path.join(IMAGES_DIR, req.params.file));
    res.json({ success: true });
  } catch (e) {
    res.status(404).json({ error: "Introuvable" });
  }
});

export default router;
