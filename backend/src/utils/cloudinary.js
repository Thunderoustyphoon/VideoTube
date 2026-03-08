import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Initialize cloudinary config only once, lazily
let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isConfigured) return;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  console.log("✅ Cloudinary configured successfully");
  isConfigured = true;
};

/**
 * Safely remove a local temp file without throwing
 */
const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Failed to delete local file:", filePath, err.message);
  }
};

/**
 * Upload a local file to Cloudinary and delete it locally afterwards.
 * Returns the cloudinary response object or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Ensure Cloudinary is configured before trying to upload
    ensureCloudinaryConfigured();

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      // Folder organisation in Cloudinary
      folder: "videotube",
    });

    safeUnlink(localFilePath);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    safeUnlink(localFilePath);
    return null;
  }
};

/**
 * Extract the Cloudinary public_id correctly from a full URL.
 * Handles URLs like:
 *   https://res.cloudinary.com/demo/image/upload/v1234567890/videotube/abc123.jpg
 * Returns "videotube/abc123" (folder + filename without extension)
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // Split at /upload/ and take everything after, strip version segment and extension
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // Remove version prefix (v1234567890/) if present
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
};

/**
 * Delete an asset from Cloudinary by its full URL.
 * @param {string} url - full Cloudinary URL
 * @param {string} resourceType - "image" | "video" | "raw"
 */
const deleteFromCloudinary = async (url, resourceType = "image") => {
  try {
    // Ensure Cloudinary is configured before trying to delete
    ensureCloudinaryConfigured();
    
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
