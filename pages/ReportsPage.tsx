import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { ChangeCategory, ChangeResult } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, Printer } from 'lucide-react';

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9c27b0', '#00bcd4', '#ff9800', '#795548'];

const ReportsPage: React.FC = () => {
    const { changeLogs, users, accounts } = useAppContext();

    const categoryData = useMemo(() => {
        const counts = changeLogs.reduce((acc, log) => {
            acc[log.category] = (acc[log.category] || 0) + 1;
            return acc;
        }, {} as Record<ChangeCategory, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [changeLogs]);

    const userData = useMemo(() => {
        const counts = changeLogs.reduce((acc, log) => {
            const user = users.find(u => u.id === log.loggedById);
            const name = user ? user.name : 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [changeLogs, users]);

    const successfulChangesByUser = useMemo(() => {
        const successfulLogs = changeLogs.filter(log => log.result === ChangeResult.Successful);
        const counts = successfulLogs.reduce((acc, log) => {
            const user = users.find(u => u.id === log.loggedById);
            const name = user ? user.name : 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        // Fix: Explicitly cast values to numbers to prevent arithmetic operation errors during sort.
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => Number(b.value) - Number(a.value));
    }, [changeLogs, users]);

    const accountActivityData = useMemo(() => {
        const now = new Date();
        const threeDaysAgo = new Date(new Date().setDate(now.getDate() - 3));
        const sevenDaysAgo = new Date(new Date().setDate(now.getDate() - 7));
        const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));

        return accounts.map(account => {
            const accountLogs = changeLogs.filter(log => log.accountId === account.id);
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
    }, [accounts, changeLogs]);
    
    const exportToCSV = () => {
        const headers = [
            'ID', 'Date of Change', 'Account Name', 'Campaign Name', 'Category', 'Description', 'Reason', 'Expected Impact',
            'Pre-CTR', 'Pre-CPC', 'Pre-ConvRate', 'Pre-CPA',
            'Post-CTR', 'Post-CPC', 'Post-ConvRate', 'Post-CPA',
            'Result', 'Result Summary', 'Logged By', 'Review Date'
        ];
        
        const rows = changeLogs.map(log => {
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
                log.postChangeMetrics?.ctr, log.postChangeMetrics?.cpc, log.postChangeMetrics?.convRate, log.postChangeMetrics?.cpa,
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
        link.setAttribute("download", "change_log_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const exportToPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center no-print">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analysis</h2>
                 <div className="flex items-center space-x-2">
                    <Button onClick={exportToCSV} variant="secondary">
                        <Download size={18} className="mr-2"/>
                        Export to CSV
                    </Button>
                    <Button onClick={exportToPDF} variant="ghost">
                        <Printer size={18} className="mr-2"/>
                        Export to PDF
                    </Button>
                </div>
            </div>
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