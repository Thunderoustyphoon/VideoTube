import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Get Channel Stats ─────────────────────────────────────────────────────────
const getChannelStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const [subscriberResult, videoStats] = await Promise.all([
    // Total subscribers for this channel
    Subscription.aggregate([
      { $match: { channel: userId } },
      { $count: "subscribersCount" },
    ]),

    // Total videos, views, likes
    Video.aggregate([
      { $match: { owner: userId } },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
        },
      },
    ]),
  ]);

  const channelStats = {
    totalSubscribers: subscriberResult[0]?.subscribersCount || 0,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, channelStats, "Channel stats fetched successfully"));
});

// ── Get Channel Videos ────────────────────────────────────────────────────────
const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const videos = await Video.aggregate([
    { $match: { owner: userId } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        views: 1,
        isPublished: 1,
        duration: 1,
        createdAt: 1,
        likesCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
