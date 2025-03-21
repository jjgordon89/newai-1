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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Download,
  Info,
} from "lucide-react";
import {
  AuditAction,
  ResourceType,
  AuditLogEntry,
} from "@/lib/security/auditLog";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<
    ResourceType | ""
  >("");
  const [resourceIdFilter, setResourceIdFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Load audit logs
  useEffect(() => {
    loadAuditLogs();
  }, [
    currentPage,
    userIdFilter,
    actionFilter,
    resourceTypeFilter,
    resourceIdFilter,
    startDate,
    endDate,
  ]);

  const loadAuditLogs = async () => {
    setIsLoading(true);

    try {
      // Build filters
      const filters: any = {};

      if (userIdFilter) filters.userId = userIdFilter;
      if (actionFilter) filters.action = actionFilter;
      if (resourceTypeFilter) filters.resourceType = resourceTypeFilter;
      if (resourceIdFilter) filters.resourceId = resourceIdFilter;
      if (startDate) filters.startTime = startDate.getTime();
      if (endDate) {
        // Set end date to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.endTime = endOfDay.getTime();
      }

      // Calculate offset
      const offset = (currentPage - 1) * logsPerPage;

      // Fetch logs from API
      const response = await fetch(
        `/api/audit-logs?limit=${logsPerPage}&offset=${offset}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filters }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load audit logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setUserIdFilter("");
    setActionFilter("");
    setResourceTypeFilter("");
    setResourceIdFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  // Export logs as CSV
  const exportLogs = () => {
    // Create CSV content
    const headers = [
      "Timestamp",
      "User ID",
      "Action",
      "Resource Type",
      "Resource ID",
      "IP Address",
      "User Agent",
      "Details",
    ];
    const csvRows = [
      headers.join(","),
      ...logs.map((log) => {
        const timestamp = new Date(log.timestamp).toISOString();
        const userId = log.userId || "";
        const action = log.action;
        const resourceType = log.resourceType;
        const resourceId = log.resourceId || "";
        const ipAddress = log.ipAddress || "";
        const userAgent = log.userAgent
          ? `"${log.userAgent.replace(/"/g, '""')}"`
          : "";
        const details = log.details
          ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
          : "";

        return [
          timestamp,
          userId,
          action,
          resourceType,
          resourceId,
          ipAddress,
          userAgent,
          details,
        ].join(",");
      }),
    ];

    // Create and download CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get action badge color
  const getActionBadgeColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return "bg-green-100 text-green-800";
      case AuditAction.READ:
        return "bg-blue-100 text-blue-800";
      case AuditAction.UPDATE:
        return "bg-yellow-100 text-yellow-800";
      case AuditAction.DELETE:
        return "bg-red-100 text-red-800";
      case AuditAction.LOGIN:
      case AuditAction.LOGOUT:
      case AuditAction.REGISTER:
        return "bg-purple-100 text-purple-800";
      case AuditAction.GRANT_ACCESS:
      case AuditAction.REVOKE_ACCESS:
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                View and filter security audit logs
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={loadAuditLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  placeholder="Filter by user ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={actionFilter}
                  onValueChange={(value) =>
                    setActionFilter(value as AuditAction)
                  }
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    {Object.values(AuditAction).map((action) => (
                      <SelectItem key={action} value={action}>
                        {action
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type</Label>
                <Select
                  value={resourceTypeFilter}
                  onValueChange={(value) =>
                    setResourceTypeFilter(value as ResourceType)
                  }
                >
                  <SelectTrigger id="resource-type">
                    <SelectValue placeholder="All resource types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All resource types</SelectItem>
                    {Object.values(ResourceType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-id">Resource ID</Label>
                <Input
                  id="resource-id"
                  value={resourceIdFilter}
                  onChange={(e) => setResourceIdFilter(e.target.value)}
                  placeholder="Filter by resource ID"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No audit logs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.userId || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {log.resourceType.replace(/_/g, " ").toLowerCase()}
                          </div>
                          {log.resourceId && (
                            <div className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                              {log.resourceId}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell>
                        {log.details ? (
                          <Button variant="ghost" size="sm">
                            <Info className="h-4 w-4" />
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>
            {!isLoading && logs.length > 0 && (
              <span>
                Showing {(currentPage - 1) * logsPerPage + 1} to{" "}
                {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs}{" "}
                logs
              </span>
            )}
          </div>
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
        </CardFooter>
      </Card>
    </div>
  );
}
