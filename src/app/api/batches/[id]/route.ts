import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/Batch";
import { BatchSchema } from "@/validations/batch.validation";
import Course from "@/models/Course";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const ownerId = getUserId(request);

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const data = BatchSchema.parse(body);

    // Check course belongs to logged-in user
    const course = await Course.findOne({
      _id: data.courseId,
      ownerId,
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    // Check duplicate batch name in same course (exclude current batch)
    const existingBatch = await Batch.findOne({
      ownerId,
      courseId: data.courseId,
      name: data.name,
      _id: { $ne: id },
    });

    if (existingBatch) {
      return NextResponse.json(
        { success: false, message: "Another batch with this name already exists in the selected course." },
        { status: 400 }
      );
    }

    const batch = await Batch.findOneAndUpdate(
      { _id: id, ownerId },
      data,
      { new: true }
    );

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Batch updated successfully.",
      data: batch,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const ownerId = getUserId(request);

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const batch = await Batch.findOneAndDelete({
      _id: id,
      ownerId,
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
