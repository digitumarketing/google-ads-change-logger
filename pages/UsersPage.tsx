import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { User, UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import UserForm from '../components/UserForm';

const UsersPage: React.FC = () => {
  const { users, deleteUser, currentUser } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const isSuperAdmin = currentUser?.role === UserRole.SuperAdmin;

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Only Super Admins can manage users.</p>
        </div>
      </div>
    );
  }

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
        alert("You cannot delete your own account.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this user? Accounts managed by them will be reassigned to an available admin.')) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
        <Button onClick={handleAddUser}>
            <PlusCircle size={20} className="mr-2" />
            Add User
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => handleEditUser(user)} className="text-primary hover:text-blue-700"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-danger hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={user.id === currentUser?.id}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? 'Edit User' : 'Add New User'} closeOnOutsideClick={false}>
        <UserForm user={selectedUser} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default UsersPage;
