import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await logoutUser();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
