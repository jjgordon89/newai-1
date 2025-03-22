import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

/**
 * Authentication Page
 * 
 * Provides a unified interface for login and registration
 */
export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to AI Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Log in to your account or create a new one
          </p>
        </div>
        
        <AuthForm />
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to our</p>
          <div className="flex justify-center space-x-2 mt-1">
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            <span>and</span>
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}