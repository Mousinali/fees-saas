import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      coachingName,
      profileImage,
      password,
      invoiceSettings,
    } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if email or phone is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email is already registered" },
          { status: 400 }
        );
      }
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: "Phone is already registered" },
          { status: 400 }
        );
      }
      user.phone = phone;
    }

    if (fullName) user.fullName = fullName;
    if (coachingName !== undefined) user.coachingName = coachingName;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (invoiceSettings) user.invoiceSettings = invoiceSettings;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password").lean();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
