
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Account, AccountStatus } from '../types';
import Button from './ui/Button';

interface AccountFormProps {
    account: Account | null;
    onClose: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onClose }) => {
    const { addAccount, updateAccount, users } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        manager: users.length > 0 ? users[0].name : '',
        currency: 'USD',
        status: AccountStatus.Active,
        tags: '',
    });

    useEffect(() => {
        if (account) {
            setFormData({
                name: account.name,
                client: account.client,
                manager: account.manager,
                currency: account.currency,
                status: account.status,
                tags: account.tags.join(', '),
            });
        }
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const accountData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };
        if (account) {
            updateAccount({ ...account, ...accountData });
        } else {
            addAccount(accountData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full form-input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client / Brand</label>
                <input type="text" name="client" value={formData.client} onChange={handleChange} required className="mt-1 w-full form-input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Manager</label>
                <select name="manager" value={formData.manager} onChange={handleChange} required className="mt-1 w-full form-select">
                     {users.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                    <input type="text" name="currency" value={formData.currency} onChange={handleChange} required className="mt-1 w-full form-input" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 w-full form-select">
                        {Object.values(AccountStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 w-full form-input" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Account</Button>
            </div>
            <style jsx>{`
                .form-input, .form-select {
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    background-color: #fff;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                }
                .dark .form-input, .dark .form-select {
                    background-color: #374151;
                    border-color: #4b5563;
                }
            `}</style>
        </form>
    );
};

export default AccountForm;
