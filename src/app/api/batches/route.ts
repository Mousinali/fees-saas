import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/Batch";
import Course from "@/models/Course";
import { BatchSchema } from "@/validations/batch.validation";

function getUserId(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
    };

    return decoded.id;
  } catch {
    return null;
  }
}

function getBranchId(request: NextRequest) {
  return request.cookies.get("branchId")?.value || undefined;
}

// ====================== POST ======================

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const ownerId = getUserId(request);

    if (!ownerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const data = BatchSchema.parse(body);

    // Check course belongs to logged-in user
    const course = await Course.findOne({
      _id: data.courseId,
      ownerId,
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found.",
        },
        { status: 404 }
      );
    }

    const branchId = getBranchId(request);

    const existsQuery: any = {
      ownerId,
      courseId: data.courseId,
      name: data.name,
    };
    if (branchId) existsQuery.branchId = branchId;

    const exists = await Batch.findOne(existsQuery);

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Batch already exists for this course.",
        },
        { status: 400 }
      );
    }

    const batch = await Batch.create({
      ownerId,
      branchId,
      ...data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Batch created successfully.",
        data: batch,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ====================== GET ======================

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const ownerId = getUserId(request);

    if (!ownerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const branchId = getBranchId(request);

    const query: any = { ownerId };
    if (branchId) query.branchId = branchId;

    const batches = await Batch.find(query)
      .populate("courseId", "name")
      .sort({
        createdAt: -1,
      });

    return NextResponse.json({
      success: true,
      data: batches,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}