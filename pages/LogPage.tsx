import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ChangeLogForm from '../components/ChangeLogForm';
import ChangeLogItem from '../components/ChangeLogItem';

const LOGS_PER_PAGE = 30;

const LogPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { accounts, changeLogs, currentUser } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccount, setFilterAccount] = useState('all');
    const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const canAddChange = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.Analyst;

    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            setHighlightedLogId(highlightId);

            // Clear filters to ensure the highlighted log is visible
            setSearchTerm('');
            setFilterAccount('all');

            // Find which page contains this log
            const logIndex = changeLogs.findIndex(log => log.id === highlightId);
            if (logIndex !== -1) {
                const pageContainingLog = Math.ceil((logIndex + 1) / LOGS_PER_PAGE);
                setCurrentPage(pageContainingLog);
            }

            setTimeout(() => {
                const element = document.getElementById(`log-${highlightId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);

            setTimeout(() => {
                setHighlightedLogId(null);
                setSearchParams({});
            }, 3000);
        }
    }, [searchParams, setSearchParams, changeLogs]);

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

    const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
        return filteredLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, filterAccount]);

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
                        <>
                            {paginatedLogs.map(log => (
                                <div
                                    key={log.id}
                                    id={`log-${log.id}`}
                                    className={highlightedLogId === log.id ? 'ring-2 ring-blue-500 rounded-lg transition-all duration-300' : ''}
                                >
                                    <ChangeLogItem log={log} />
                                </div>
                            ))}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {((currentPage - 1) * LOGS_PER_PAGE) + 1} to {Math.min(currentPage * LOGS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} logs
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <p>No change logs found.</p>
                            <p className="text-sm">Try adjusting your filters or adding a new change log.</p>
                        </div>
                    )}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log a New Change" size="xl" closeOnOutsideClick={false}>
                <ChangeLogForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default LogPage;