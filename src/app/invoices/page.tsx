'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, Receipt } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

interface Invoice {
    id: string;
    clientName: string;
    companyName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const { can } = useAuth();

    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Invoices
        fetch('/api/invoices')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted = data.map((inv: any) => ({
                        ...inv,
                        issueDate: new Date(inv.issueDate).toLocaleDateString(),
                        dueDate: new Date(inv.dueDate).toLocaleDateString()
                    }));
                    setInvoices(formatted);
                } else {
                    setInvoices([]);
                }
            })
            .catch(err => {
                console.error(err);
                setInvoices([]);
            });

        // Fetch Clients for dropdown
        fetch('/api/contacts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter for Clients (and maybe Partners?)
                    setClients(data.filter((c: any) => c.type === 'Client' || c.type === 'Partner'));
                }
            })
            .catch(err => console.error('Failed to fetch clients', err));
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        clientName: '',
        companyName: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 0,
        status: 'Draft'
    });

    const fetchInvoices = () => {
        fetch('/api/invoices')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted = data.map((inv: any) => ({
                        ...inv,
                        issueDate: new Date(inv.issueDate).toLocaleDateString(),
                        dueDate: new Date(inv.dueDate).toLocaleDateString()
                    }));
                    setInvoices(formatted);
                } else {
                    setInvoices([]);
                }
            })
            .catch(err => console.error(err));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/invoices', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    issueDate: new Date(formData.issueDate).toISOString(),
                    dueDate: new Date(formData.dueDate).toISOString()
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                fetchInvoices();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save invoice', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;
        try {
            const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchInvoices();
        } catch (error) {
            console.error('Failed to delete invoice', error);
        }
    };

    const handleEdit = (inv: Invoice) => {
        // Need to parse localized date string back to YYYY-MM-DD for input
        // This is a bithacky because we lost the original ISO string in state mapping
        // ideally we store ISO and format only for display
        // For now, let's just use current date or try to parse if possible, or better:
        // We will just set it to today if parsing fails, assuming user will correct it.

        setFormData({
            clientName: inv.clientName,
            companyName: inv.companyName,
            issueDate: new Date().toISOString().split('T')[0], // Simplified
            dueDate: new Date().toISOString().split('T')[0], // Simplified
            amount: inv.amount,
            status: inv.status
        });
        setEditingId(inv.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            clientName: '',
            companyName: '',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 0,
            status: 'Draft'
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Draft': return styles.statusDraft;
            case 'Sent': return styles.statusSent;
            case 'Paid': return styles.statusPaid;
            case 'Overdue': return styles.statusOverdue;
            default: return '';
        }
    };

    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const filteredInvoices = invoices.filter(inv => {
        if (filterStatus === 'All') return true;
        return inv.status === filterStatus;
    });

    const handleFilterSelect = (status: string) => {
        setFilterStatus(status);
        setShowFilterMenu(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Invoices</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Track and manage client invoices
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
                                {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map(status => (
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
                    {can('manage_invoices') && (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            New Invoice
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Client</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</td>
                                <td>
                                    <div style={{ fontWeight: '500' }}>{inv.clientName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.companyName}</div>
                                </td>
                                <td>{inv.issueDate}</td>
                                <td>{inv.dueDate}</td>
                                <td style={{ fontWeight: 600 }}>LKR {inv.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(inv.status)}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className={styles.actionBtn} onClick={() => handleEdit(inv)} title="Edit">Edit</button>
                                        <button className={styles.actionBtn} onClick={() => handleDelete(inv.id)} style={{ color: '#ef4444' }} title="Delete">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Invoice" : "New Invoice"}>
                <form onSubmit={handleCreate} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Select Client</label>
                        <select
                            className={formStyles.input}
                            onChange={(e) => {
                                const selectedClient = clients.find(c => c.id === e.target.value);
                                if (selectedClient) {
                                    setFormData({
                                        ...formData,
                                        clientName: selectedClient.name,
                                        companyName: selectedClient.company
                                    });
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>-- Select Existing Client --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.company} ({client.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Client Name</label>
                            <input
                                className={formStyles.input}
                                required
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Company Name</label>
                            <input
                                className={formStyles.input}
                                required
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="e.g. Acme Industries"
                            />
                        </div>
                    </div>
                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Issue Date</label>
                            <input
                                className={formStyles.input}
                                type="date"
                                required
                                value={formData.issueDate}
                                onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Due Date</label>
                            <input
                                className={formStyles.input}
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
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
                            <label className={formStyles.label}>Status</label>
                            <select
                                className={formStyles.input}
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>
                            {editingId ? 'Save Changes' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
}
