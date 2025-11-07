import React, { createContext, useContext, ReactNode } from 'react';
import { User, Account, ChangeLog, Comment, UserRole, ChangeResult } from '../types';
import { USERS, ACCOUNTS, CHANGE_LOGS } from '../data/mockData';
import useLocalStorage from '../hooks/useLocalStorage';

interface AppContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (accountId: string) => void;
  changeLogs: ChangeLog[];
  addChangeLog: (log: Omit<ChangeLog, 'id' | 'comments' | 'postChangeMetrics' | 'result' | 'resultSummary'>) => void;
  updateChangeLog: (log: ChangeLog) => void;
  addComment: (logId: string, commentText: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', USERS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', ACCOUNTS);
  const [changeLogs, setChangeLogs] = useLocalStorage<ChangeLog[]>('changeLogs', CHANGE_LOGS);

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `user_${new Date().getTime()}` };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => {
        const oldUser = prevUsers.find(u => u.id === updatedUser.id);
        if (oldUser && oldUser.name !== updatedUser.name) {
            setAccounts(prevAccounts => prevAccounts.map(acc => acc.manager === oldUser.name ? { ...acc, manager: updatedUser.name } : acc));
        }
        return prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    });
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const reassignmentAdmin = users.find(u => u.role === UserRole.Admin && u.id !== userId);
    
    setAccounts(prev => prev.map(acc => {
        if (acc.manager === userToDelete.name) {
            return { ...acc, manager: reassignmentAdmin ? reassignmentAdmin.name : 'Unassigned' };
        }
        return acc;
    }));

    if (currentUser?.id === userId) {
      logout();
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...accountData, id: `acc_${new Date().getTime()}` };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };
  
  const deleteAccount = (accountId: string) => {
    setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
    setChangeLogs(prevLogs => prevLogs.filter(log => log.accountId !== accountId));
  };

  const addChangeLog = (logData: Omit<ChangeLog, 'id' | 'comments' | 'postChangeMetrics' | 'result' | 'resultSummary'>) => {
    if (!currentUser) return;
    const newLog: ChangeLog = {
      ...logData,
      id: `log_${new Date().getTime()}`,
      postChangeMetrics: null,
      result: ChangeResult.Pending,
      resultSummary: '',
      comments: [],
      loggedById: currentUser.id,
    };
    setChangeLogs(prev => [newLog, ...prev]);
  };

  const updateChangeLog = (updatedLog: ChangeLog) => {
    setChangeLogs(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
  };
  
  const addComment = (logId: string, commentText: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `comm_${new Date().getTime()}`,
      logId,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      text: commentText,
    };
    setChangeLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return { ...log, comments: [...log.comments, newComment] };
      }
      return log;
    }));
  };

  const value = {
    users,
    currentUser,
    setCurrentUser,
    logout,
    addUser,
    updateUser,
    deleteUser,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    changeLogs,
    addChangeLog,
    updateChangeLog,
    addComment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};