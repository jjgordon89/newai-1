import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, getAuditLogsCount } from "@/lib/security/auditLog";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { filters } = body;

    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get logs and total count
    const logs = getAuditLogs(filters, limit, offset);
    const total = getAuditLogsCount(filters);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("Error getting audit logs:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
