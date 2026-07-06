import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been blocked.",
        },
        { status: 403 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        accountType: user.accountType,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    user.lastLogin = new Date();
    await user.save();

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        accountType: user.accountType,
        branches: user.branches || [],
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}