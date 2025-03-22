import React from 'react';
import { Counter } from '@/components/Counter';
import { UserList } from '@/components/UserList';
import { LoginForm } from '@/components/LoginForm';
import { PostList } from '@/components/PostList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const ReduxDemo = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Redux State Management Demo</h1>
      
      <div className="max-w-4xl mx-auto">
        <p className="mb-6 text-gray-700 text-center">
          This page demonstrates the implementation of Redux for state management in React applications.
          The examples below showcase both modern Redux Toolkit and traditional Redux patterns.
        </p>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Redux Toolkit Examples</h2>
          <p className="mb-4 text-gray-700">
            Modern Redux using Redux Toolkit with createSlice and createAsyncThunk.
          </p>
          
          <Tabs defaultValue="counter" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="counter">Simple Counter</TabsTrigger>
              <TabsTrigger value="users">Async User Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="counter" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Basic Redux Toolkit Example</h2>
              <Counter />
              
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Implementation Details:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Used Redux Toolkit to simplify Redux configuration</li>
                  <li>Created a counter slice with reducers for various actions</li>
                  <li>Utilized typed hooks for proper TypeScript integration</li>
                  <li>Connected the Redux store to the React component tree</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Advanced Redux Toolkit Example</h2>
              <UserList />
              
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Advanced Implementation Details:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Used <code>createAsyncThunk</code> for handling async operations</li>
                  <li>Implemented proper loading states and error handling</li>
                  <li>Demonstrated complex state management patterns (CRUD operations)</li>
                  <li>Showcased relationship handling between entities</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="my-10" />

        <div>
          <h2 className="text-2xl font-bold mb-4">Traditional Redux with Redux-Saga</h2>
          <p className="mb-4 text-gray-700">
            Classic Redux approach using action creators, reducers, and Redux-Saga for side effects.
          </p>
          
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="posts">Posts Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auth" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Authentication with Redux-Saga</h2>
              <LoginForm />
              
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Implementation Details:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Used traditional action creators and reducers</li>
                  <li>Implemented Redux-Saga for handling async login</li>
                  <li>Managed loading, success, and error states</li>
                  <li>Fully typed with TypeScript</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="posts" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Posts Management with Redux-Saga</h2>
              <PostList />
              
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Implementation Details:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Used Redux-Saga for async data fetching</li>
                  <li>Implemented traditional action types and action creators</li>
                  <li>Demonstrated CRUD operations with proper state updates</li>
                  <li>Showcased saga watchers and workers pattern</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReduxDemo;