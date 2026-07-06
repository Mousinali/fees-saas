import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { RegisterSchema } from "@/validations/auth.validation";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validatedData = RegisterSchema.parse(body);

    const {
      fullName,
      coachingName,
      accountType,
      email,
      phone,
      password,
      branches = [],
    } = validatedData;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or phone already exists.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: "user",
      accountType,
      fullName,
      coachingName:
        accountType === "coaching_center"
          ? coachingName
          : "",
      email,
      phone,
      password: hashedPassword,
      branches: accountType === "coaching_center" ? branches.map(name => ({ name })) : [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
        data: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}