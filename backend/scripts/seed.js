import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Import models
import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Like } from "../src/models/like.model.js";
import { Playlist } from "../src/models/playlist.model.js";
import { Subscription } from "../src/models/subscription.model.js";
import { DB_NAME } from "../src/constants.js";

const SEED_CONFIG = {
  USERS_COUNT: 15,
  VIDEOS_PER_USER: 5,
  COMMENTS_PER_VIDEO: 8,
  LIKES_PER_VIDEO: 20,
  PLAYLISTS_PER_USER: 2,
  SUBSCRIPTIONS_PER_USER: 8,
};

// Helper: Generate fake avatar URL (using placeholder service)
const generateAvatarUrl = () => {
  const seed = faker.string.uuid();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

// Helper: Sanitize username to only include letters, numbers, and underscores
const generateUsername = () => {
  let username = faker.internet.username().toLowerCase();
  // Remove invalid characters, keep only alphanumeric and underscores
  username = username.replace(/[^a-z0-9_]/g, '');
  // Ensure it's not empty and between 3-30 characters
  if (!username || username.length < 3) {
    username = `user_${faker.number.int({ min: 100, max: 999 })}`;
  } else if (username.length > 30) {
    username = username.substring(0, 30);
  }
  return username;
};

// Helper: Generate fake thumbnail URL
const generateThumbnailUrl = () => {
  const width = 320;
  const height = 180;
  return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
};

// Helper: Generate fake video URL
const generateVideoUrl = () => {
  return `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4`;
};

// Main seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Playlist.deleteMany({}),
      Subscription.deleteMany({}),
    ]);
    console.log("✅ Database cleared");

    // ───────────────────────────────────────────────────────────────
    // 1. CREATE USERS
    // ───────────────────────────────────────────────────────────────
    console.log("\n📝 Creating users...");
    const users = [];

    for (let i = 0; i < SEED_CONFIG.USERS_COUNT; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = generateUsername();
      const email = faker.internet.email().toLowerCase();
      // ✅ Pass plain password - let model's pre-save hook handle hashing
      const password = "Password@123";

      const user = await User.create({
        username,
        email,
        fullName: `${firstName} ${lastName}`,
        avatar: generateAvatarUrl(),
        coverImage: `https://picsum.photos/1200/300?random=${i}`,
        password,
      });

      users.push(user);
      console.log(`   ✓ Created user ${i + 1}/${SEED_CONFIG.USERS_COUNT}: ${username}`);
    }
    console.log(`✅ Created ${users.length} users`);

    // ───────────────────────────────────────────────────────────────
    // 2. CREATE VIDEOS
    // ───────────────────────────────────────────────────────────────
    console.log("\n🎬 Creating videos...");
    const videos = [];
    const categoryTopics = [
      "Technology",
      "Gaming",
      "Music",
      "Vlogging",
      "Education",
      "Travel",
      "Cooking",
      "Fitness",
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      for (let j = 0; j < SEED_CONFIG.VIDEOS_PER_USER; j++) {
        const topic = faker.helpers.arrayElement(categoryTopics);
        const video = await Video.create({
          videoFile: generateVideoUrl(),
          thumbnail: generateThumbnailUrl(),
          title: `${topic}: ${faker.lorem.words(4)}`,
          description: faker.lorem.paragraph(3),
          duration: Math.floor(Math.random() * (3600 - 60) + 60), // Random between 1-60 minutes
          views: Math.floor(Math.random() * 100000),
          isPublished: true,
          owner: user._id,
        });

        videos.push(video);
      }
      console.log(`   ✓ Created ${SEED_CONFIG.VIDEOS_PER_USER} videos for ${user.username}`);
    }
    console.log(`✅ Created ${videos.length} videos total`);

    // ───────────────────────────────────────────────────────────────
    // 3. CREATE COMMENTS
    // ───────────────────────────────────────────────────────────────
    console.log("\n💬 Creating comments...");
    let commentCount = 0;

    for (const video of videos) {
      for (let i = 0; i < SEED_CONFIG.COMMENTS_PER_VIDEO; i++) {
        const randomUser = faker.helpers.arrayElement(users);
        await Comment.create({
          content: faker.lorem.paragraph(1),
          video: video._id,
          owner: randomUser._id,
        });
        commentCount++;
      }
    }
    console.log(`✅ Created ${commentCount} comments`);

    // ───────────────────────────────────────────────────────────────
    // 4. CREATE LIKES ON VIDEOS AND COMMENTS
    // ───────────────────────────────────────────────────────────────
    console.log("\n👍 Creating likes...");
    let likeCount = 0;

    // Likes on videos
    for (const video of videos) {
      const likesForThisVideo = Math.min(
        SEED_CONFIG.LIKES_PER_VIDEO,
        Math.floor(Math.random() * users.length)
      );

      for (let i = 0; i < likesForThisVideo; i++) {
        const randomUser = faker.helpers.arrayElement(users);
        try {
          await Like.create({
            video: video._id,
            likedBy: randomUser._id,
          });
          likeCount++;
        } catch (e) {
          // Duplicate like, ignore
        }
      }
    }

    // Likes on comments
    const comments = await Comment.find();
    for (const comment of comments.slice(0, 50)) {
      const likesForThisComment = Math.floor(Math.random() * 10);
      for (let i = 0; i < likesForThisComment; i++) {
        const randomUser = faker.helpers.arrayElement(users);
        try {
          await Like.create({
            comment: comment._id,
            likedBy: randomUser._id,
          });
          likeCount++;
        } catch (e) {
          // Duplicate like, ignore
        }
      }
    }
    console.log(`✅ Created ${likeCount} likes`);

    // ───────────────────────────────────────────────────────────────
    // 5. CREATE SUBSCRIPTIONS
    // ───────────────────────────────────────────────────────────────
    console.log("\n🔔 Creating subscriptions...");
    let subscriptionCount = 0;

    for (const subscriber of users) {
      const channelsToSubscribeTo = Math.floor(Math.random() * SEED_CONFIG.SUBSCRIPTIONS_PER_USER);

      for (let i = 0; i < channelsToSubscribeTo; i++) {
        const channel = faker.helpers.arrayElement(users);

        // Avoid self-subscription
        if (subscriber._id.toString() !== channel._id.toString()) {
          try {
            await Subscription.create({
              subscriber: subscriber._id,
              channel: channel._id,
            });
            subscriptionCount++;
          } catch (e) {
            // Duplicate subscription, ignore
          }
        }
      }
    }
    console.log(`✅ Created ${subscriptionCount} subscriptions`);

    // ───────────────────────────────────────────────────────────────
    // 6. CREATE PLAYLISTS
    // ───────────────────────────────────────────────────────────────
    console.log("\n📋 Creating playlists...");
    let playlistCount = 0;

    for (const user of users) {
      for (let i = 0; i < SEED_CONFIG.PLAYLISTS_PER_USER; i++) {
        const playlistVideos = faker.helpers
          .arrayElements(videos, Math.floor(Math.random() * 10))
          .map((v) => v._id);

        await Playlist.create({
          name: `${faker.lorem.words(2)} Playlist`,
          description: faker.lorem.paragraph(1),
          videos: playlistVideos,
          owner: user._id,
        });
        playlistCount++;
      }
    }
    console.log(`✅ Created ${playlistCount} playlists`);

    // ───────────────────────────────────────────────────────────────
    // 7. ADD WATCH HISTORY
    // ───────────────────────────────────────────────────────────────
    console.log("\n👀 Adding watch history...");
    for (const user of users) {
      const watchedVideos = faker.helpers
        .arrayElements(videos, Math.floor(Math.random() * 20))
        .map((v) => v._id);

      await User.findByIdAndUpdate(user._id, {
        watchHistory: watchedVideos,
      });
    }
    console.log("✅ Watch history added");

    // ───────────────────────────────────────────────────────────────
    // SUMMARY
    // ───────────────────────────────────────────────────────────────
    console.log("\n" + "=".repeat(50));
    console.log("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`
📊 SUMMARY:
   • Users: ${users.length}
   • Videos: ${videos.length}
   • Comments: ${commentCount}
   • Likes: ${likeCount}
   • Subscriptions: ${subscriptionCount}
   • Playlists: ${playlistCount}

🔐 TEST CREDENTIALS:
   Email: ${users[0].email}
   Username: ${users[0].username}
   Password: Password@123
    `);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
