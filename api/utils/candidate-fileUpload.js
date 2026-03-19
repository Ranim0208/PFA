import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/candidat-docs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX are allowed."
      ),
      false
    );
  }
};

// Configure multer
export const uploadCandidatureFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware to handle multiple file fields dynamically
export const uploadDynamicFields = (req, res, next) => {
  // Get form fields to determine which are file fields
  const fileFields = [];

  // Parse the fields from request if available
  if (req.body.fileFields) {
    try {
      const fields = JSON.parse(req.body.fileFields);
      fields.forEach((fieldId) => {
        fileFields.push({ name: fieldId, maxCount: 1 });
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid file fields configuration",
      });
    }
  }

  // If no file fields, continue
  if (fileFields.length === 0) {
    return next();
  }

  // Use multer with dynamic fields
  const upload = uploadCandidatureFiles.fields(fileFields);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 10MB limit",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// Helper function to delete uploaded file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

// Helper function to get file URL
// Helper function to get file URL
export const getFileUrl = (filename, req = null) => {
  const baseUrl = req
    ? `${req.protocol}://${req.get("host")}`
    : "https://incubation.tacir.tn";
  return `${baseUrl}/uploads/candidat-docs/${filename}`;
};
