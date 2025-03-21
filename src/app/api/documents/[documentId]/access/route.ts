import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  grantAccess,
  getDocumentUsers,
  hasAccess,
  AccessRole,
} from "@/lib/security/accessControl";
import {
  logAuditEvent,
  AuditAction,
  ResourceType,
} from "@/lib/security/auditLog";
import { userDb } from "@/lib/db/sqlite";

// Get users with access to a document
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    const documentId = params.documentId;

    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user has access to the document
    if (!hasAccess(documentId, user.id, AccessRole.VIEWER)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get users with access
    const documentUsers = getDocumentUsers(documentId);

    // Fetch user details for each user ID
    const usersWithDetails = await Promise.all(
      documentUsers.map(async (docUser) => {
        const userDetails = userDb.getUserById(docUser.userId);
        return {
          ...docUser,
          user: userDetails
            ? {
                id: userDetails.id,
                username: userDetails.username,
                email: userDetails.email,
              }
            : undefined,
        };
      }),
    );

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: AuditAction.READ,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: { action: "view_access_control" },
    });

    return NextResponse.json({ users: usersWithDetails });
  } catch (error) {
    console.error("Error getting document users:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Grant access to a document
export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  try {
    const documentId = params.documentId;

    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is the owner of the document
    if (!hasAccess(documentId, user.id, AccessRole.OWNER)) {
      return NextResponse.json(
        { error: "Only the owner can grant access" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const targetUser = userDb.getUserByEmail(email);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Grant access
    const success = grantAccess(documentId, targetUser.id, role as AccessRole);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to grant access" },
        { status: 500 },
      );
    }

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: AuditAction.GRANT_ACCESS,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: { targetUserId: targetUser.id, role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error granting access:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
