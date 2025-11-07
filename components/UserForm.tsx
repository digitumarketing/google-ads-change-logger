import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User, UserRole } from '../types';
import Button from './ui/Button';

interface UserFormProps {
    user: User | null;
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
    const { addUser, updateUser } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        role: UserRole.Analyst,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                role: user.role,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            updateUser({ ...user, ...formData });
        } else {
            addUser(formData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full form-input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 w-full form-select">
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save User</Button>
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
                .form-input:focus, .form-select:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    --tw-ring-color: #4285F4;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                    border-color: #4285F4;
                }
            `}</style>
        </form>
    );
};

export default UserForm;
