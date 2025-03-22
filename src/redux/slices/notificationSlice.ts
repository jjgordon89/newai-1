import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: NotificationType;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Notification state interface
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create a notification
export const addNotification = createAsyncThunk(
  'notification/add',
  async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, { rejectWithValue }) => {
    try {
      // In a real app, you might send this to an API
      // For now, we'll just return the notification with additional fields
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: Date.now(),
        read: false
      };
      
      return newNotification;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add notification');
    }
  }
);

// Mark a notification as read
export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
    }
  }
);

// Remove a notification
export const removeNotification = createAsyncThunk(
  'notification/remove',
  async (id: string, { rejectWithValue }) => {
    try {
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove notification');
    }
  }
);

// Clear all notifications
export const clearNotifications = createAsyncThunk(
  'notification/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear notifications');
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // For direct update of the notification state (useful for tests and quick updates)
    addNotificationDirect: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: generateId(),
        timestamp: Date.now(),
        read: false
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    
    // Show a toast notification (doesn't add to the notification center)
    showToast: (state, action: PayloadAction<{
      message: string;
      type: NotificationType;
      title?: string;
      duration?: number;
    }>) => {
      // This action doesn't modify state - it's handled by middleware
      // The middleware will use the toast service to show a toast notification
    },
    
    // Reset notification errors
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Add notification
    builder
      .addCase(addNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      })
      .addCase(addNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Mark notification as read
    builder
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Mark all as read
    builder
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Remove notification
    builder
      .addCase(removeNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.notifications.findIndex(n => n.id === action.payload);
        
        if (index !== -1) {
          // Decrement unread count if notification was unread
          if (!state.notifications[index].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          
          // Remove the notification
          state.notifications.splice(index, 1);
        }
      })
      .addCase(removeNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Clear all notifications
    builder
      .addCase(clearNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearNotifications.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(clearNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addNotificationDirect, 
  showToast,
  resetError 
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Sample notifications for development and testing
export const SAMPLE_NOTIFICATIONS: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  {
    title: 'Workflow Deployed',
    message: 'Your "Document Processing" workflow has been successfully deployed.',
    type: 'success',
    action: {
      label: 'View Workflow',
      href: '/workflow-builder'
    }
  },
  {
    title: 'API Key Expired',
    message: 'Your Google API key will expire in 3 days. Please renew it to avoid service interruption.',
    type: 'warning',
    action: {
      label: 'Renew Key',
      href: '/profile?tab=keys'
    }
  },
  {
    title: 'Document Processed',
    message: 'All 5 uploaded documents have been successfully processed and indexed.',
    type: 'info',
    action: {
      label: 'View Documents',
      href: '/documents'
    }
  },
  {
    title: 'Fine-Tuning Complete',
    message: 'Your model "Custom-Mistral-1" has completed fine-tuning and is ready to use.',
    type: 'success',
    action: {
      label: 'Try Model',
      href: '/fine-tuning'
    }
  },
  {
    title: 'System Update',
    message: 'A new system update is available with improved RAG capabilities.',
    type: 'info'
  }
];