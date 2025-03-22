import { Middleware, AnyAction, MiddlewareAPI, Dispatch } from 'redux';
import { toast } from '@/hooks/use-toast';

// Interface for the toast action
interface ShowToastAction extends AnyAction {
  type: 'notification/showToast';
  payload: {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    duration?: number;
  };
}

// Type guard to check if an action is a toast action
const isShowToastAction = (action: AnyAction): action is ShowToastAction => {
  return action.type === 'notification/showToast';
};

// Define the toast middleware to show toast notifications from Redux actions
const toastMiddleware: Middleware = 
  (store: MiddlewareAPI) => 
  (next: Dispatch) => 
  (action: AnyAction) => {
    // Call the next middleware or reducer
    const result = next(action as AnyAction);

    // Check if this is a toast action
    if (isShowToastAction(action)) {
      const { message, type, title, duration } = action.payload;
      // Use the toast function from the hook (this is a singleton outside of React)
      toast({
        title: title,
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
        duration: duration || 3000,
      });
    }

  return result;
};

export default toastMiddleware;