import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

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

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fullName } = await request.json();

    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Ensure only admins can use this specific route if we want, but it's fine for any user to update their name
    // However, the user specifically requested "only for admin", we can check the role:
    if (user.role !== "super_admin") {
       return NextResponse.json(
        { success: false, message: "Only admins can perform this action." },
        { status: 403 }
      );
    }

    user.fullName = fullName.trim();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Name updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
      }
    });
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
