import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import Batch from "@/models/Batch";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Calculate new overall stats
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalTeachers = await User.countDocuments({ role: "user", accountType: "teacher" });
    const totalCoachingCenters = await User.countDocuments({ role: "user", accountType: "coaching_center" });
    const inactiveTeachers = await User.countDocuments({ role: "user", accountType: "teacher", isBlocked: true });
    const inactiveCoachingCenters = await User.countDocuments({ role: "user", accountType: "coaching_center", isBlocked: true });

    // We can also fetch recent users
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalCoachingCenters,
        inactiveTeachers,
        inactiveCoachingCenters,
        recentUsers,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch admin dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
