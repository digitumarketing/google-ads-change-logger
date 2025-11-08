import React, { useState, useMemo } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ChangeLogForm from '../components/ChangeLogForm';
import ChangeLogItem from '../components/ChangeLogItem';

const LogPage: React.FC = () => {
    const { accounts, changeLogs, currentUser } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccount, setFilterAccount] = useState('all');

    const canAddChange = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.Analyst;

    const filteredLogs = useMemo(() => {
        return changeLogs
            .filter(log => filterAccount === 'all' || log.accountId === filterAccount)
            .filter(log => {
                const search = searchTerm.toLowerCase();
                const account = accounts.find(a => a.id === log.accountId);
                return (
                    log.campaignName.toLowerCase().includes(search) ||
                    log.description.toLowerCase().includes(search) ||
                    log.reason.toLowerCase().includes(search) ||
                    log.category.toLowerCase().includes(search) ||
                    (account && account.name.toLowerCase().includes(search))
                );
            });
    }, [changeLogs, searchTerm, filterAccount, accounts]);

    return (
        <div className="space-y-6">
             <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div className="flex-1 w-full sm:w-auto">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                           <input
                                type="text"
                                placeholder="Search by campaign, description, keyword..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="flex-1 w-full sm:w-auto">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={filterAccount}
                            onChange={e => setFilterAccount(e.target.value)}
                        >
                            <option value="all">All Accounts</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>
                     {canAddChange && (
                        <Button onClick={() => setIsModalOpen(true)}>
                            <PlusCircle size={20} className="mr-2"/>
                            Log New Change
                        </Button>
                     )}
                </div>

                <div className="space-y-4">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map(log => <ChangeLogItem key={log.id} log={log} />)
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <p>No change logs found.</p>
                            <p className="text-sm">Try adjusting your filters or adding a new change log.</p>
                        </div>
                    )}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log a New Change" size="xl">
                <ChangeLogForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default LogPage;