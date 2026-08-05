import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Toggle the block status (isBlocked)
    // If isBlocked is true, user is inactive. If false, active.
    user.isBlocked = !user.isBlocked;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${user.isBlocked ? "deactivated" : "activated"} successfully.`,
      isBlocked: user.isBlocked,
    });
  } catch (error: any) {
    console.error("Failed to toggle user status:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
