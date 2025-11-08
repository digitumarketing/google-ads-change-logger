import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, LogIn } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { authService } from '../services/auth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error: signInError } = await authService.signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      return;
    }

    if (user) {
      setCurrentUser(user);
      navigate('/', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <Bot size={48} className="text-primary mb-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AdLogger</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn size={20} className="mr-2"/>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
