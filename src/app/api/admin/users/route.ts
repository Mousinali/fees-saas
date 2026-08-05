import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.aggregate([
      { $match: { role: "user" } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "ownerId",
          as: "studentsList",
        },
      },
      {
        $lookup: {
          from: "batches",
          localField: "_id",
          foreignField: "ownerId",
          as: "batchesList",
        },
      },
      {
        $addFields: {
          totalStudents: { $size: "$studentsList" },
          totalBatches: { $size: "$batchesList" },
          totalBranches: { $size: { $ifNull: ["$branches", []] } },
        },
      },
      {
        $project: {
          password: 0,
          studentsList: 0,
          batchesList: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin users:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { fullName, email, phone, password, accountType, coachingName, branches = [] } = body;

    if (!fullName || !email || !phone || !password || !accountType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email or phone already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      accountType,
      coachingName: accountType === "coaching_center" ? coachingName : "",
      role: "user",
      isVerified: true,
      branches: accountType === "coaching_center" ? branches.map((name: string) => ({ name })) : [],
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully.",
      data: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error: any) {
    console.error("Failed to create user from admin:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
