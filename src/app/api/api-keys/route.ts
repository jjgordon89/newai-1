import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiKeyDb } from "@/lib/db/sqlite";

// Get all API keys for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const apiKeys = await apiKeyDb.getUserApiKeys(user.id);

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("Get API keys error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Save an API key
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { service, apiKey } = body;

    if (!service || !apiKey) {
      return NextResponse.json(
        { error: "Service and API key are required" },
        { status: 400 },
      );
    }

    const result = await apiKeyDb.saveApiKey(user.id, service, apiKey);

    return NextResponse.json({ success: true, apiKey: result });
  } catch (error) {
    console.error("Save API key error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    if (!service) {
      return NextResponse.json(
        { error: "Service parameter is required" },
        { status: 400 },
      );
    }

    const success = await apiKeyDb.deleteApiKey(user.id, service);

    if (!success) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API key error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
