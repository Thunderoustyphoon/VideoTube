import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// ── Get All Videos (paginated, searchable, sortable) ─────────────────────────
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

  const pipeline = [];

  // Match only published videos first (performance: reduces documents early)
  pipeline.push({ $match: { isPublished: true } });

  // Filter by owner
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    pipeline.push({ $match: { owner: new mongoose.Types.ObjectId(userId) } });
  }

  // Text search (uses text index for performance)
  if (query?.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query.trim(), $options: "i" } },
          { description: { $regex: query.trim(), $options: "i" } },
        ],
      },
    });
  }

  // Sort before lookup (cheaper on smaller set)
  const sortField = ["createdAt", "views", "duration", "title"].includes(sortBy)
    ? sortBy
    : "createdAt";
  pipeline.push({ $sort: { [sortField]: sortType === "asc" ? 1 : -1 } });

  // Lookup owner details
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          { $project: { username: 1, avatar: 1, fullName: 1 } },
        ],
      },
    },
    {
      $unwind: {
        path: "$ownerDetails",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  // Project only needed fields
  pipeline.push({
    $project: {
      videoFile: 1,
      thumbnail: 1,
      title: 1,
      description: 1,
      duration: 1,
      views: 1,
      isPublished: 1,
      createdAt: 1,
      ownerDetails: 1,
    },
  });

  const options = {
    page: Math.max(parseInt(page, 10), 1),
    limit: Math.min(parseInt(limit, 10), 50), // cap at 50 per page
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };

  const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// ── Publish a Video ───────────────────────────────────────────────────────────
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // Upload both to Cloudinary concurrently
  const [videoFile, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoFileLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ]);

  if (!videoFile?.url) {
    throw new ApiError(500, "Video file upload failed. Please try again.");
  }
  if (!thumbnail?.url) {
    // Clean up uploaded video if thumbnail fails
    deleteFromCloudinary(videoFile.url, "video").catch(() => {});
    throw new ApiError(500, "Thumbnail upload failed. Please try again.");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title: title.trim(),
    description: description.trim(),
    duration: videoFile.duration || 0,
    owner: req.user._id,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

// ── Get Video By ID (full details with aggregation) ───────────────────────────
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    // Get all likes for this video
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    // Get owner info + their subscriber count
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: { $first: "$owner" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        isPublished: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  if (!video?.[0]) {
    throw new ApiError(404, "Video not found");
  }

  // Check if video is published (or viewer is the owner)
  const videoData = video[0];
  if (!videoData.isPublished && videoData.owner?._id?.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "This video is not available");
  }

  // Increment views and update watch history concurrently (non-blocking)
  Promise.all([
    Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }),
    req.user?._id
      ? User.findByIdAndUpdate(req.user._id, { $addToSet: { watchHistory: videoId } })
      : Promise.resolve(),
  ]).catch((err) => console.error("Failed to update views/history:", err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video fetched successfully"));
});

// ── Update Video ──────────────────────────────────────────────────────────────
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  if (!title?.trim() && !description?.trim() && !req.file) {
    throw new ApiError(400, "At least one field to update is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateFields = {};
  if (title?.trim()) updateFields.title = title.trim();
  if (description?.trim()) updateFields.description = description.trim();

  // Handle new thumbnail upload
  if (req.file?.path) {
    const thumbnail = await uploadOnCloudinary(req.file.path);
    if (!thumbnail?.url) {
      throw new ApiError(500, "Thumbnail upload failed");
    }
    updateFields.thumbnail = thumbnail.url;

    // Delete old thumbnail (non-blocking)
    deleteFromCloudinary(video.thumbnail, "image").catch((err) =>
      console.error("Failed to delete old thumbnail:", err.message)
    );
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// ── Delete Video ──────────────────────────────────────────────────────────────
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  // Delete from cloudinary (non-blocking, log errors)
  Promise.all([
    deleteFromCloudinary(video.videoFile, "video"),
    deleteFromCloudinary(video.thumbnail, "image"),
  ]).catch((err) => console.error("Cloudinary cleanup error:", err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId }, "Video deleted successfully"));
});

// ── Toggle Publish Status ─────────────────────────────────────────────────────
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to change this video's status");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: updatedVideo.isPublished },
        `Video ${updatedVideo.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
