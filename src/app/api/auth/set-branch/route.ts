import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { branchId } = await request.json();

    const response = NextResponse.json({
      success: true,
      message: "Branch selected successfully.",
    });

    if (branchId) {
      response.cookies.set("branchId", branchId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
