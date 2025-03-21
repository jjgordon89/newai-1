import { useState, useEffect } from "react";
import { AccessRole } from "@/lib/security/accessControl";

interface DocumentUser {
  userId: string;
  role: AccessRole;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function useDocumentAccess(documentId: string) {
  const [users, setUsers] = useState<DocumentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<AccessRole | null>(
    null,
  );

  // Load document users
  const loadUsers = async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/access`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load document users");
      }

      setUsers(data.users);

      // Get current user from localStorage or other state management
      const currentUserId = localStorage.getItem("currentUserId");
      if (currentUserId) {
        const currentUser = data.users.find(
          (user: DocumentUser) => user.userId === currentUserId,
        );
        if (currentUser) {
          setCurrentUserRole(currentUser.role);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Grant access to a user
  const grantAccess = async (email: string, role: AccessRole) => {
    if (!documentId) return false;

    try {
      const response = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to grant access");
      }

      // Reload users
      await loadUsers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  };

  // Update a user's role
  const updateRole = async (userId: string, role: AccessRole) => {
    if (!documentId) return false;

    try {
      const response = await fetch(
        `/api/documents/${documentId}/access/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) => (user.userId === userId ? { ...user, role } : user)),
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  };

  // Revoke access
  const revokeAccess = async (userId: string) => {
    if (!documentId) return false;

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

      // Update local state
      setUsers((prev) => prev.filter((user) => user.userId !== userId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  };

  // Check if current user has a specific role
  const hasRole = (role: AccessRole): boolean => {
    if (!currentUserRole) return false;

    // Role hierarchy: OWNER > EDITOR > VIEWER > NONE
    const roleValues = {
      [AccessRole.OWNER]: 3,
      [AccessRole.EDITOR]: 2,
      [AccessRole.VIEWER]: 1,
      [AccessRole.NONE]: 0,
    };

    return roleValues[currentUserRole] >= roleValues[role];
  };

  // Load users on mount and when documentId changes
  useEffect(() => {
    if (documentId) {
      loadUsers();
    }
  }, [documentId]);

  return {
    users,
    isLoading,
    error,
    currentUserRole,
    isOwner: currentUserRole === AccessRole.OWNER,
    isEditor: hasRole(AccessRole.EDITOR),
    isViewer: hasRole(AccessRole.VIEWER),
    hasRole,
    loadUsers,
    grantAccess,
    updateRole,
    revokeAccess,
  };
}
