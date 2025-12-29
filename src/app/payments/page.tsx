'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, CreditCard, CheckCircle } from 'lucide-react';
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

interface Invoice {
    id: string;
    clientName: string;
    companyName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: string;
    reportStatus?: 'Released' | 'Pending';
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]); // Store all invoices
    const { can } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [payRes, invRes] = await Promise.all([
                fetch('/api/payments'),
                fetch('/api/invoices')
            ]);

            if (payRes.ok) {
                const data = await payRes.json();
                if (Array.isArray(data)) {
                    // Keep the data as is, don't format date for state storage
                    setPayments(data);
                }
            }

            if (invRes.ok) {
                const data = await invRes.json();
                if (Array.isArray(data)) {
                    setInvoices(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        invoiceId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        status: 'Completed'
    });

    // Released invoices that are not fully paid
    const pendingInvoices = invoices.filter(inv => {
        const reportStatus = inv.reportStatus || (['Sent', 'Paid', 'Overdue'].includes(inv.status) ? 'Released' : 'Pending');
        return reportStatus === 'Released' && inv.status !== 'Paid';
    });

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
                    date: new Date(formData.date).toISOString() // Ensure we send ISO string
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                fetchData(); // Refresh both lists
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
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Failed to delete payment', error);
        }
    };

    const handleEdit = (pay: Payment) => {
        // Safe date parsing for the input field (requires YYYY-MM-DD)
        let dateVal = new Date().toISOString().split('T')[0];
        try {
            if (pay.date) {
                dateVal = new Date(pay.date).toISOString().split('T')[0];
            }
        } catch (e) {
            console.warn('Invalid date in payment record:', pay.date);
        }

        setFormData({
            invoiceId: pay.invoiceId,
            amount: pay.amount,
            date: dateVal,
            method: pay.method,
            status: pay.status
        });
        setEditingId(pay.id);
        setIsModalOpen(true);
    };

    const handlePayInvoice = (inv: Invoice) => {
        setFormData({
            invoiceId: inv.id,
            amount: inv.amount, // Default to full amount
            date: new Date().toISOString().split('T')[0],
            method: 'Bank Transfer',
            status: 'Completed'
        });
        setEditingId(null);
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

            {/* Pending Invoices Section */}
            {pendingInvoices.length > 0 && (
                <div className={styles.section} style={{ marginBottom: '2rem' }}>
                    <div className={styles.sectionTitle} style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={18} color="var(--primary)" />
                        Pending Payments (Released Invoices)
                    </div>
                    <div className={styles.tableContainer} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingInvoices.map(inv => (
                                    <tr key={inv.id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</td>
                                        <td>{inv.clientName}</td>
                                        <td style={{ fontWeight: 600 }}>LKR {inv.amount.toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handlePayInvoice(inv)}
                                                style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                            >
                                                Pay Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className={styles.sectionTitle} style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Payment History
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
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((pay) => (
                                <tr key={pay.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pay.id}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{pay.invoiceId}</td>
                                    <td>
                                        {/* Format the date here for display */}
                                        {pay.date ? new Date(pay.date).toLocaleDateString() : '-'}
                                    </td>
                                    <td>{pay.method}</td>
                                    <td style={{ fontWeight: 600 }}>LKR {pay.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${getStatusClass(pay.status)}`}>
                                            {pay.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className={styles.actionBtn} onClick={() => handleEdit(pay)} title="Edit">Edit</button>
                                            <button className={styles.actionBtn} onClick={() => handleDelete(pay.id)} style={{ color: '#ef4444' }} title="Delete">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No payment history found.
                                </td>
                            </tr>
                        )}
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
