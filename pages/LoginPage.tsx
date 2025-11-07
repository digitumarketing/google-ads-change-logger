import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, LogIn } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const { users, setCurrentUser, currentUser } = useAppContext();
  const [selectedUserId, setSelectedUserId] = useState<string>(users.length > 0 ? users[0].id : '');
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLogin = users.find(u => u.id === selectedUserId);
    if (userToLogin) {
      setCurrentUser(userToLogin);
      navigate('/', { replace: true });
    } else {
      alert('Could not find selected user.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <Bot size={48} className="text-primary mb-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AdLogger</h1>
          <p className="text-gray-500 dark:text-gray-400">Select a profile to sign in</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              User Profile
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            <LogIn size={20} className="mr-2"/>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
