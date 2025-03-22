import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAuditLogs, clearAuditLogs } from '@/redux/slices/securitySlice';
import { AuditAction, ResourceType } from '@/lib/security/auditLog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Loader2, 
  Trash, 
  Filter, 
  Calendar, 
  User, 
  FileText,
  Shield
} from 'lucide-react';

// Map for action display names
const ActionLabels: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Create',
  [AuditAction.READ]: 'Read',
  [AuditAction.UPDATE]: 'Update',
  [AuditAction.DELETE]: 'Delete',
  [AuditAction.LOGIN]: 'Login',
  [AuditAction.LOGOUT]: 'Logout',
  [AuditAction.REGISTER]: 'Register',
  [AuditAction.GRANT_ACCESS]: 'Grant Access',
  [AuditAction.REVOKE_ACCESS]: 'Revoke Access',
  [AuditAction.EXPORT]: 'Export',
  [AuditAction.IMPORT]: 'Import',
  [AuditAction.API_KEY_CREATE]: 'API Key Create',
  [AuditAction.API_KEY_DELETE]: 'API Key Delete',
  [AuditAction.API_KEY_USE]: 'API Key Use',
};

// Map for resource type display names
const ResourceLabels: Record<ResourceType, string> = {
  [ResourceType.USER]: 'User',
  [ResourceType.DOCUMENT]: 'Document',
  [ResourceType.API_KEY]: 'API Key',
  [ResourceType.KNOWLEDGE_BASE]: 'Knowledge Base',
  [ResourceType.SYSTEM]: 'System',
};

// Badge colors for different actions
const ActionBadgeVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  [AuditAction.CREATE]: "default",
  [AuditAction.READ]: "outline",
  [AuditAction.UPDATE]: "secondary",
  [AuditAction.DELETE]: "destructive",
  [AuditAction.LOGIN]: "secondary",
  [AuditAction.LOGOUT]: "outline",
  [AuditAction.REGISTER]: "default",
  [AuditAction.GRANT_ACCESS]: "default",
  [AuditAction.REVOKE_ACCESS]: "destructive",
  [AuditAction.EXPORT]: "outline",
  [AuditAction.IMPORT]: "secondary",
  [AuditAction.API_KEY_CREATE]: "default",
  [AuditAction.API_KEY_DELETE]: "destructive",
  [AuditAction.API_KEY_USE]: "outline",
};

export function AuditLogViewer() {
  const dispatch = useAppDispatch();
  const { logs, totalCount, isLoading, error } = useAppSelector(state => state.security.auditLog);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState<{
    userId?: string;
    action?: AuditAction;
    resourceType?: ResourceType;
    resourceId?: string;
    startTime?: number;
    endTime?: number;
  }>({});
  
  const [showFilters, setShowFilters] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(30);
  
  // Load logs on mount and when filters or pagination changes
  useEffect(() => {
    const offset = (page - 1) * limit;
    dispatch(getAuditLogs({ filters, limit, offset }));
  }, [dispatch, page, limit, filters]);
  
  // Handle filter changes
  const handleFilterChange = (field: string, value: string | undefined) => {
    if (field === 'action') {
      setFilters(prev => ({ ...prev, action: value as AuditAction | undefined }));
    } else if (field === 'resourceType') {
      setFilters(prev => ({ ...prev, resourceType: value as ResourceType | undefined }));
    } else if (field === 'userId') {
      setFilters(prev => ({ ...prev, userId: value }));
    } else if (field === 'resourceId') {
      setFilters(prev => ({ ...prev, resourceId: value }));
    }
  };
  
  // Handle date filter changes
  const handleDateFilterChange = (field: 'startTime' | 'endTime', dateString: string) => {
    if (!dateString) {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[field];
        return newFilters;
      });
      return;
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      setFilters(prev => ({ ...prev, [field]: date.getTime() }));
    }
  };
  
  // Handle clear logs
  const handleClearLogs = () => {
    // Calculate timestamp for retention period
    const olderThan = retentionDays > 0 
      ? Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
      : undefined;
    
    dispatch(clearAuditLogs(olderThan));
    setClearConfirmOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              View and filter security audit logs
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Audit Logs</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the audit logs
                    based on the specified retention period.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="retentionDays">Retention Period (days):</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      value={retentionDays.toString()}
                      onChange={(e) => setRetentionDays(parseInt(e.target.value) || 0)}
                      min="0"
                      max="365"
                      className="w-24"
                    />
                    <p className="text-sm text-muted-foreground">
                      {retentionDays === 0 ? 'Clear all logs' : `Delete logs older than ${retentionDays} days`}
                    </p>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleClearLogs}
                  >
                    Clear Logs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 border rounded-md bg-muted/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Action</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange('action', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>All actions</SelectItem>
                    {Object.entries(ActionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Resource Type</Label>
                <Select
                  value={filters.resourceType}
                  onValueChange={(value) => handleFilterChange('resourceType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>All resource types</SelectItem>
                    {Object.entries(ResourceLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">User ID</Label>
                <Input
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                  placeholder="Filter by user ID"
                />
              </div>
              
              <div>
                <Label className="text-xs">Resource ID</Label>
                <Input
                  value={filters.resourceId || ''}
                  onChange={(e) => handleFilterChange('resourceId', e.target.value || undefined)}
                  placeholder="Filter by resource ID"
                />
              </div>
              
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => handleDateFilterChange('startTime', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="text-xs">End Date</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => handleDateFilterChange('endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Shield className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No audit logs found</p>
            {Object.keys(filters).length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ActionBadgeVariants[log.action]}>
                        {ActionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {log.resourceType === ResourceType.USER && <User className="h-3 w-3 mr-1" />}
                        {log.resourceType === ResourceType.DOCUMENT && <FileText className="h-3 w-3 mr-1" />}
                        {log.resourceType === ResourceType.SYSTEM && <Shield className="h-3 w-3 mr-1" />}
                        {ResourceLabels[log.resourceType] || log.resourceType}
                        {log.resourceId && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({log.resourceId.substring(0, 8)}...)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.userId || <span className="text-muted-foreground italic">System</span>}
                    </TableCell>
                    <TableCell>
                      {log.details ? (
                        <div className="text-xs max-w-xs truncate" title={log.details}>
                          {log.details}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No details</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && logs.length > 0 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(pageNumber)}
                        isActive={page === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <span className="px-1">...</span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setPage(totalPages)}
                        isActive={page === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between px-6 py-4 border-t">
        <div>
          <p className="text-xs text-muted-foreground">
            Showing {logs.length} of {totalCount} logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs" htmlFor="limit">Rows per page:</Label>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(parseInt(value))}
          >
            <SelectTrigger id="limit" className="w-[70px] h-8">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
}
