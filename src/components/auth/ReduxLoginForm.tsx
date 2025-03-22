import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login, clearAuthError, clearSuccessMessage } from "@/redux/slices/authSlice";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ReduxLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { user, isAuthenticated, isLoading, error, successMessage } = useAppSelector(
    (state) => state.auth
  );
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localSuccessMessage, setLocalSuccessMessage] = useState<string | null>(null);

  // Check for registration success message in URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("registered") === "true") {
      setLocalSuccessMessage("Registration successful! You can now log in.");
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User is authenticated, redirecting to home", {
        isAuthenticated,
        user,
      });
      // Force navigation with a slight delay to ensure state is fully updated
      setTimeout(() => navigate("/", { replace: true }), 100);
    }
  }, [isAuthenticated, user, navigate]);

  // Clear success message when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(clearAuthError());
    
    try {
      const resultAction = await dispatch(login({ email, password })).unwrap();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Force navigation directly here as well
      navigate("/", { replace: true });
    } catch (err) {
      // Error handling is done in the slice
      toast({
        title: "Login failed",
        description: err as string,
        variant: "destructive",
      });
    }
  };

  // Display either the success message from the slice or the local one
  const displaySuccessMessage = successMessage || localSuccessMessage;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {displaySuccessMessage && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{displaySuccessMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Register
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}