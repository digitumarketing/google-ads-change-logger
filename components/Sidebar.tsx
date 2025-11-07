import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building, BarChart3, Bot, Users, ClipboardList } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { currentUser } = useAppContext();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 no-print">
      <div className="flex items-center space-x-3 mb-8 px-2">
        <Bot size={32} className="text-primary"/>
        <span className="text-xl font-bold text-gray-800 dark:text-white">AdLogger</span>
      </div>
      <nav className="flex-1 space-y-2">
        <NavLink to="/" className={navLinkClasses}>
          <LayoutDashboard size={20} className="mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/log" className={navLinkClasses}>
          <ClipboardList size={20} className="mr-3" />
          Log
        </NavLink>
        <NavLink to="/accounts" className={navLinkClasses}>
          <Building size={20} className="mr-3" />
          Accounts
        </NavLink>
        <NavLink to="/reports" className={navLinkClasses}>
          <BarChart3 size={20} className="mr-3" />
          Reports
        </NavLink>
        {currentUser?.role === UserRole.Admin && (
          <NavLink to="/users" className={navLinkClasses}>
            <Users size={20} className="mr-3" />
            Users
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;