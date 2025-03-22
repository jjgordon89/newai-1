import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { 
  fetchUsers, 
  addUser, 
  updateUser, 
  removeUser, 
  setCurrentUser 
} from '@/redux/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function UserList() {
  const dispatch = useAppDispatch();
  const { users, loading, error, currentUser } = useAppSelector((state) => state.user);
  
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'user'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch users when component mounts
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      if (isEditing && editingId) {
        dispatch(updateUser({
          id: editingId,
          ...newUser
        }));
        setIsEditing(false);
        setEditingId(null);
      } else {
        dispatch(addUser({
          id: crypto.randomUUID(),
          ...newUser
        }));
      }
      setNewUser({ name: '', email: '', role: 'user' });
    }
  };

  const handleEdit = (user: any) => {
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditing(true);
    setEditingId(user.id);
  };

  const handleDelete = (id: string) => {
    dispatch(removeUser(id));
  };

  const handleSelectUser = (user: any) => {
    dispatch(setCurrentUser(user));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input 
                placeholder="Name" 
                name="name" 
                value={newUser.name} 
                onChange={handleInputChange} 
              />
              <Input 
                placeholder="Email" 
                name="email" 
                value={newUser.email} 
                onChange={handleInputChange} 
              />
              <select
                className="p-2 border rounded"
                name="role"
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <Button onClick={handleAddUser}>
              {isEditing ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading === 'pending' && <div className="text-center py-4">Loading users...</div>}
          {loading === 'failed' && <div className="text-center text-red-500 py-4">{error}</div>}
          {loading === 'succeeded' && users.length === 0 && (
            <div className="text-center py-4">No users found</div>
          )}
          <div className="space-y-2">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`p-4 border rounded-lg flex justify-between items-center
                  ${currentUser?.id === user.id ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded mt-1">
                    {user.role}
                  </div>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSelectUser(user)}
                  >
                    Select
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle>Selected User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><span className="font-semibold">ID:</span> {currentUser.id}</div>
              <div><span className="font-semibold">Name:</span> {currentUser.name}</div>
              <div><span className="font-semibold">Email:</span> {currentUser.email}</div>
              <div><span className="font-semibold">Role:</span> {currentUser.role}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}