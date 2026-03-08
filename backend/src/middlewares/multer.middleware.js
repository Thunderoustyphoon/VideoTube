import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Use a unique filename to avoid collisions
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPEG, PNG, or WebP images are allowed"), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  const isVideo = allowedTypes.includes(file.mimetype);
  const isImage = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype);

  if (isVideo || isImage) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only MP4, WebM, or OGG video files are allowed"), false);
  }
};

// For avatar and cover image uploads
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for images
  },
});

// For video + thumbnail uploads (used in publishAVideo)
export const upload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});
