import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import { CourseSchema } from "@/validations/course.validation";

function getUserId(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as {
    id: string;
  };

  return decoded.id;
}

function getBranchId(request: NextRequest) {
  return request.cookies.get("branchId")?.value || undefined;
}

// ================= POST =================

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

    const data = CourseSchema.parse(body);

    const branchId = getBranchId(request);

    const existsQuery: any = { ownerId, name: data.name };
    if (branchId) existsQuery.branchId = branchId;

    const exists = await Course.findOne(existsQuery);

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Course already exists.",
        },
        { status: 400 }
      );
    }

    const course = await Course.create({
      ownerId,
      branchId,
      ...data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully.",
        data: course,
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

// ================= GET =================

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

    const courses = await Course.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: courses,
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