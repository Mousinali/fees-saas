import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Batch from "@/models/Batch";
import Payment from "@/models/Payment";

function getUserId(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

function getBranchId(request: NextRequest) {
  return request.cookies.get("branchId")?.value || undefined;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const ownerId = getUserId(request);
    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const branchId = getBranchId(request);
    const query: any = { ownerId };
    if (branchId) query.branchId = branchId;

    // 1. Total Active Students
    const totalStudents = await Student.countDocuments({ ...query, status: "active" });

    // 2. Total Active Batches
    const totalBatches = await Batch.countDocuments({ ...query, status: "active" });

    // 3. Total Revenue (Current Month)
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const paymentsThisMonth = await Payment.find({
      ...query,
      month: currentMonth,
      year: currentYear,
    });
    const monthlyRevenue = paymentsThisMonth.reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Recent Payments (Latest 5)
    const recentPayments = await Payment.find(query)
      .populate("studentId", "fullName phone photo")
      .populate("batchId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalBatches,
        monthlyRevenue,
        recentPayments,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
