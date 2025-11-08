import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import Button from './ui/Button';

interface UserFormProps {
    user: User | null;
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
    const { addUser, updateUser } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: UserRole.Analyst,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (user) {
            updateUser({ ...user, name: formData.name, email: formData.email, role: formData.role });
            onClose();
        } else {
            if (!formData.password || formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                setLoading(false);
                return;
            }

            const { user: newUser, error: signUpError } = await authService.signUp(
                formData.email,
                formData.password,
                formData.name,
                formData.role
            );

            if (signUpError) {
                setError(signUpError.message || 'Failed to create user');
                setLoading(false);
                return;
            }

            if (newUser) {
                addUser(newUser);
                onClose();
            }
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full form-input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!user}
                    className="mt-1 w-full form-input disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
            </div>
            {!user && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="mt-1 w-full form-input"
                        placeholder="Minimum 6 characters"
                    />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 w-full form-select">
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
                </Button>
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
