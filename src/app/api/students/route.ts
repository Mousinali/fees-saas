import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { StudentSchema } from "@/validations/student.validation";
import Course from "@/models/Course";
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

    const body = await request.json();
    const data = StudentSchema.parse(body);

    const branchId = getBranchId(request);

    // Verify course belongs to owner and branch
    const courseQuery: any = { _id: data.courseId, ownerId };
    if (branchId) courseQuery.branchId = branchId;
    
    const course = await Course.findOne(courseQuery);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    // Verify batch belongs to owner, course, and branch
    const batchQuery: any = { _id: data.batchId, courseId: data.courseId, ownerId };
    if (branchId) batchQuery.branchId = branchId;
    
    const batch = await Batch.findOne(batchQuery);
    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found for this course." },
        { status: 404 }
      );
    }

    const student = await Student.create({
      ownerId,
      branchId,
      ...data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student added successfully.",
        data: student,
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

    const search = request.nextUrl.searchParams.get("search");
    if (search) {
      query.fullName = { $regex: search, $options: "i" };
    }

    const courseId = request.nextUrl.searchParams.get("courseId");
    if (courseId) {
      query.courseId = courseId;
    }

    const status = request.nextUrl.searchParams.get("status");
    if (status) {
      query.status = status;
    }

    const limitStr = request.nextUrl.searchParams.get("limit") || "5";
    const limit = parseInt(limitStr, 10);
    const pageStr = request.nextUrl.searchParams.get("page") || "1";
    const page = parseInt(pageStr, 10);
    const skip = (page - 1) * limit;

    const students = await Student.find(query)
      .populate("courseId", "name defaultFee isEmiAvailable emiType emiDuration")
      .populate("batchId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
