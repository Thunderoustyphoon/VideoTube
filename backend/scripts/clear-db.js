import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Like } from "../src/models/like.model.js";
import { Playlist } from "../src/models/playlist.model.js";
import { Subscription } from "../src/models/subscription.model.js";
import { DB_NAME } from "../src/constants.js";

async function clearDatabase() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️  Clearing all collections...");
    const result = await Promise.all([
      User.deleteMany({}),
      Video.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Playlist.deleteMany({}),
      Subscription.deleteMany({}),
    ]);

    console.log("✅ Database cleared successfully!");
    console.log(`   - Users: ${result[0].deletedCount}`);
    console.log(`   - Videos: ${result[1].deletedCount}`);
    console.log(`   - Comments: ${result[2].deletedCount}`);
    console.log(`   - Likes: ${result[3].deletedCount}`);
    console.log(`   - Playlists: ${result[4].deletedCount}`);
    console.log(`   - Subscriptions: ${result[5].deletedCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to clear database:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

clearDatabase();
