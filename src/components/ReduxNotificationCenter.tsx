import React, { useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BellIcon, Settings, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { markAsRead, markAllAsRead, removeNotification, addNotification, SAMPLE_NOTIFICATIONS } from '@/redux/slices/notificationSlice';

export function ReduxNotificationCenter() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('all');
  
  // For demo purposes, add sample notifications if there are none
  useEffect(() => {
    if (notifications.length === 0) {
      SAMPLE_NOTIFICATIONS.forEach(notification => {
        dispatch(addNotification(notification));
      });
    }
  }, [dispatch, notifications.length]);
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };
  
  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 p-1 m-2 h-8">
            <TabsTrigger value="all" className="text-xs h-6">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs h-6">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-1 bg-primary text-[10px] px-1 min-w-[18px] h-[18px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="success" className="text-xs h-6">Success</TabsTrigger>
            <TabsTrigger value="warning" className="text-xs h-6">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="m-0 p-0">
            <ScrollArea className="h-[300px]">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "px-4 py-3 flex gap-3",
                        !notification.read && "bg-muted/50"
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 -mr-1 opacity-50 hover:opacity-100 mt-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {notification.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs font-medium px-2 py-1"
                              asChild
                            >
                              <a href={notification.action.href}>
                                {notification.action.label}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="bg-muted rounded-full p-3 mb-3">
                    <BellIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-medium">No notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeTab === 'all' 
                      ? "You're all caught up!" 
                      : `No ${activeTab} notifications to display`}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-center py-2 px-4 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            <a href="/profile?tab=notifications">
              <Settings className="h-3 w-3 mr-1" />
              Notification Settings
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to format timestamps as relative time
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}