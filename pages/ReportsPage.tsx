import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { ChangeCategory, ChangeResult } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9c27b0', '#00bcd4', '#ff9800', '#795548'];

const ReportsPage: React.FC = () => {
    const { changeLogs, users, accounts } = useAppContext();
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

    const filteredChangeLogs = useMemo(() => {
        if (selectedAccounts.length === 0) {
            return changeLogs;
        }
        return changeLogs.filter(log => selectedAccounts.includes(log.accountId));
    }, [changeLogs, selectedAccounts]);

    const categoryData = useMemo(() => {
        const counts = filteredChangeLogs.reduce((acc, log) => {
            acc[log.category] = (acc[log.category] || 0) + 1;
            return acc;
        }, {} as Record<ChangeCategory, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredChangeLogs]);

    const userData = useMemo(() => {
        const counts = filteredChangeLogs.reduce((acc, log) => {
            const user = users.find(u => u.id === log.loggedById);
            const name = user ? user.name : 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredChangeLogs, users]);

    const successfulChangesByUser = useMemo(() => {
        const successfulLogs = filteredChangeLogs.filter(log => log.result === ChangeResult.Successful);
        const counts = successfulLogs.reduce((acc, log) => {
            const user = users.find(u => u.id === log.loggedById);
            const name = user ? user.name : 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => Number(b.value) - Number(a.value));
    }, [filteredChangeLogs, users]);

    const accountActivityData = useMemo(() => {
        const now = new Date();
        const threeDaysAgo = new Date(new Date().setDate(now.getDate() - 3));
        const sevenDaysAgo = new Date(new Date().setDate(now.getDate() - 7));
        const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));

        const accountsToShow = selectedAccounts.length === 0
            ? accounts
            : accounts.filter(acc => selectedAccounts.includes(acc.id));

        return accountsToShow.map(account => {
            const accountLogs = filteredChangeLogs.filter(log => log.accountId === account.id);
            const last3Days = accountLogs.filter(log => new Date(log.dateOfChange) >= threeDaysAgo).length;
            const last7Days = accountLogs.filter(log => new Date(log.dateOfChange) >= sevenDaysAgo).length;
            const last30Days = accountLogs.filter(log => new Date(log.dateOfChange) >= thirtyDaysAgo).length;
            return {
                id: account.id,
                name: account.name,
                last3Days,
                last7Days,
                last30Days,
            };
        });
    }, [accounts, filteredChangeLogs, selectedAccounts]);
    
    const handleAccountToggle = (accountId: string) => {
        setSelectedAccounts(prev => {
            if (prev.includes(accountId)) {
                return prev.filter(id => id !== accountId);
            } else {
                return [...prev, accountId];
            }
        });
    };

    const selectAllAccounts = () => {
        if (selectedAccounts.length === accounts.length) {
            setSelectedAccounts([]);
        } else {
            setSelectedAccounts(accounts.map(acc => acc.id));
        }
    };

    const exportToCSV = () => {
        const headers = [
            'ID', 'Date of Change', 'Account Name', 'Campaign Name', 'Category', 'Description', 'Reason', 'Expected Impact',
            'Pre-CTR', 'Pre-CPC', 'Pre-ConvRate', 'Pre-CPA',
            'Post-CTR', 'Post-CPC', 'Post-ConvRate', 'Post-CPA',
            'Result', 'Result Summary', 'Logged By', 'Review Date'
        ];

        const rows = filteredChangeLogs.map(log => {
            const account = accounts.find(a => a.id === log.accountId);
            const user = users.find(u => u.id === log.loggedById);
            return [
                log.id,
                log.dateOfChange,
                account?.name || 'N/A',
                log.campaignName,
                log.category,
                `"${log.description.replace(/"/g, '""')}"`,
                `"${log.reason.replace(/"/g, '""')}"`,
                log.expectedImpact,
                log.preChangeMetrics.ctr, log.preChangeMetrics.cpc, log.preChangeMetrics.convRate, log.preChangeMetrics.cpa,
                log.postChangeMetrics?.ctr || '', log.postChangeMetrics?.cpc || '', log.postChangeMetrics?.convRate || '', log.postChangeMetrics?.cpa || '',
                log.result,
                `"${log.resultSummary.replace(/"/g, '""')}"`,
                user?.name || 'N/A',
                log.nextReviewDate || ''
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const filename = selectedAccounts.length > 0 ? 'filtered_change_log_export.csv' : 'change_log_export.csv';
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFontSize(18);
        doc.text('Change Log Report', 14, 20);

        doc.setFontSize(10);
        const dateStr = new Date().toLocaleDateString();
        doc.text(`Generated: ${dateStr}`, 14, 28);

        if (selectedAccounts.length > 0) {
            const accountNames = accounts
                .filter(acc => selectedAccounts.includes(acc.id))
                .map(acc => acc.name)
                .join(', ');
            doc.text(`Filtered by accounts: ${accountNames}`, 14, 34);
        }

        const tableData = filteredChangeLogs.map(log => {
            const account = accounts.find(a => a.id === log.accountId);
            const user = users.find(u => u.id === log.loggedById);
            return [
                new Date(log.dateOfChange).toLocaleDateString(),
                account?.name || 'N/A',
                log.campaignName,
                log.category,
                log.description.substring(0, 40) + (log.description.length > 40 ? '...' : ''),
                log.result,
                user?.name || 'N/A'
            ];
        });

        autoTable(doc, {
            head: [['Date', 'Account', 'Campaign', 'Category', 'Description', 'Result', 'Logged By']],
            body: tableData,
            startY: selectedAccounts.length > 0 ? 40 : 35,
            theme: 'grid',
            headStyles: { fillColor: [66, 133, 244], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 40 },
                3: { cellWidth: 25 },
                4: { cellWidth: 60 },
                5: { cellWidth: 25 },
                6: { cellWidth: 30 }
            }
        });

        const filename = selectedAccounts.length > 0 ? 'filtered_change_log_report.pdf' : 'change_log_report.pdf';
        doc.save(filename);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analysis</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={exportToCSV} variant="secondary">
                        <Download size={18} className="mr-2"/>
                        Export to CSV
                    </Button>
                    <Button onClick={exportToPDF} variant="ghost">
                        <FileText size={18} className="mr-2"/>
                        Export to PDF
                    </Button>
                </div>
            </div>

            <Card>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Filter by Accounts</h3>
                        <button
                            onClick={selectAllAccounts}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {selectedAccounts.length === accounts.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {accounts.map(account => (
                            <button
                                key={account.id}
                                onClick={() => handleAccountToggle(account.id)}
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                    selectedAccounts.length === 0 || selectedAccounts.includes(account.id)
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                                }`}
                            >
                                {account.name}
                            </button>
                        ))}
                    </div>
                    {selectedAccounts.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing data for {selectedAccounts.length} selected account{selectedAccounts.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 reports-grid-print">
                <Card className="card-print">
                    <h3 className="font-semibold mb-4">Change Volume by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                               {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                 <Card className="card-print">
                    <h3 className="font-semibold mb-4">Total Team Activity by User</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: 'currentColor', fontSize: 12 }} width={80} />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}/>
                            <Legend />
                            <Bar dataKey="value" name="Changes Logged" fill="#4285F4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="card-print">
                    <h3 className="font-semibold mb-4">Successful Changes by User</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={successfulChangesByUser} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}/>
                            <Legend />
                            <Bar dataKey="value" name="Successful Changes" fill="#34A853" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                 <Card className="card-print">
                    <h3 className="font-semibold mb-4">Account Activity (Recent Changes)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account Name</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last 3 Days</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last 7 Days</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last 30 Days</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {accountActivityData.map((data) => (
                                    <tr key={data.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{data.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.last3Days}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.last7Days}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{data.last30Days}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReportsPage;