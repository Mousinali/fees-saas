import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";

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

    const now = dayjs();
    
    // 1. Total Active Students
    const totalStudents = await Student.countDocuments({ ...query, status: "active" });

    // 2. Total Active Batches
    const totalBatches = await Batch.countDocuments({ ...query, status: "active" });

    // 3. Pending Fees
    const activeStudents = await Student.find({ ...query, status: "active" });
    const pendingFees = activeStudents.reduce((acc, curr) => acc + (curr.balance || 0), 0);

    // 4. Collections
    const allPayments = await Payment.find(query);
    
    const todaysCollection = allPayments
      .filter(p => dayjs(p.paymentDate).isSame(now, 'day'))
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const thisMonthsCollection = allPayments
      .filter(p => dayjs(p.paymentDate).isSame(now, 'month'))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalCollected = allPayments.reduce((acc, curr) => acc + curr.amount, 0);
    
    // 5. Collection %
    let collectionPercentage = 0;
    const totalExpected = totalCollected + pendingFees;
    if (totalExpected > 0) {
      collectionPercentage = Math.round((totalCollected / totalExpected) * 100);
    }

    // 6. Trend Data (Last 30 Days)
    const thirtyDaysAgo = now.subtract(30, 'day');
    const recentPayments = allPayments.filter(p => dayjs(p.paymentDate).isAfter(thirtyDaysAgo));
    
    const chartDataMap = new Map<string, number>();
    
    // Initialize last 30 days with 0
    for(let i = 0; i < 30; i++) {
        const d = thirtyDaysAgo.add(i + 1, 'day').format('DD MMM');
        chartDataMap.set(d, 0);
    }

    recentPayments.forEach(p => {
        const dateKey = dayjs(p.paymentDate).format('DD MMM');
        if (chartDataMap.has(dateKey)) {
            chartDataMap.set(dateKey, chartDataMap.get(dateKey)! + p.amount);
        }
    });

    const chartData = Array.from(chartDataMap, ([name, value]) => ({ name, value }));
    
    // 7. Last 30 Days Collection for percentage change
    const previousThirtyDaysAgo = thirtyDaysAgo.subtract(30, 'day');
    const last30DaysCollection = recentPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const previous30DaysCollection = allPayments
        .filter(p => dayjs(p.paymentDate).isAfter(previousThirtyDaysAgo) && dayjs(p.paymentDate).isBefore(thirtyDaysAgo))
        .reduce((acc, curr) => acc + curr.amount, 0);
        
    let percentageChange = 0;
    if (previous30DaysCollection > 0) {
        percentageChange = Math.round(((last30DaysCollection - previous30DaysCollection) / previous30DaysCollection) * 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        todaysCollection,
        thisMonthsCollection,
        totalStudents,
        totalBatches,
        pendingFees,
        collectionPercentage,
        chartData,
        last30DaysCollection,
        percentageChange
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
