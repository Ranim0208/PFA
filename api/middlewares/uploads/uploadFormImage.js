import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure affiches directory exists
const affichesDir = path.join(process.cwd(), "uploads", "affiches");
if (!fs.existsSync(affichesDir)) {
  fs.mkdirSync(affichesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/affiches/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "form-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Type de fichier invalide. Seules les images sont autorisées."),
      false
    );
  }
};

export const uploadFormImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
