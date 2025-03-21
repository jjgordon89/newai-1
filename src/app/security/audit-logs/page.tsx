import React from "react";
import AuditLogViewer from "@/components/security/AuditLogViewer";

export default function AuditLogsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Security Audit Logs</h1>
      <AuditLogViewer />
    </div>
  );
}
