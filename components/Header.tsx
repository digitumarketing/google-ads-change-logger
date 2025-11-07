import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User as UserIcon, LogOut } from 'lucide-react';
import Button from './ui/Button';

const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  if (!currentUser) {
    return null; 
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 no-print">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Ads Change Logger</h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <UserIcon className="text-gray-500 dark:text-gray-400" size={20}/>
          <span className="font-medium text-gray-700 dark:text-gray-200">{currentUser.name} ({currentUser.role})</span>
        </div>
        <Button onClick={logout} variant="ghost" size="sm">
          <LogOut size={16} className="mr-2"/>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;