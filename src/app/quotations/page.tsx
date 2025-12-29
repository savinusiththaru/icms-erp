'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

interface Quotation {
    id: string;
    clientName: string;
    companyName: string;
    date: string;
    expiryDate: string;
    totalAmount: number;
    status: string;
}

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { can } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        clientName: '',
        companyName: '',
        date: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 0,
        status: 'Draft'
    });

    const fetchQuotations = () => {
        fetch('/api/quotations')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setQuotations(data);
                } else {
                    setQuotations([]);
                }
            })
            .catch(err => {
                console.error(err);
                setQuotations([]);
            });
    };

    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        fetchQuotations();

        // Fetch Clients for dropdown
        fetch('/api/contacts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setClients(data.filter((c: any) => c.type === 'Client' || c.type === 'Partner'));
                }
            })
            .catch(err => console.error('Failed to fetch clients', err));
    }, []);

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/quotations', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    date: new Date(formData.date).toISOString(),
                    expiryDate: new Date(formData.expiryDate).toISOString()
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                fetchQuotations();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save quotation', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quotation?')) return;
        try {
            const res = await fetch(`/api/quotations?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchQuotations();
        } catch (error) {
            console.error('Failed to delete quotation', error);
        }
    };

    const handleEdit = (q: Quotation) => {
        setFormData({
            clientName: q.clientName,
            companyName: q.companyName,
            date: q.date.split('T')[0],
            expiryDate: q.expiryDate.split('T')[0],
            totalAmount: q.totalAmount,
            status: q.status
        });
        setEditingId(q.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            clientName: '',
            companyName: '',
            date: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalAmount: 0,
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
            case 'Accepted': return styles.statusAccepted;
            case 'Rejected': return styles.statusRejected;
            default: return '';
        }
    };

    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const filteredQuotations = quotations.filter(quote => {
        if (filterStatus === 'All') return true;
        return quote.status === filterStatus;
    });

    const handleFilterSelect = (status: string) => {
        setFilterStatus(status);
        setShowFilterMenu(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Quotations</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Create and manage client quotations
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
                                {['All', 'Draft', 'Sent', 'Accepted', 'Rejected'].map(status => (
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

                    {can('manage_quotations') ? (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            New Quotation
                        </button>
                    ) : null}
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Date</th>
                            <th>Expiry</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotations.map((quote) => (
                            <tr key={quote.id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{quote.id}</td>
                                <td>
                                    <div style={{ fontWeight: '500' }}>{quote.clientName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quote.companyName}</div>
                                </td>
                                <td>{new Date(quote.date).toLocaleDateString()}</td>
                                <td>{new Date(quote.expiryDate).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 600 }}>LKR {quote.totalAmount.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className={styles.actionBtn} onClick={() => handleEdit(quote)} title="Edit">Edit</button>
                                        <button className={styles.actionBtn} onClick={() => handleDelete(quote.id)} style={{ color: '#ef4444' }} title="Delete">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Quotation" : "New Quotation"}>
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
                            <label className={formStyles.label}>Date</label>
                            <input
                                className={formStyles.input}
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Expiry Date</label>
                            <input
                                className={formStyles.input}
                                type="date"
                                required
                                value={formData.expiryDate}
                                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Total Amount</label>
                        <input
                            className={formStyles.input}
                            type="number"
                            required
                            min="0"
                            value={formData.totalAmount}
                            onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
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
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>
                            {editingId ? 'Save Changes' : 'Create Quotation'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
