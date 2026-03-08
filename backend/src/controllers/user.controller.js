import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ── Helper: generate both tokens and save refresh token to DB ─────────────────
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    // Re-throw ApiErrors, wrap others
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// ── Cookie options ────────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
};

// ── Register ──────────────────────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  console.log("📝 REGISTER DEBUG:");
  console.log("   Full Name:", fullName);
  console.log("   Email:", email);
  console.log("   Username:", username);
  console.log("   Password:", password ? "✓ Provided" : "✗ Missing");

  // Validate all required fields
  if ([fullName, email, username, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  
  console.log("   User Already Exists?", existedUser ? "✓ YES" : "✗ NO");
  
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Validate that avatar file was uploaded
  if (!req.files?.avatar?.[0]?.path) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarLocalPath = req.files.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

  console.log("   Avatar Path:", avatarLocalPath);
  console.log("   Cover Image Path:", coverImageLocalPath || "None");

  // Upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(500, "Failed to upload avatar. Please try again.");
  }

  console.log("   Avatar URL:", avatar.url);

  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // Create user with properly formatted data
  const userData = {
    fullName: fullName.trim(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email.toLowerCase().trim(),
    password,
    username: username.toLowerCase().trim(),
  };

  console.log("   Data to Save:", {
    ...userData,
    password: "***",
  });

  const user = await User.create(userData);

  console.log("   User Created with ID:", user._id);

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  console.log("   Final Stored User:", {
    id: createdUser._id,
    username: createdUser.username,
    email: createdUser.email,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  let { email, username, password } = req.body;

  console.log("🔐 LOGIN DEBUG:");
  console.log("   Email:", email);
  console.log("   Username:", username);
  console.log("   Password:", password ? "✓ Provided" : "✗ Missing");

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Helper: Check if a string looks like an email
  const isEmailFormat = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str?.trim());

  // If username field contains an email-format string, move it to email
  if (username && isEmailFormat(username) && !email) {
    console.log("   ℹ️  Detected email in username field, swapping...");
    email = username;
    username = null;
  }

  // If email field contains a username-format string, move it to username
  if (email && !isEmailFormat(email) && !username) {
    console.log("   ℹ️  Detected username in email field, swapping...");
    username = email;
    email = null;
  }

  const $orConditions = [];
  if (username) $orConditions.push({ username: username.toLowerCase() });
  if (email) $orConditions.push({ email: email.toLowerCase() });

  const searchQuery = { $or: $orConditions };
  
  console.log("   Search Query:", JSON.stringify(searchQuery));

  const user = await User.findOne(searchQuery);

  console.log("   User Found?", user ? "✓ YES" : "✗ NO");
  if (user) {
    console.log("   User ID:", user._id);
    console.log("   Stored Username:", user.username);
    console.log("   Stored Email:", user.email);
  }

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("   Password Valid?", isPasswordValid ? "✓ YES" : "✗ NO");
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ── Logout ────────────────────────────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ── Refresh Access Token ──────────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or already used");
  }

  // Generate new token pair (rotation)
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

// ── Change Password ───────────────────────────────────────────────────────────
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ── Get Current User ──────────────────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// ── Update Account Details ────────────────────────────────────────────────────
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName?.trim() && !email?.trim()) {
    throw new ApiError(400, "At least one field (fullName or email) is required");
  }

  const updateFields = {};
  if (fullName?.trim()) updateFields.fullName = fullName.trim();
  if (email?.trim()) updateFields.email = email.toLowerCase().trim();

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// ── Update Avatar ─────────────────────────────────────────────────────────────
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // Fetch old avatar URL to delete from cloudinary after update
  const oldUser = await User.findById(req.user._id);
  const oldAvatarUrl = oldUser?.avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  // Delete old avatar from cloudinary (non-blocking)
  if (oldAvatarUrl) {
    deleteFromCloudinary(oldAvatarUrl, "image").catch((err) =>
      console.error("Failed to delete old avatar:", err.message)
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// ── Update Cover Image ────────────────────────────────────────────────────────
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new ApiError(500, "Failed to upload cover image");
  }

  const oldUser = await User.findById(req.user._id);
  const oldCoverImageUrl = oldUser?.coverImage;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  // Delete old cover image (non-blocking)
  if (oldCoverImageUrl) {
    deleteFromCloudinary(oldCoverImageUrl, "image").catch((err) =>
      console.error("Failed to delete old cover image:", err.message)
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// ── Get Channel Profile (aggregation) ────────────────────────────────────────
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username.trim().toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
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
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

// ── Get Watch History (nested aggregation) ────────────────────────────────────
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // Only include published videos
          { $match: { isPublished: true } },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!user?.[0]) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
