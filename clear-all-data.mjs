import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

async function clearAllData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection is undefined.");
    }

    console.log("Deleting all courses...");
    await db.collection("courses").deleteMany({});
    
    console.log("Deleting all batches...");
    await db.collection("batches").deleteMany({});
    
    console.log("Deleting all students...");
    await db.collection("students").deleteMany({});
    
    console.log("Deleting all payments...");
    await db.collection("payments").deleteMany({});

    console.log("All specified data successfully deleted.");
  } catch (error) {
    console.error("Error during data deletion:", error);
  } finally {
    console.log("Closing database connection...");
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

clearAllData();
