import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, message: "DB connection failed" }, { status: 500 });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ coachingName: "Growth Skill Academy" });

    if (!user) {
      return NextResponse.json({ success: false, message: "User Growth Skill Academy not found." }, { status: 404 });
    }

    const ownerId = user._id;

    const res1 = await db.collection("students").deleteMany({ ownerId });
    const res2 = await db.collection("batches").deleteMany({ ownerId });
    const res3 = await db.collection("courses").deleteMany({ ownerId });
    const res4 = await db.collection("payments").deleteMany({ ownerId });

    return NextResponse.json({
      success: true,
      message: "Data deleted successfully for Growth Skill Academy",
      deletedCounts: {
        students: res1?.deletedCount,
        batches: res2?.deletedCount,
        courses: res3?.deletedCount,
        payments: res4?.deletedCount,
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to clear DB", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
