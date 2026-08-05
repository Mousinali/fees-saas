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

export async function GET(
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
    const student = await Student.findOne({ _id: id, ownerId })
      .populate("courseId", "name defaultFee isEmiAvailable emiType emiDuration")
      .populate("batchId", "name");

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
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
    
    // Partial update validation
    const data = StudentSchema.partial().parse(body);

    if (data.courseId) {
      const course = await Course.findOne({ _id: data.courseId, ownerId });
      if (!course) {
        return NextResponse.json(
          { success: false, message: "Course not found." },
          { status: 404 }
        );
      }
    }

    if (data.batchId && data.courseId) {
      const batch = await Batch.findOne({ _id: data.batchId, courseId: data.courseId, ownerId });
      if (!batch) {
        return NextResponse.json(
          { success: false, message: "Batch not found for this course." },
          { status: 404 }
        );
      }
    }

    const student = await Student.findOneAndUpdate(
      { _id: id, ownerId },
      data,
      { new: true }
    );

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student updated successfully.",
      data: student,
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

    const student = await Student.findOneAndDelete({ _id: id, ownerId });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
