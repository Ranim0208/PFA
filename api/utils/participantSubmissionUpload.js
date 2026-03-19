// middlewares/fileUploadMiddleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createUploadMiddleware = (options = {}) => {
  const config = {
    fieldName: "attachments",
    maxCount: 5,
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "application/zip",
    ],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    subfolder: "participant-submissions",
    ...options,
  };

  // Ensure upload directory exists - FIXED for deployment
  const ensureUploadsDirExists = (dirPath) => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created upload directory: ${dirPath}`);
      }
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        // FIXED: Use process.cwd() for deployment compatibility
        const uploadDir = path.join(process.cwd(), "uploads", config.subfolder);
        ensureUploadsDirExists(uploadDir);
        cb(null, uploadDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      // FIXED: Better filename sanitization
      const baseName = path.basename(file.originalname, ext);
      const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_.]/g, "_");
      const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (config.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type "${
            file.mimetype
          }". Only ${config.allowedTypes.join(", ")} are allowed`
        ),
        false
      );
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.fileSizeLimit,
      files: config.maxCount,
    },
  });

  return (req, res, next) => {
    upload.array(config.fieldName, config.maxCount)(req, res, (err) => {
      if (err) {
        let status = 500;
        let message = "File upload failed";

        if (err instanceof multer.MulterError) {
          status = 400;
          if (err.code === "LIMIT_FILE_SIZE") {
            message = `File too large. Maximum size is ${
              config.fileSizeLimit / 1024 / 1024
            }MB`;
          } else if (err.code === "LIMIT_FILE_COUNT") {
            message = `Too many files. Maximum ${config.maxCount} allowed`;
          } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = `Unexpected field name. Use "${config.fieldName}" for file uploads`;
          } else {
            message = `Upload error: ${err.message}`;
          }
        } else {
          message = err.message;
        }

        return res.status(status).json({
          success: false,
          message,
          error: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
      }

      // Attach file info to request for easier access in controller
      if (req.files && req.files.length > 0) {
        req.uploadedFiles = req.files.map((file) => ({
          originalName: file.originalname,
          fileName: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          // FIXED: Generate correct URL for deployment
          url: `/api/uploads/${config.subfolder}/${file.filename}`,
        }));

        console.log(
          `Uploaded ${req.files.length} file(s) to ${config.subfolder}:`,
          req.files.map((f) => f.filename)
        );
      }

      next();
    });
  };
};

// Export specific middleware instances
export const participantSubmissionUpload = createUploadMiddleware();

export const trainingOutputsUpload = createUploadMiddleware({
  subfolder: "training-outputs",
});

export const bootcampUpload = createUploadMiddleware({
  fieldName: "programFile",
  maxCount: 1,
  allowedTypes: ["application/pdf"],
  subfolder: "participant-submissions",
});

// Export the creator function for custom use
export default createUploadMiddleware;
