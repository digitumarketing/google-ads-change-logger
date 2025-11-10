import React, { useState } from 'react';
import { ChangeLog, ChangeResult, PerformanceMetrics, UserRole } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { ChevronDown, ChevronUp, MessageSquare, CheckCircle, XCircle, MinusCircle, Clock, User as UserIcon, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from './ui/Button';

const getResultStyles = (result: ChangeResult) => {
    switch (result) {
        case ChangeResult.Successful: return { icon: <CheckCircle className="text-secondary" />, text: 'text-secondary' };
        case ChangeResult.Reverted: return { icon: <XCircle className="text-danger" />, text: 'text-danger' };
        case ChangeResult.Neutral: return { icon: <MinusCircle className="text-yellow-500" />, text: 'text-yellow-500' };
        default: return { icon: <Clock className="text-gray-500" />, text: 'text-gray-500' };
    }
};

const MetricInput: React.FC<{ label: string; name: keyof PerformanceMetrics; value: number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input type="number" name={name} value={value ?? ''} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
    </div>
);

const ChangeLogItem: React.FC<{ log: ChangeLog }> = ({ log }) => {
    const { accounts, users, updateChangeLog, deleteChangeLog, addComment, currentUser } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [postMetrics, setPostMetrics] = useState<PerformanceMetrics>(log.postChangeMetrics || { ctr: null, cpc: null, convRate: null, cpa: null });
    const [result, setResult] = useState<ChangeResult>(log.result);
    const [resultSummary, setResultSummary] = useState(log.resultSummary);
    const [commentText, setCommentText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const canEdit = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.Analyst;
    const canDelete = currentUser?.role === UserRole.SuperAdmin;

    const account = accounts.find(a => a.id === log.accountId);
    const user = users.find(u => u.id === log.loggedById);
    const { icon, text } = getResultStyles(log.result);

    const handleUpdate = () => {
        const updatedLog: ChangeLog = {
            ...log,
            postChangeMetrics: postMetrics,
            result,
            resultSummary
        };
        updateChangeLog(updatedLog);
        setIsExpanded(false);
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if(commentText.trim()){
            addComment(log.id, commentText.trim());
            setCommentText('');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteChangeLog(log.id);
        } catch (error) {
            alert('Failed to delete log. Please try again.');
        }
    };

    const chartData = [
        { name: 'CTR (%)', Before: log.preChangeMetrics.ctr, After: postMetrics.ctr },
        { name: 'CPC', Before: log.preChangeMetrics.cpc, After: postMetrics.cpc },
        { name: 'Conv Rate (%)', Before: log.preChangeMetrics.convRate, After: postMetrics.convRate },
        { name: 'CPA', Before: log.preChangeMetrics.cpa, After: postMetrics.cpa },
    ].filter(d => d.Before !== null && d.After !== null);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 mb-2 md:mb-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-primary">{account?.name || 'Unknown Account'}</span>
                            <span className="text-gray-400 dark:text-gray-500">&gt;</span>
                            <span className="text-gray-800 dark:text-white">{log.campaignName}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{log.description}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 w-full md:w-auto">
                        <span className="font-mono text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{log.category}</span>
                        <span className="flex items-center">{new Date(log.dateOfChange).toLocaleDateString()}</span>
                        <span className={`flex items-center font-semibold ${text}`}>{icon}{log.result}</span>
                        <div className="flex items-center space-x-1">
                            <MessageSquare size={16} className="text-gray-400" />
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                                {log.comments.length}
                            </span>
                        </div>
                        {canDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(true);
                                }}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete log"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <div className="flex items-center text-gray-400 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>
                </div>
                {showDeleteConfirm && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">Are you sure you want to delete this log? This action cannot be undone.</p>
                        <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-6">
                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-1">Reason / Hypothesis</h4>
                            <p className="text-gray-600 dark:text-gray-300">{log.reason}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Expected Impact</h4>
                            <p className="text-gray-600 dark:text-gray-300">{log.expectedImpact}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-1">Created By</h4>
                            <p className="text-gray-600 dark:text-gray-300">{log.createdByName || user?.name || 'Unknown User'}</p>
                            {log.createdAt && <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>}
                        </div>
                         <div>
                            <h4 className="font-semibold mb-1">Next Review Date</h4>
                            <p className="text-gray-600 dark:text-gray-300">{log.nextReviewDate ? new Date(log.nextReviewDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        {log.lastEditedByName && (
                          <div className="md:col-span-2">
                            <h4 className="font-semibold mb-1">Last Edited By</h4>
                            <p className="text-gray-600 dark:text-gray-300">
                              {log.lastEditedByName}
                              {log.lastEditedAt && <span className="text-xs text-gray-400 ml-2">on {new Date(log.lastEditedAt).toLocaleString()}</span>}
                            </p>
                          </div>
                        )}
                    </div>
                    
                    {/* Impact Tracking and Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="space-y-4">
                             <h3 className="text-lg font-semibold">Impact Tracking</h3>
                             {canEdit ? (
                                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                     <h4 className="font-semibold">Post-change Performance</h4>
                                     <div className="grid grid-cols-2 gap-4">
                                         <MetricInput label="CTR (%)" name="ctr" value={postMetrics.ctr} onChange={e => setPostMetrics({ ...postMetrics, ctr: parseFloat(e.target.value) || null })} />
                                         <MetricInput label="CPC" name="cpc" value={postMetrics.cpc} onChange={e => setPostMetrics({ ...postMetrics, cpc: parseFloat(e.target.value) || null })} />
                                         <MetricInput label="Conv. Rate (%)" name="convRate" value={postMetrics.convRate} onChange={e => setPostMetrics({ ...postMetrics, convRate: parseFloat(e.target.value) || null })} />
                                         <MetricInput label="CPA" name="cpa" value={postMetrics.cpa} onChange={e => setPostMetrics({ ...postMetrics, cpa: parseFloat(e.target.value) || null })} />
                                     </div>
                                     <div>
                                         <label className="block text-sm font-medium">Result</label>
                                         <select value={result} onChange={e => setResult(e.target.value as ChangeResult)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                             {Object.values(ChangeResult).map(r => <option key={r} value={r}>{r}</option>)}
                                         </select>
                                     </div>
                                      <div>
                                         <label className="block text-sm font-medium">Result Summary</label>
                                         <textarea value={resultSummary} onChange={e => setResultSummary(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                     </div>
                                     <Button onClick={handleUpdate}>Update Impact</Button>
                                </div>
                              ) : (
                                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <p className="font-semibold">Result Summary</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{log.resultSummary || "No summary provided."}</p>
                                  </div>
                              )}
                         </div>
                         <div className="min-h-[300px]">
                            <h3 className="text-lg font-semibold mb-2">Performance Comparison</h3>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
                                        <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}/>
                                        <Legend />
                                        <Bar dataKey="Before" fill="#FBBC05" />
                                        <Bar dataKey="After" fill="#34A853" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-sm text-gray-500">Post-change data not available for comparison.</p>
                            }
                        </div>
                    </div>
                    
                    {/* Comments */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center mb-2"><MessageSquare size={18} className="mr-2" /> Discussion</h3>
                        <div className="space-y-3">
                            {log.comments.map(comment => (
                                <div key={comment.id} className="flex items-start space-x-3 text-sm">
                                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p>
                                          <span className="font-semibold text-gray-800 dark:text-white">{comment.userName}</span>
                                          <span className="text-gray-400 ml-2 text-xs">{new Date(comment.timestamp).toLocaleString()}</span>
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {canEdit && (
                            <form onSubmit={handleAddComment} className="mt-4 flex items-start space-x-3">
                                <UserIcon className="h-5 w-5 text-gray-400 mt-2.5" />
                                <div className="flex-1">
                                    <textarea 
                                        rows={2}
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    <Button type="submit" size="sm" className="mt-2">Post Comment</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeLogItem;
