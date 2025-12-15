'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    date: string;
    method: string;
    status: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const { can } = useAuth();

    useEffect(() => {
        fetch('/api/payments')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted = data.map((p: any) => ({
                        ...p,
                        date: new Date(p.date).toLocaleDateString(),
                    }));
                    setPayments(formatted);
                } else {
                    setPayments([]);
                }
            })
            .catch(err => {
                console.error(err);
                setPayments([]);
            });
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        invoiceId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        status: 'Completed'
    });

    const fetchPayments = () => {
        fetch('/api/payments')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted = data.map((p: any) => ({
                        ...p,
                        date: new Date(p.date).toLocaleDateString(),
                    }));
                    setPayments(formatted);
                } else {
                    setPayments([]);
                }
            })
            .catch(err => console.error(err));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/payments', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    date: new Date(formData.date).toISOString()
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                fetchPayments();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save payment', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment?')) return;
        try {
            const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchPayments();
        } catch (error) {
            console.error('Failed to delete payment', error);
        }
    };

    const handleEdit = (pay: Payment) => {
        setFormData({
            invoiceId: pay.invoiceId,
            amount: pay.amount,
            date: new Date().toISOString().split('T')[0], // Simplified
            method: pay.method,
            status: pay.status
        });
        setEditingId(pay.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            invoiceId: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            method: 'Bank Transfer',
            status: 'Completed'
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Completed': return styles.statusCompleted;
            case 'Pending': return styles.statusPending;
            case 'Failed': return styles.statusFailed;
            default: return '';
        }
    };

    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const filteredPayments = payments.filter(pay => {
        if (filterStatus === 'All') return true;
        return pay.status === filterStatus;
    });

    const handleFilterSelect = (status: string) => {
        setFilterStatus(status);
        setShowFilterMenu(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Payments</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Record and view payment history
                    </p>
                </div>
                <div className={styles.controls}>
                    <div className={styles.filterContainer}>
                        <button
                            className="btn"
                            style={{ border: '1px solid var(--border-medium)', background: 'white', color: filterStatus !== 'All' ? 'var(--primary)' : 'inherit' }}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <Filter size={18} style={{ marginRight: '8px' }} />
                            {filterStatus === 'All' ? 'Filter' : filterStatus}
                        </button>
                        {showFilterMenu && (
                            <div className={styles.dropdownMenu}>
                                {['All', 'Completed', 'Pending', 'Failed'].map(status => (
                                    <button
                                        key={status}
                                        className={`${styles.dropdownItem} ${filterStatus === status ? styles.active : ''}`}
                                        onClick={() => handleFilterSelect(status)}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Record Payment
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Invoice</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((pay) => (
                            <tr key={pay.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pay.id}</td>
                                <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{pay.invoiceId}</td>
                                <td>{pay.date}</td>
                                <td>{pay.method}</td>
                                <td style={{ fontWeight: 600 }}>LKR {pay.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(pay.status)}`}>
                                        {pay.status}
                                    </span>
                                </td>
                                <td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className={styles.actionBtn} onClick={() => handleEdit(pay)} title="Edit">Edit</button>
                                            <button className={styles.actionBtn} onClick={() => handleDelete(pay.id)} style={{ color: '#ef4444' }} title="Delete">Delete</button>
                                        </div>
                                    </td>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Payment" : "Record Payment"}>
                <form onSubmit={handleCreate} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Invoice ID</label>
                        <input
                            className={formStyles.input}
                            required
                            value={formData.invoiceId}
                            onChange={e => setFormData({ ...formData, invoiceId: e.target.value })}
                            placeholder="e.g. INV-2023-001"
                        />
                    </div>
                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Amount (LKR)</label>
                            <input
                                className={formStyles.input}
                                type="number"
                                required
                                min="0"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Date</label>
                            <input
                                className={formStyles.input}
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Payment Method</label>
                            <select
                                className={formStyles.input}
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Cash">Cash</option>
                                <option value="Check">Check</option>
                            </select>
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Status</label>
                            <select
                                className={formStyles.input}
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                    </div>
                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>
                            {editingId ? 'Save Changes' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
}
