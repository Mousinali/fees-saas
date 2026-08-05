import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // Common stats
    const totalStudents = await Student.countDocuments({ ownerId: objectId });

    const earningsAggr = await Payment.aggregate([
      { $match: { ownerId: objectId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalEarnings = earningsAggr.length > 0 ? earningsAggr[0].total : 0;

    let branchStats: any[] = [];

    if (user.accountType === "coaching_center" && user.branches) {
      // Students per branch
      const studentsPerBranch = await Student.aggregate([
        { $match: { ownerId: objectId } },
        { $group: { _id: "$branchId", count: { $sum: 1 } } }
      ]);
      
      const studentMap = new Map();
      studentsPerBranch.forEach(item => {
        studentMap.set(item._id || "unassigned", item.count);
      });

      // Earnings per branch
      const earningsPerBranch = await Payment.aggregate([
        { $match: { ownerId: objectId, status: "paid" } },
        { $group: { _id: "$branchId", total: { $sum: "$amount" } } }
      ]);

      const earningMap = new Map();
      earningsPerBranch.forEach(item => {
        earningMap.set(item._id || "unassigned", item.total);
      });

      // Map it back to the user's branches array
      branchStats = user.branches.map((b: any) => ({
        id: b._id.toString(),
        name: b.name,
        students: studentMap.get(b._id.toString()) || 0,
        earnings: earningMap.get(b._id.toString()) || 0,
      }));

      // Also include unassigned if there are any
      const unassignedStudents = studentMap.get("unassigned") || 0;
      const unassignedEarnings = earningMap.get("unassigned") || 0;
      if (unassignedStudents > 0 || unassignedEarnings > 0) {
        branchStats.push({
          id: "unassigned",
          name: "Unassigned",
          students: unassignedStudents,
          earnings: unassignedEarnings,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        totalStudents,
        totalEarnings,
        branchStats
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch user analytics:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
