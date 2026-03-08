# 🎬 VideoTube — Full Stack YouTube Clone

> A production-level YouTube clone built with the **MERN Stack** (MongoDB, Express.js, React, Node.js). Feature-rich with modern authentication, video streaming, and community engagement.

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9+-green?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.21+-000?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Authentication & Authorization
- 🔐 **JWT-based Authentication** — Access & Refresh tokens with auto-refresh mechanism
- 🔄 **Token Rotation** — Secure refresh token rotation strategy
- 🛡️ **Protected Routes** — Role-based access control for sensitive operations
- 📝 **Session Management** — Persistent user sessions with httpOnly cookies

### Video Management
- 📹 **Video Upload** — Cloudinary integration for video/thumbnail storage
- 🎬 **Video Streaming** — Efficient video playback and streaming
- 📊 **View Tracking** — Real-time view count updates
- 🔍 **Search & Filter** — Full-text search with category filtering
- 📜 **Watch History** — Automatic watch history tracking

### Social Features
- 👍 **Like System** — Like/unlike videos and comments
- 💬 **Comments** — Full CRUD operations on comments with edit/delete
- 🔔 **Subscriptions** — Subscribe/unsubscribe to channels
- 👥 **Channel Profiles** — Customizable user profiles with cover images
- 🎥 **Creator Dashboard** — Analytics and content management for creators

### Additional Features
- 📋 **Playlists** — Create, manage, and organize video playlists
- 🌙 **Dark Mode UI** — Modern responsive design with Tailwind CSS
- 📱 **Mobile Responsive** — Fully responsive across all devices
- ⚡ **Optimized Performance** — Lazy loading, pagination, rate limiting
- 🔐 **Security** — CORS, helmet.js, input validation, SQL injection prevention

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 4.21
- **Database**: MongoDB 8.9 with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs (12 rounds)
- **File Storage**: Cloudinary API
- **Security**: 
  - Helmet.js (security headers)
  - CORS middleware
  - Express Rate Limit
  - Input validation
- **Utilities**:
  - Multer (file upload)
  - Morgan (logging)
  - Dotenv (environment management)
  - Faker.js (data seeding)

### Frontend
- **Framework**: React 18 with Hooks
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + PostCSS
- **Build Tool**: Vite 6.4
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Routing**: React Router v6

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: Nodemon (auto-reload)
- **Testing**: Jest, React Testing Library (ready)

---

## 📁 Project Structure

```
youtube-clone/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── index.js               # Server entry point
│   │   ├── constants.js           # App constants
│   │   ├── controllers/           # Route handlers
│   │   │   ├── user.controller.js
│   │   │   ├── video.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── like.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   ├── playlist.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── video.model.js
│   │   │   ├── comment.model.js
│   │   │   ├── like.model.js
│   │   │   ├── subscription.model.js
│   │   │   ├── playlist.model.js
│   │   │   └── tweet.model.js
│   │   ├── routes/                # API endpoints
│   │   ├── middlewares/           # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── multer.middleware.js
│   │   ├── utils/                 # Helper functions
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   └── cloudinary.js
│   │   └── db/
│   │       └── index.js           # MongoDB connection
│   ├── scripts/
│   │   ├── seed.js                # Database seeding
│   │   └── clear-db.js            # Clear database
│   ├── public/                    # Static files
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Main app component
│   │   ├── index.css              # Global styles
│   │   ├── components/            # Reusable components
│   │   │   ├── Layout/
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   ├── VideoCard/
│   │   │   ├── VideoPlayer/
│   │   │   └── Comments/
│   │   ├── pages/                 # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── VideoPage.jsx
│   │   │   ├── ChannelPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── SearchPage.jsx
│   │   ├── features/              # Redux slices
│   │   │   └── auth/
│   │   ├── api/                   # API calls
│   │   │   ├── auth.api.js
│   │   │   ├── video.api.js
│   │   │   └── axiosInstance.js
│   │   ├── hooks/                 # Custom hooks
│   │   ├── utils/                 # Utility functions
│   │   ├── store/                 # Redux store
│   │   └── assets/                # Static assets
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── README.md
│
├── README.md
└── .gitignore
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 8.0 (local or Atlas)
- **Cloudinary Account** (for video/image upload)
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/youtube-clone.git
cd youtube-clone
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Fill in your MongoDB URI, Cloudinary keys, and JWT secrets
# See Configuration section below

# Seed database with sample data (optional)
npm run seed:clear    # Clear existing data
npm run seed          # Add fresh sample data

# Start backend server
npm start             # Production mode
# OR
npm run dev           # Development mode (with auto-reload)
```

**Backend runs on**: `http://localhost:8000`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start frontend dev server
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

### Step 4: Open Application
Navigate to `http://localhost:5173` in your browser.

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Server Config
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# Cloudinary (Image & Video Storage)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ACCESS_TOKEN_SECRET=your_long_random_secret_key_here
REFRESH_TOKEN_SECRET=your_long_random_secret_key_here

# Token Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cors
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables (.env)

```env
# API Configuration (leave blank to use Vite proxy)
VITE_API_BASE_URL=

# Or set custom API URL:
# VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 📖 Usage

### Test Credentials
The seeding script creates 15 test users. Login with any username from the seed:

```
Username: kayleelindgren (or any from seed)
Password: Password@123
```

### Key Workflows

#### 📹 Uploading a Video
1. Login to your account
2. Navigate to **Upload** page
3. Select video file and thumbnail
4. Fill in title, description, and category
5. Click **Publish**

#### 💬 Commenting on Videos
1. Go to any video page
2. Scroll to comments section
3. Type your comment
4. Click **Post Comment**
5. Edit/Delete your own comments

#### 🔔 Subscribing to Channels
1. Visit a creator's channel
2. Click **Subscribe** button
3. View their videos in your home feed

#### 📋 Creating Playlists
1. Go to **My Playlists**
2. Click **New Playlist**
3. Add videos by clicking **Add to Playlist** on any video
4. Manage and share your playlists

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/v1/users/register
Content-Type: multipart/form-data

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "avatar": <file>,
  "coverImage": <file> (optional)
}

Response: 201 Created
{
  "data": { user object },
  "message": "User registered successfully"
}
```

#### Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "johndoe",  // or email
  "password": "SecurePass123"
}

Response: 200 OK
{
  "data": { user object, accessToken, refreshToken },
  "message": "User logged in successfully"
}
```

#### Logout
```http
POST /api/v1/users/logout
Authorization: Bearer {accessToken}

Response: 200 OK
{ "message": "User logged out successfully" }
```

### Video Endpoints

#### Get All Videos
```http
GET /api/v1/videos?limit=10&page=1&query=javascript&sortBy=createdAt&sortType=desc
```

#### Upload Video
```http
POST /api/v1/videos
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

{
  "videoFile": <file>,
  "thumbnail": <file>,
  "title": "My Video",
  "description": "Video description",
  "duration": 300,
  "isPublished": true
}
```

#### Get Video by ID
```http
GET /api/v1/videos/{videoId}
```

#### Update Video
```http
PATCH /api/v1/videos/{videoId}
Authorization: Bearer {accessToken}

{
  "title": "Updated Title",
  "description": "Updated description",
  "thumbnail": <file>,
  "isPublished": true
}
```

#### Delete Video
```http
DELETE /api/v1/videos/{videoId}
Authorization: Bearer {accessToken}
```

### Comment Endpoints

#### Get Video Comments
```http
GET /api/v1/comments/{videoId}?limit=10&page=1
```

#### Add Comment
```http
POST /api/v1/comments/{videoId}
Authorization: Bearer {accessToken}

{
  "content": "Great video!"
}
```

#### Update Comment
```http
PATCH /api/v1/comments/{commentId}
Authorization: Bearer {accessToken}

{
  "content": "Updated comment"
}
```

#### Delete Comment
```http
DELETE /api/v1/comments/{commentId}
Authorization: Bearer {accessToken}
```

### Like Endpoints

#### Toggle Video Like
```http
POST /api/v1/like/toggle/v/{videoId}
Authorization: Bearer {accessToken}
```

#### Toggle Comment Like
```http
POST /api/v1/like/toggle/c/{commentId}
Authorization: Bearer {accessToken}
```

#### Get User's Liked Videos
```http
GET /api/v1/like/videos
Authorization: Bearer {accessToken}
```

### Subscription Endpoints

#### Toggle Subscription
```http
POST /api/v1/subscriptions/c/{channelId}
Authorization: Bearer {accessToken}
```

#### Get Channel Subscribers Count
```http
GET /api/v1/subscriptions/c/{channelId}
```

#### Get User's Subscriptions
```http
GET /api/v1/subscriptions/u/{userId}
```

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (unique, lowercase, 3-30 chars),
  email: String (unique, lowercase),
  fullName: String,
  avatar: String (Cloudinary URL),
  coverImage: String,
  password: String (bcrypt hashed),
  refreshToken: String,
  watchHistory: [VideoId],
  createdAt: Date,
  updatedAt: Date
}
```

### Video Schema
```javascript
{
  _id: ObjectId,
  videoFile: String (Cloudinary URL),
  thumbnail: String (Cloudinary URL),
  owner: UserId,
  title: String,
  description: String,
  duration: Number,
  views: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Schema
```javascript
{
  _id: ObjectId,
  content: String,
  video: VideoId,
  owner: UserId,
  createdAt: Date,
  updatedAt: Date
}
```

### Like Schema
```javascript
{
  _id: ObjectId,
  video: VideoId (optional),
  comment: CommentId (optional),
  likedBy: UserId,
  createdAt: Date
}
```

### Subscription Schema
```javascript
{
  _id: ObjectId,
  subscriber: UserId,
  channel: UserId,
  createdAt: Date
}
```

---

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify `MONGODB_URI` in `.env` is correct

**Cloudinary Upload Fails**
- Verify API credentials in `.env`
- Ensure files are within size limits
- Check Cloudinary account is active

**JWT Token Errors**
- Regenerate `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- Clear cookies and login again

### Frontend Issues

**Blank Page / Nothing Renders**
- Check browser console for errors
- Verify backend API is running on port 8000
- Check that Vite proxy is configured in `vite.config.js`

**Login Not Working**
- Verify backend is running
- Check credentials are correct
- Clear browser cookies and retry
- Ensure `withCredentials: true` in axios instance

**Videos Not Loading**
- Check video URLs in MongoDB
- Verify Cloudinary URLs are accessible
- Check CORS is enabled in backend

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- Follow existing code style
- Write clear commit messages
- Update README for new features
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Anuj**
- GitHub: [@Anuj](https://github.com/Thunderoustyphoon)
- Email: anujgupta2op.com

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Cloudinary API Docs](https://cloudinary.com/documentation)
- [JWT Guide](https://jwt.io/)

---

## 🙏 Acknowledgments

- Inspired by YouTube's design and functionality
- Built following production-level best practices
- Thanks to the open-source community

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Anuj

</div>

## 📚 Learning Path

1. **Read `backend/README.md`** — Backend concepts, API docs, aggregation pipelines
2. **Read `frontend/README.md`** — Frontend architecture, Redux, routing
3. Build and run the app
4. Add features: tweets, notifications, comments on comments

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary, Multer  
**Frontend:** React 18, Vite, Redux Toolkit, React Router v6, Axios, Tailwind CSS
