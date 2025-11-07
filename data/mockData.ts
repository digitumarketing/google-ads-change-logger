import { User, Account, ChangeLog, UserRole } from '../types';

// Provide a single default admin user so the application is accessible on first load.
// All other data is empty to provide a clean slate for the user.
export const USERS: User[] = [
  { id: 'user_1', name: 'Admin User', role: UserRole.Admin },
];

export const ACCOUNTS: Account[] = [];

export const CHANGE_LOGS: ChangeLog[] = [];
