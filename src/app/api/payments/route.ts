import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import Batch from "@/models/Batch";

function getUserId(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    return decoded.id;
  } catch {
    return null;
  }
}

function getBranchId(request: NextRequest) {
  return request.cookies.get("branchId")?.value || undefined;
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const {
      studentId,
      batchId,
      amount,
      discount = 0,
      fine = 0,
      paymentMethod = "cash",
      feeOption,
      isAdvance = false,
      message,
      expectedFee,
      monthlyFee,
      month,
      year,
    } = body;

    if (!studentId || !batchId || !amount || !feeOption) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique receipt number based on the highest existing receipt number
    const lastPayment = await Payment.findOne({ ownerId }).sort({ createdAt: -1 });
    let nextCount = 1;
    if (lastPayment && lastPayment.receiptNumber) {
      const parts = lastPayment.receiptNumber.split("-");
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNumber)) {
        nextCount = lastNumber + 1;
      } else {
        const count = await Payment.countDocuments({ ownerId });
        nextCount = count + 1;
      }
    } else {
      const count = await Payment.countDocuments({ ownerId });
      nextCount = count + 1;
    }
    
    const prefix = ownerId.toString().substring(ownerId.toString().length - 4).toUpperCase();
    const receiptNumber = `RCPT-${prefix}-${new Date().getFullYear()}-${nextCount
      .toString()
      .padStart(5, "0")}`;

    const date = new Date();

    const expected = expectedFee !== undefined ? Number(expectedFee) : Number(amount);
    const capPerMonth = monthlyFee !== undefined ? Number(monthlyFee) : expected;
    
    const student = await Student.findById(studentId);
    let pastDue = 0;
    if (student && student.balance < 0) {
      pastDue = Math.abs(student.balance);
    }
    
    let remainingAmount = Number(amount);
    let currentMonth = month ? parseInt(month) : date.getMonth() + 1;
    let currentYear = year ? parseInt(year) : date.getFullYear();
    
    let firstPaymentAmount = capPerMonth;
    if (pastDue > 0) {
      firstPaymentAmount += pastDue;
    }
    
    let mainPayment;
    
    if (remainingAmount <= firstPaymentAmount || capPerMonth <= 0) {
      mainPayment = await Payment.create({
        ownerId,
        branchId,
        studentId,
        batchId,
        amount: remainingAmount,
        discount,
        fine,
        paymentMethod,
        feeOption,
        isAdvance,
        message,
        month: currentMonth,
        year: currentYear,
        receiptNumber,
        paymentDate: date,
      });
    } else {
      mainPayment = await Payment.create({
        ownerId,
        branchId,
        studentId,
        batchId,
        amount: firstPaymentAmount,
        discount,
        fine,
        paymentMethod,
        feeOption,
        isAdvance,
        message,
        month: currentMonth,
        year: currentYear,
        receiptNumber,
        paymentDate: date,
      });
      
      remainingAmount -= firstPaymentAmount;
      
      while (remainingAmount > 0) {
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
        
        let paymentAmount = Math.min(remainingAmount, capPerMonth);
        
        nextCount++;
        const nextReceiptNumber = `RCPT-${prefix}-${new Date().getFullYear()}-${nextCount.toString().padStart(5, "0")}`;
        
        await Payment.create({
          ownerId,
          branchId,
          studentId,
          batchId,
          amount: paymentAmount,
          discount: 0,
          fine: 0,
          paymentMethod,
          feeOption,
          isAdvance: true,
          message: message ? `${message} (Advance)` : "Advance payment",
          month: currentMonth,
          year: currentYear,
          receiptNumber: nextReceiptNumber,
          paymentDate: date,
        });
        
        remainingAmount -= paymentAmount;
      }
    }

    const difference = Number(amount) - expected;
    if (difference !== 0) {
      await Student.findByIdAndUpdate(studentId, { $inc: { balance: difference } });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment collected successfully.",
        data: mainPayment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
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

    const studentId = request.nextUrl.searchParams.get("studentId");
    if (studentId) query.studentId = studentId;

    const limitStr = request.nextUrl.searchParams.get("limit") || "5";
    const limit = parseInt(limitStr, 10);
    const pageStr = request.nextUrl.searchParams.get("page") || "1";
    const page = parseInt(pageStr, 10);
    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate("studentId", "fullName phone photo")
      .populate("batchId", "name")
      .populate("ownerId", "invoiceSettings coachingName profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
