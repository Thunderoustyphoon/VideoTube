# 🔧 VideoTube Backend — Chai aur Code Style

> A **production-level** YouTube clone backend built with Node.js, Express, MongoDB — following the exact folder structure and code philosophy taught by **Hitesh Choudhary (Chai aur Code)** in his backend series.

---

## 📚 Table of Contents

1. [What You'll Learn](#what-youll-learn)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Core Concepts Explained](#core-concepts-explained)
7. [API Reference](#api-reference)
8. [MongoDB Aggregation Pipelines](#mongodb-aggregation-pipelines)
9. [Authentication Flow](#authentication-flow)
10. [File Uploads with Cloudinary](#file-uploads-with-cloudinary)
11. [Common Patterns](#common-patterns)

---

## 🎯 What You'll Learn

By studying this backend you will understand:

- How to structure a production Node.js + Express application
- How MongoDB Aggregation Pipelines work (lookup, addFields, project, group, match)
- JWT Authentication with Access + Refresh Token strategy
- File uploads to Cloudinary via Multer middleware
- Custom error handling with a reusable `ApiError` class
- Clean response formatting with `ApiResponse`
- `asyncHandler` wrapper to avoid try-catch repetition
- Route protection with middleware (`verifyJWT`)
- Mongoose model hooks (pre-save for password hashing)
- Mongoose instance methods (`generateAccessToken`, `isPasswordCorrect`)
- How to structure controllers that are clean and readable

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM (Object Document Mapper) |
| **JWT** | Authentication (Access + Refresh tokens) |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Cloud media storage for videos + images |
| **Multer** | Handle file uploads (stores to disk temp) |
| **Cookie Parser** | Parse cookies from requests |
| **CORS** | Enable cross-origin requests |
| **dotenv** | Manage environment variables |
| **mongoose-aggregate-paginate-v2** | Paginate aggregation pipeline results |

---

## 📁 Folder Structure

```
backend/
├── public/
│   └── temp/              ← Multer temp uploads (gitignored)
├── src/
│   ├── controllers/       ← Business logic for each feature
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── subscription.controller.js
│   │   ├── playlist.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── db/
│   │   └── index.js       ← MongoDB connection logic
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js   ← verifyJWT middleware
│   │   └── multer.middleware.js ← File upload middleware
│   │
│   ├── models/            ← Mongoose schemas
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── subscription.model.js
│   │   ├── playlist.model.js
│   │   └── tweet.model.js
│   │
│   ├── routes/            ← Express route definitions
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── subscription.routes.js
│   │   ├── playlist.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── utils/             ← Reusable helper utilities
│   │   ├── ApiError.js    ← Custom error class
│   │   ├── ApiResponse.js ← Standardized response wrapper
│   │   ├── asyncHandler.js ← Async try-catch wrapper
│   │   └── cloudinary.js  ← Upload/delete on Cloudinary
│   │
│   ├── app.js             ← Express app setup, middleware, routes
│   ├── constants.js       ← App-wide constants (DB_NAME etc.)
│   └── index.js           ← Entry point, starts server
│
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier works)

### Installation

```bash
# 1. Clone and navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Fill in your .env values (see below)

# 4. Start development server
npm run dev
```

Server runs at: `http://localhost:8000`

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` root:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_very_secret_key_for_access_token
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_very_secret_key_for_refresh_token
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**How to get Cloudinary keys:**
1. Sign up at cloudinary.com
2. Go to Dashboard → find Cloud name, API Key, API Secret

---

## 💡 Core Concepts Explained

### 1. `asyncHandler` — The Chai aur Code Way

Instead of writing try-catch in every controller, we wrap every controller function:

```javascript
// utils/asyncHandler.js
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
```

**Usage in controllers:**
```javascript
const getUser = asyncHandler(async (req, res) => {
  // No try-catch needed! Errors automatically go to Express error handler
  const user = await User.findById(req.params.id);
  res.json(new ApiResponse(200, user, "User fetched"));
});
```

---

### 2. `ApiError` — Consistent Error Responses

```javascript
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
  }
}

// Throw errors anywhere like this:
throw new ApiError(404, "User not found");
throw new ApiError(401, "Unauthorized");
throw new ApiError(400, "All fields are required");
```

---

### 3. `ApiResponse` — Standardized Success Responses

```javascript
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

// Use in controllers:
return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
```

Every successful response looks like:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "User fetched successfully",
  "success": true
}
```

---

### 4. User Model — Mongoose Hooks & Methods

**Pre-save hook** (auto-hash password before saving):
```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password changed
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Instance method** (check password):
```javascript
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
```

**Instance method** (generate JWT):
```javascript
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
```

---

### 5. `verifyJWT` Middleware

```javascript
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // Check token in cookies OR Authorization header
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized request");

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

  if (!user) throw new ApiError(401, "Invalid Access Token");

  req.user = user; // Attach user to request object
  next();
});
```

**Usage on routes:**
```javascript
router.route("/logout").post(verifyJWT, logoutUser);
// OR apply to all routes in a file:
router.use(verifyJWT);
```

---

## 📡 API Reference

### Users `/api/v1/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register with avatar + cover image |
| POST | `/login` | ❌ | Login, get tokens in cookies |
| POST | `/logout` | ✅ | Clear tokens |
| POST | `/refresh-token` | ❌ | Get new access token |
| POST | `/change-password` | ✅ | Change password |
| GET | `/current-user` | ✅ | Get logged-in user |
| PATCH | `/update-account` | ✅ | Update fullName, email |
| PATCH | `/avatar` | ✅ | Upload new avatar |
| PATCH | `/cover-image` | ✅ | Upload new cover image |
| GET | `/c/:username` | ✅ | Get channel profile (aggregation) |
| GET | `/history` | ✅ | Get watch history (nested aggregation) |

### Videos `/api/v1/videos`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all videos (paginated, searchable) |
| POST | `/` | ✅ | Upload video + thumbnail |
| GET | `/:videoId` | ✅ | Get video details (increments views) |
| PATCH | `/:videoId` | ✅ | Update title, description, thumbnail |
| DELETE | `/:videoId` | ✅ | Delete video + cloudinary files |
| PATCH | `/toggle/publish/:videoId` | ✅ | Toggle publish status |

### Comments `/api/v1/comments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/:videoId` | ✅ | Get paginated comments |
| POST | `/:videoId` | ✅ | Add comment |
| PATCH | `/c/:commentId` | ✅ | Edit comment |
| DELETE | `/c/:commentId` | ✅ | Delete comment |

### Likes `/api/v1/likes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/toggle/v/:videoId` | ✅ | Like/unlike video |
| POST | `/toggle/c/:commentId` | ✅ | Like/unlike comment |
| POST | `/toggle/t/:tweetId` | ✅ | Like/unlike tweet |
| GET | `/videos` | ✅ | Get liked videos |

### Subscriptions `/api/v1/subscriptions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/c/:channelId` | ✅ | Get channel subscribers |
| POST | `/c/:channelId` | ✅ | Subscribe/unsubscribe |
| GET | `/u/:subscriberId` | ✅ | Get subscribed channels |

### Playlists `/api/v1/playlists`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create playlist |
| GET | `/user/:userId` | ✅ | Get user's playlists |
| GET | `/:playlistId` | ✅ | Get playlist details |
| PATCH | `/:playlistId` | ✅ | Update playlist |
| DELETE | `/:playlistId` | ✅ | Delete playlist |
| PATCH | `/add/:videoId/:playlistId` | ✅ | Add video |
| PATCH | `/remove/:videoId/:playlistId` | ✅ | Remove video |

### Dashboard `/api/v1/dashboard`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | ✅ | Get channel stats |
| GET | `/videos` | ✅ | Get channel videos with stats |

---

## 🔄 MongoDB Aggregation Pipelines

This is the most important part to learn! Study each pipeline:

### 1. Get Channel Profile (with subscriber count)

```javascript
const channel = await User.aggregate([
  // Stage 1: Find the user
  { $match: { username: username.toLowerCase() } },

  // Stage 2: Join with subscriptions to get WHO subscribed to this channel
  {
    $lookup: {
      from: "subscriptions",       // collection name (lowercase, plural)
      localField: "_id",            // this user's _id
      foreignField: "channel",      // match where subscription.channel = user._id
      as: "subscribers",            // result stored in "subscribers" array
    },
  },

  // Stage 3: Join with subscriptions to see WHO this user subscribed to
  {
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo",
    },
  },

  // Stage 4: Calculate counts + check if current user subscribed
  {
    $addFields: {
      subscribersCount: { $size: "$subscribers" },
      channelsSubscribedToCount: { $size: "$subscribedTo" },
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // is current user in subscribers?
          then: true,
          else: false,
        },
      },
    },
  },

  // Stage 5: Choose what to return
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
    },
  },
]);
```

### 2. Get Watch History (nested $lookup)

```javascript
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
      pipeline: [              // ← nested pipeline runs FOR EACH video!
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              { $project: { fullName: 1, username: 1, avatar: 1 } },
            ],
          },
        },
        {
          $addFields: { owner: { $first: "$owner" } }, // unwrap array to single object
        },
      ],
    },
  },
]);
```

### 3. Get Video with Like Count + Owner Subscriber Count

```javascript
const video = await Video.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(videoId) } },

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
        { $project: { username: 1, avatar: 1, subscribersCount: 1, isSubscribed: 1 } },
      ],
    },
  },

  // Calculate final fields
  {
    $addFields: {
      likesCount: { $size: "$likes" },
      owner: { $first: "$owner" },  // arrays become single objects
      isLiked: {
        $cond: {
          if: { $in: [req.user?._id, "$likes.likedBy"] },
          then: true,
          else: false,
        },
      },
    },
  },
]);
```

---

## 🔑 Authentication Flow

```
1. User registers → password hashed by Mongoose pre-save hook
2. User logs in → validate password → generate accessToken + refreshToken
3. Both tokens stored: accessToken (short-lived, 1d) + refreshToken (long-lived, 10d)
4. accessToken sent in cookie + response body
5. Frontend attaches accessToken to every request header: "Authorization: Bearer <token>"
6. verifyJWT middleware validates token, attaches user to req.user
7. When accessToken expires → frontend hits /refresh-token with refreshToken
8. Server validates refreshToken → issues new accessToken + refreshToken
9. Logout → refreshToken removed from DB
```

---

## ☁️ File Uploads with Cloudinary

**Flow:**
1. **Multer** receives the file → saves temporarily to `./public/temp/`
2. **uploadOnCloudinary** → uploads from disk to Cloudinary
3. After upload → delete the temp file using `fs.unlinkSync(localFilePath)`
4. Store the Cloudinary URL in MongoDB

```javascript
// middlewares/multer.middleware.js
const storage = multer.diskStorage({
  destination: "./public/temp",
  filename: (req, file, cb) => cb(null, file.originalname),
});

// controllers: access uploaded files via req.files
const avatarLocalPath = req.files?.avatar[0]?.path;
const avatar = await uploadOnCloudinary(avatarLocalPath);
// avatar.url → save this to DB
```

---

## 🎨 Common Patterns

### Toggle Pattern (Like, Subscribe)

```javascript
const existing = await Like.findOne({ video: videoId, likedBy: req.user._id });

if (existing) {
  await Like.findByIdAndDelete(existing._id);
  return res.json(new ApiResponse(200, { isLiked: false }));
}

await Like.create({ video: videoId, likedBy: req.user._id });
return res.json(new ApiResponse(200, { isLiked: true }));
```

### Owner Check Pattern

```javascript
if (video.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "You are not authorized to perform this action");
}
```

### Pagination with Aggregation

```javascript
const options = { page: parseInt(page), limit: parseInt(limit) };
const aggregate = Video.aggregate(pipeline);
const result = await Video.aggregatePaginate(aggregate, options);
// result.docs, result.totalPages, result.hasNextPage
```

---

## 📖 Learn This Step by Step

1. **Start with `utils/`** — understand `asyncHandler`, `ApiError`, `ApiResponse`
2. **Study `models/`** — understand schemas, hooks, methods
3. **Understand `db/index.js`** — MongoDB connection
4. **Read `middlewares/`** — JWT verification, multer setup
5. **Go through `controllers/user.controller.js`** — complete user flow
6. **Study aggregation in `user.controller.js`** — `getUserChannelProfile` and `getWatchHistory`
7. **Then `video.controller.js`** — video CRUD with aggregation
8. **Finally `dashboard.controller.js`** — complex group aggregations

> **Tip:** Run the API with Postman/Thunder Client while reading the code to see what each endpoint returns!
