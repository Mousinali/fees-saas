import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if super admin already exists
    const adminExists = await User.findOne({ role: "super_admin" });

    if (adminExists) {
      return NextResponse.json(
        { success: false, message: "Super admin already exists." },
        { status: 400 }
      );
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash("1234", 10);
    const superAdmin = await User.create({
      fullName: "Super Admin",
      email: "admin@example.com",
      phone: "0000000000",
      password: hashedPassword,
      role: "super_admin",
      accountType: "teacher", // Not strictly relevant for admin, but required by schema
      isVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: "Super admin created successfully.",
      user: {
        id: superAdmin._id,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error: any) {
    console.error("Failed to seed admin:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
