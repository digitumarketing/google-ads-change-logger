import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Account, UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AccountForm from '../components/AccountForm';

const AccountsPage: React.FC = () => {
  const { accounts, deleteAccount, currentUser } = useAppContext();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const canEdit = currentUser?.role === UserRole.SuperAdmin;

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Only Super Admins can manage accounts.</p>
        </div>
      </div>
    );
  }

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsFormModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Accounts Management</h2>
        {canEdit && (
          <Button onClick={handleAddAccount}>
            <PlusCircle size={20} className="mr-2" />
            Add Account
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client / Brand</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                {canEdit && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{account.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{account.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{account.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {account.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">{tag}</span>)}
                    </div>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <Button onClick={() => handleEditAccount(account)} variant="ghost" size="sm">Edit</Button>
                        <Button onClick={() => handleDeleteClick(account)} variant="danger" size="sm">Delete</Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedAccount ? 'Edit Account' : 'Add New Account'}>
        <AccountForm account={selectedAccount} onClose={() => setIsFormModalOpen(false)} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
            <p>Are you sure you want to delete the account <span className="font-bold">{accountToDelete?.name}</span>?</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">This action cannot be undone. All change logs associated with this account will also be permanently deleted.</p>
            <div className="flex justify-end space-x-3 pt-4">
                <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Confirm Delete</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsPage;