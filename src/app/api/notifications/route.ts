import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import dayjs from "dayjs";

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

    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const currentMonth = now.month() + 1; // 1-12
    const currentYear = now.year();

    // 1. Due Students (balance > 0)
    const dueStudentsCount = await Student.countDocuments({
      ...query,
      status: "active",
      balance: { $gt: 0 },
    });

    // 2. New Students (added this month)
    const newStudentsCount = await Student.countDocuments({
      ...query,
      createdAt: { $gte: startOfMonth },
    });

    // 3. Upcoming Fees (Active students who haven't paid this month)
    // First, find active students
    const activeStudentsCount = await Student.countDocuments({
      ...query,
      status: "active",
    });

    // Then, find distinct students who paid this month
    const paymentsThisMonth = await Payment.distinct("studentId", {
      ...query,
      month: currentMonth,
      year: currentYear,
      status: "paid",
    });

    // Those who haven't paid are the difference (approximate)
    const upcomingFeesCount = Math.max(0, activeStudentsCount - paymentsThisMonth.length);

    const notifications = [];
    const timestamp = new Date().toISOString();

    if (dueStudentsCount > 0) {
      notifications.push({
        id: `due_students_${dueStudentsCount}`,
        type: "due",
        title: "Due Balances",
        message: `You have ${dueStudentsCount} student${dueStudentsCount > 1 ? 's' : ''} with pending fee balances.`,
        count: dueStudentsCount,
        timestamp,
      });
    }

    if (upcomingFeesCount > 0) {
      notifications.push({
        id: `upcoming_fees_${upcomingFeesCount}`,
        type: "upcoming",
        title: "Upcoming Fees",
        message: `There are ${upcomingFeesCount} upcoming fee collection${upcomingFeesCount > 1 ? 's' : ''} for this month.`,
        count: upcomingFeesCount,
        timestamp,
      });
    }

    if (newStudentsCount > 0) {
      notifications.push({
        id: `new_students_${newStudentsCount}`,
        type: "new_student",
        title: "New Enrollments",
        message: `You have ${newStudentsCount} new student${newStudentsCount > 1 ? 's' : ''} added this month.`,
        count: newStudentsCount,
        timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
