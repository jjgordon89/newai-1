import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchPostsRequest, addPost, deletePost } from '@/redux/actions/postActions';
import { RootState } from '@/redux/reducers';
import { useAppDispatch } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export function PostList() {
  const dispatch = useAppDispatch();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchPostsRequest());
  }, [dispatch]);

  const handleAddPost = () => {
    const newPost = {
      id: crypto.randomUUID(),
      title: 'New Post ' + new Date().toLocaleTimeString(),
      body: 'This is a new post created at ' + new Date().toLocaleString(),
      author: 'Current User',
      createdAt: new Date().toISOString(),
    };
    dispatch(addPost(newPost));
  };

  const handleDeletePost = (id: string) => {
    dispatch(deletePost(id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Posts (Redux-Saga)</h2>
        <Button onClick={handleAddPost}>Add Sample Post</Button>
      </div>

      {loading === true && (
        <div className="p-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading posts...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>By {post.author}</CardDescription>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>{post.body}</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Posted: {new Date(post.createdAt).toLocaleString()}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && !error && (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-gray-500">No posts found. Add some posts to get started!</p>
        </div>
      )}
    </div>
  );
}