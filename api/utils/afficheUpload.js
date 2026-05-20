import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier cible: uploads/affiches
const uploadDir = path.join(__dirname, "../uploads/affiches");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

// Filtre types
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Type invalide. Seules les images JPG, PNG, WEBP, GIF."), false);
};

// Multer instance (5 Mo pour une affiche)
export const uploadAffiche = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Helpers
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Error deleting file:", e);
  }
};

export const getAfficheUrl = (filename) => `/uploads/affiches/${filename}`;
export const getAffichePath = (filename) => path.join(uploadDir, filename);
