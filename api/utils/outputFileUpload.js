// middlewares/fileUploadMiddleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const ensureUploadsDir = (subfolder) => {
  const uploadsDir = path.join(process.cwd(), "uploads", subfolder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const createUploadMiddleware = (options = {}) => {
  const {
    fieldName = "attachments",
    maxCount = 5,
    allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ],
    fileSizeLimit = 10 * 1024 * 1024, // 10MB
    subfolder = "training-outputs",
  } = options;

  // Configure storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = ensureUploadsDir(subfolder);
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  });

  // File filter
  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only ${allowedTypes.join(", ")} are allowed`
        ),
        false
      );
    }
  };

  // Create multer instance
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: fileSizeLimit,
    },
  });

  // Return the middleware function
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Specific middleware for training outputs
export const trainingOutputsUpload = createUploadMiddleware();

// You can create other specific upload middlewares as needed
export const bootcampUpload = createUploadMiddleware({
  fieldName: "programFile",
  maxCount: 1,
  allowedTypes: ["application/pdf"],
  subfolder: "bootcamp-programs",
});
