import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChangeCategory, ExpectedImpact, PerformanceMetrics, ChangeLogFormData } from '../types';
import Button from './ui/Button';

interface ChangeLogFormProps {
    onClose: () => void;
}

const today = new Date().toISOString().split('T')[0];

const ChangeLogForm: React.FC<ChangeLogFormProps> = ({ onClose }) => {
    const { accounts, currentUser, addChangeLog } = useAppContext();
    
    const [formData, setFormData] = useState<Omit<ChangeLogFormData, 'loggedById'>>({
        dateOfChange: today,
        accountId: accounts.length > 0 ? accounts[0].id : '',
        campaignName: '',
        category: ChangeCategory.Bidding,
        description: '',
        reason: '',
        expectedImpact: ExpectedImpact.Test,
        preChangeMetrics: { ctr: null, cpc: null, convRate: null, cpa: null },
        nextReviewDate: undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMetricsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            preChangeMetrics: {
                ...prev.preChangeMetrics,
                [name]: value ? parseFloat(value) : null,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            alert("You must be logged in to perform this action.");
            return;
        }
        addChangeLog({ ...formData, loggedById: currentUser.id });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Change</label>
                    <input type="date" name="dateOfChange" value={formData.dateOfChange} onChange={handleChange} required className="mt-1 w-full form-input" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
                    <select name="accountId" value={formData.accountId} onChange={handleChange} required className="mt-1 w-full form-select">
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
                    <input type="text" name="campaignName" value={formData.campaignName} onChange={handleChange} required className="mt-1 w-full form-input" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Change Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className="mt-1 w-full form-select">
                        {Object.values(ChangeCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Change Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="mt-1 w-full form-textarea" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason / Hypothesis</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} required className="mt-1 w-full form-textarea" />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Impact</label>
                    <select name="expectedImpact" value={formData.expectedImpact} onChange={handleChange} required className="mt-1 w-full form-select">
                         {Object.values(ExpectedImpact).map(imp => <option key={imp} value={imp}>{imp}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Next Review Date (Optional)</label>
                    <input type="date" name="nextReviewDate" value={formData.nextReviewDate || ''} onChange={handleChange} className="mt-1 w-full form-input" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pre-change Performance Snapshot</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                   <MetricInputForm label="CTR (%)" name="ctr" value={formData.preChangeMetrics.ctr} onChange={handleMetricsChange} />
                   <MetricInputForm label="CPC" name="cpc" value={formData.preChangeMetrics.cpc} onChange={handleMetricsChange} />
                   <MetricInputForm label="Conv. Rate (%)" name="convRate" value={formData.preChangeMetrics.convRate} onChange={handleMetricsChange} />
                   <MetricInputForm label="CPA" name="cpa" value={formData.preChangeMetrics.cpa} onChange={handleMetricsChange} />
                </div>
            </div>
            
             <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Change Log</Button>
            </div>
            <style jsx>{`
                .form-input, .form-select, .form-textarea {
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    color: #111827;
                    background-color: #fff;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
                .dark .form-input, .dark .form-select, .dark .form-textarea {
                    color: #e5e7eb;
                    background-color: #374151;
                    border-color: #4b5563;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    --tw-ring-color: #4285F4;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                    border-color: #4285F4;
                }
            `}</style>
        </form>
    );
};

const MetricInputForm: React.FC<{ label: string; name: keyof PerformanceMetrics; value: number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input type="number" step="any" name={name} value={value ?? ''} onChange={onChange} className="mt-1 w-full form-input" />
    </div>
);

export default ChangeLogForm;
