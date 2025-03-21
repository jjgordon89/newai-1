import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  hasAccess,
  AccessRole,
  revokeAccess,
  grantAccess,
} from "@/lib/security/accessControl";
import {
  logAuditEvent,
  AuditAction,
  ResourceType,
} from "@/lib/security/auditLog";

// Update a user's access role
export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string; userId: string } },
) {
  try {
    const { documentId, userId } = params;

    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is the owner of the document
    if (!hasAccess(documentId, user.id, AccessRole.OWNER)) {
      return NextResponse.json(
        { error: "Only the owner can update access roles" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Update role
    const success = grantAccess(documentId, userId, role as AccessRole);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update role" },
        { status: 500 },
      );
    }

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: { action: "update_access_role", targetUserId: userId, role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating access role:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Revoke access
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string; userId: string } },
) {
  try {
    const { documentId, userId } = params;

    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is the owner of the document
    if (!hasAccess(documentId, user.id, AccessRole.OWNER)) {
      return NextResponse.json(
        { error: "Only the owner can revoke access" },
        { status: 403 },
      );
    }

    // Prevent revoking own access if owner
    if (userId === user.id) {
      return NextResponse.json(
        { error: "You cannot revoke your own access as the owner" },
        { status: 400 },
      );
    }

    // Revoke access
    const success = revokeAccess(documentId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to revoke access" },
        { status: 500 },
      );
    }

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: AuditAction.REVOKE_ACCESS,
      resourceType: ResourceType.DOCUMENT,
      resourceId: documentId,
      details: { targetUserId: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking access:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
