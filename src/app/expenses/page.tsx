'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css'; // We'll assume a generic page.module.css or create one? 
// actually reusing page.module.css from employees might be cleaner if I can, but standard nextjs app dir often uses local module.
// Let's reuse the structure but I'll need to define styles.
// For now, I'll assume I can use inline styles or a shared module if available, but to be safe I will create a dedicated module or just use the global/shared patterns I see.
// The employees page used `import styles from './page.module.css';` which was local.
// I will create a simple module css for these pages too.

import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

// Reusing the Expense type from index would be good, but strict typing in file:
interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Office',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch('/api/expenses');
            const data = await res.json();
            if (Array.isArray(data)) setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: Number(formData.amount),
                    date: new Date(formData.date).toISOString() // ensure ISO format
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({
                    description: '',
                    amount: '',
                    category: 'Office',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pending'
                });
                fetchExpenses();
            }
        } catch (error) {
            console.error('Failed to create expense', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this expense?')) return;
        try {
            await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            fetchExpenses();
        } catch (error) {
            console.error('Failed to delete expense', error);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Expenses</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track company expenditure</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Expense
                </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-body)', borderBottom: '1px solid var(--border-light)' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No expenses recorded.
                                </td>
                            </tr>
                        ) : (
                            expenses.map(exp => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{new Date(exp.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{exp.description}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: '#f1f5f9', color: '#475569'
                                        }}>
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                                            background: exp.status === 'Approved' ? '#dcfce7' : exp.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                                            color: exp.status === 'Approved' ? '#166534' : exp.status === 'Rejected' ? '#991b1b' : '#854d0e'
                                        }}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>
                                        LKR {exp.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(exp.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleCreate} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Description</label>
                        <input
                            className={formStyles.input}
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g. Office Supplies"
                        />
                    </div>

                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Amount (LKR)</label>
                            <input
                                type="number"
                                className={formStyles.input}
                                required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Date</label>
                            <input
                                type="date"
                                className={formStyles.input}
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Category</label>
                            <select
                                className={formStyles.input}
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Office">Office</option>
                                <option value="Travel">Travel</option>
                                <option value="Meals">Meals</option>
                                <option value="Software">Software</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Status</label>
                            <select
                                className={formStyles.input}
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>Add Expense</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
