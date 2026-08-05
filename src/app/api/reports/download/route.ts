import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Student from "@/models/Student";
import Batch from "@/models/Batch";

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
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const branchId = getBranchId(request);
    const query: any = { ownerId };
    if (branchId) query.branchId = branchId;

    // Fetch payments
    const payments = await Payment.find(query)
      .populate("studentId", "fullName phone")
      .populate("batchId", "name")
      .sort({ createdAt: -1 });

    // Format data for excel
    const excelData = payments.map((payment: any) => ({
      "Receipt No": payment.receiptNumber || "-",
      "Date": dayjs(payment.paymentDate).format("DD MMM YYYY"),
      "Student Name": payment.studentId?.fullName || "Unknown",
      "Phone": payment.studentId?.phone || "-",
      "Batch": payment.batchId?.name || "-",
      "Amount (₹)": payment.amount,
      "Method": payment.paymentMethod?.replace("_", " ") || "-",
      "Status": payment.status || "completed"
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments Report");

    // Fix column widths
    worksheet["!cols"] = [
      { wch: 15 }, // Receipt No
      { wch: 15 }, // Date
      { wch: 25 }, // Student Name
      { wch: 15 }, // Phone
      { wch: 15 }, // Batch
      { wch: 12 }, // Amount
      { wch: 15 }, // Method
      { wch: 12 }  // Status
    ];

    // Generate buffer
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Payments_Report_${dayjs().format("YYYY_MM_DD")}.xlsx`;

    // Return the excel file
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    console.error("Excel Generation Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
