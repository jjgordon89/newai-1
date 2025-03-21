import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  UserPlus,
  Trash,
  Check,
  Shield,
  Users,
} from "lucide-react";
import { AccessRole } from "@/lib/security/accessControl";

interface User {
  id: string;
  username: string;
  email: string;
}

interface DocumentUser {
  userId: string;
  role: AccessRole;
  user?: User; // User details if available
}

interface DocumentAccessControlProps {
  documentId: string;
  documentName: string;
  currentUserId: string;
  isOwner: boolean;
}

export default function DocumentAccessControl({
  documentId,
  documentName,
  currentUserId,
  isOwner,
}: DocumentAccessControlProps) {
  const [documentUsers, setDocumentUsers] = useState<DocumentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AccessRole>(AccessRole.VIEWER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load document users on component mount
  useEffect(() => {
    loadDocumentUsers();
  }, [documentId]);

  // Load document users
  const loadDocumentUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/access`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load document users");
      }

      setDocumentUsers(data.users);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while loading document users",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Grant access to a new user
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!newUserEmail.trim()) {
        throw new Error("Email is required");
      }

      const response = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newUserEmail, role: newUserRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to grant access");
      }

      setSuccess(`Access granted to ${newUserEmail}`);
      setNewUserEmail("");
      setNewUserRole(AccessRole.VIEWER);

      // Reload document users
      await loadDocumentUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while granting access",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update a user's role
  const handleUpdateRole = async (userId: string, newRole: AccessRole) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/documents/${documentId}/access/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setSuccess("Role updated successfully");

      // Update local state
      setDocumentUsers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating role",
      );
    }
  };

  // Revoke access
  const handleRevokeAccess = async (userId: string) => {
    // Don't allow revoking own access if owner
    if (userId === currentUserId && isOwner) {
      setError("You cannot revoke your own access as the owner");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/documents/${documentId}/access/${userId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke access");
      }

      setSuccess("Access revoked successfully");

      // Update local state
      setDocumentUsers((prev) => prev.filter((user) => user.userId !== userId));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while revoking access",
      );
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: AccessRole) => {
    switch (role) {
      case AccessRole.OWNER:
        return "bg-purple-100 text-purple-800";
      case AccessRole.EDITOR:
        return "bg-blue-100 text-blue-800";
      case AccessRole.VIEWER:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format role name
  const formatRoleName = (role: AccessRole) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Access Control</CardTitle>
        </div>
        <CardDescription>
          Manage who can access "{documentName}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Users with access */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              Users with Access
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documentUsers.length === 0 ? (
              <div className="text-center py-4 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  No users have access yet
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    {isOwner && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentUsers.map((docUser) => (
                    <TableRow key={docUser.userId}>
                      <TableCell>
                        <div>
                          {docUser.user ? (
                            <>
                              <div className="font-medium">
                                {docUser.user.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {docUser.user.email}
                              </div>
                            </>
                          ) : (
                            <div className="font-mono text-sm">
                              {docUser.userId}
                            </div>
                          )}
                          {docUser.userId === currentUserId && (
                            <Badge variant="outline" className="mt-1">
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOwner && docUser.userId !== currentUserId ? (
                          <Select
                            value={docUser.role}
                            onValueChange={(value) =>
                              handleUpdateRole(
                                docUser.userId,
                                value as AccessRole,
                              )
                            }
                            disabled={!isOwner}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AccessRole.OWNER}>
                                {formatRoleName(AccessRole.OWNER)}
                              </SelectItem>
                              <SelectItem value={AccessRole.EDITOR}>
                                {formatRoleName(AccessRole.EDITOR)}
                              </SelectItem>
                              <SelectItem value={AccessRole.VIEWER}>
                                {formatRoleName(AccessRole.VIEWER)}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getRoleBadgeColor(docUser.role)}>
                            {formatRoleName(docUser.role)}
                          </Badge>
                        )}
                      </TableCell>
                      {isOwner && (
                        <TableCell className="text-right">
                          {docUser.userId !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeAccess(docUser.userId)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Grant access form */}
          {isOwner && (
            <div>
              <h3 className="text-lg font-medium mb-4">Grant Access</h3>

              <form onSubmit={handleGrantAccess} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="Enter user email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUserRole}
                      onValueChange={(value) =>
                        setNewUserRole(value as AccessRole)
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AccessRole.OWNER}>
                          {formatRoleName(AccessRole.OWNER)}
                        </SelectItem>
                        <SelectItem value={AccessRole.EDITOR}>
                          {formatRoleName(AccessRole.EDITOR)}
                        </SelectItem>
                        <SelectItem value={AccessRole.VIEWER}>
                          {formatRoleName(AccessRole.VIEWER)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !newUserEmail.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Grant Access
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
