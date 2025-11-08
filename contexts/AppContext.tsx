import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Account, ChangeLog, UserRole } from '../types';
import { userService, accountService, changeLogService, commentService } from '../services/database';
import { authService } from '../services/auth';
import { supabase } from '../lib/supabase';

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
  loading: boolean;
  hasUsersInDb: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUsersInDb, setHasUsersInDb] = useState(false);

  useEffect(() => {
    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          loadCurrentUser(session.user.id);
        }
      })();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const initializeAuth = async () => {
    try {
      setLoading(true);

      const allUsers = await userService.getAll();
      setHasUsersInDb(allUsers.length > 0);

      const { user } = await authService.getCurrentSession();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async (authId: string) => {
    try {
      const user = await userService.getByAuthId(authId);
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadData = async () => {
    try {
      const [usersData, accountsData, changeLogsData] = await Promise.all([
        userService.getAll(),
        accountService.getAll(),
        changeLogService.getAll(),
      ]);

      setUsers(usersData);
      setAccounts(accountsData);
      setChangeLogs(changeLogsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const logout = async () => {
    await authService.signOut();
    setCurrentUser(null);
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, userData as User]);
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const oldUser = users.find(u => u.id === updatedUser.id);
      const updated = await userService.update(updatedUser);

      if (oldUser && oldUser.name !== updatedUser.name) {
        await accountService.updateManagerName(oldUser.name, updatedUser.name);
        const updatedAccounts = await accountService.getAll();
        setAccounts(updatedAccounts);
      }

      setUsers(prevUsers => prevUsers.map(u => u.id === updated.id ? updated : u));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) return;

      const reassignmentAdmin = users.find(u => u.role === UserRole.Admin && u.id !== userId);

      if (reassignmentAdmin) {
        await accountService.updateManagerName(userToDelete.name, reassignmentAdmin.name);
      } else {
        await accountService.updateManagerName(userToDelete.name, 'Unassigned');
      }

      await userService.delete(userId);

      if (currentUser?.id === userId) {
        logout();
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      const updatedAccounts = await accountService.getAll();
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id'>) => {
    try {
      const newAccount = await accountService.create(accountData);
      setAccounts(prev => [...prev, newAccount]);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const updateAccount = async (updatedAccount: Account) => {
    try {
      const updated = await accountService.update(updatedAccount);
      setAccounts(prev => prev.map(acc => acc.id === updated.id ? updated : acc));
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      await accountService.delete(accountId);
      setAccounts(prevAccounts => prevAccounts.filter(acc => acc.id !== accountId));
      const updatedChangeLogs = await changeLogService.getAll();
      setChangeLogs(updatedChangeLogs);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const addChangeLog = async (logData: Omit<ChangeLog, 'id' | 'comments' | 'postChangeMetrics' | 'result' | 'resultSummary'>) => {
    if (!currentUser) return;
    try {
      const newLog = await changeLogService.create({
        ...logData,
        loggedById: currentUser.id,
      }, currentUser.name);
      setChangeLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Error adding change log:', error);
    }
  };

  const updateChangeLog = async (updatedLog: ChangeLog) => {
    if (!currentUser) return;
    try {
      const updated = await changeLogService.update(updatedLog, currentUser.id, currentUser.name);
      setChangeLogs(prev => prev.map(log => log.id === updated.id ? updated : log));
    } catch (error) {
      console.error('Error updating change log:', error);
    }
  };

  const addComment = async (logId: string, commentText: string) => {
    if (!currentUser) return;
    try {
      const newComment = await commentService.create(logId, currentUser.id, currentUser.name, commentText);
      setChangeLogs(prev => prev.map(log => {
        if (log.id === logId) {
          return { ...log, comments: [...log.comments, newComment] };
        }
        return log;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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
    loading,
    hasUsersInDb,
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