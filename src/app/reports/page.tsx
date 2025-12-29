'use client';

import { useState, useEffect } from 'react';
import { Filter, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

interface Invoice {
    id: string;
    clientName: string;
    companyName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: string;
    reportStatus: 'Released' | 'Pending'; // Persisted or Derived
}

export default function ReportsPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = () => {
        fetch('/api/invoices')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const formatted = data.map((inv: any) => {
                        // Logic for Report Status: Use persisted if exists, else derive
                        let reportStatus = inv.reportStatus;
                        // Determine default if not set
                        if (!reportStatus) {
                            reportStatus = ['Sent', 'Paid', 'Overdue'].includes(inv.status) ? 'Released' : 'Pending';
                        }
                        return {
                            ...inv,
                            issueDate: new Date(inv.issueDate).toLocaleDateString(),
                            dueDate: new Date(inv.dueDate).toLocaleDateString(),
                            reportStatus
                        };
                    });
                    setInvoices(formatted);

                    // Calculate Revenue: Sum of 'Paid' invoices
                    const totalRevenue = data.reduce((sum: number, inv: any) => sum + (inv.status === 'Paid' ? (inv.amount || 0) : 0), 0);
                    setRevenue(totalRevenue);

                } else {
                    setInvoices([]);
                    setRevenue(0);
                }
            })
            .catch(err => {
                console.error(err);
                setInvoices([]);
                setRevenue(0);
            });
    };

    const handleStatusUpdate = async (inv: Invoice) => {
        if (updatingId) return; // Prevent double clicks
        const newStatus = inv.reportStatus === 'Released' ? 'Pending' : 'Released';
        setUpdatingId(inv.id);

        try {
            // Optimistic update
            const updatedInvoices = invoices.map(i =>
                i.id === inv.id ? { ...i, reportStatus: newStatus as 'Released' | 'Pending' } : i
            );
            setInvoices(updatedInvoices);

            const res = await fetch('/api/invoices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Only send ID and the field we want to update.
                // The PUT endpoint expects an ID and spreads the rest of the body into the update.
                body: JSON.stringify({
                    id: inv.id,
                    reportStatus: newStatus,
                    activityDescription: `Changed report status to ${newStatus} for invoice ${inv.id}`
                })
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update report status:', error);
            // Revert changes on error logic could be added here, 
            // but for now we just re-fetch to ensure sync
            fetchInvoices();
            alert('Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        if (filterStatus === 'All') return true;
        return inv.reportStatus === filterStatus;
    });

    const handleFilterSelect = (status: string) => {
        setFilterStatus(status);
        setShowFilterMenu(false);
    };

    const getReportStatusClass = (status: string) => {
        return status === 'Released' ? styles.statusReleased : styles.statusPending;
    };

    // Helper to get original invoice status class for reference
    const getInvoiceStatusClass = (status: string) => {
        switch (status) {
            case 'Draft': return styles.statusDraft;
            case 'Sent': return styles.statusSent;
            case 'Paid': return styles.statusPaid;
            case 'Overdue': return styles.statusOverdue;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Financial Reports</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Overview of Released and Pending Invoices
                    </p>
                </div>
                <div className={styles.controls}>
                    <div className={styles.filterContainer}>
                        <button
                            className="btn"
                            style={{ border: '1px solid var(--border-medium)', background: 'white', color: filterStatus !== 'All' ? 'var(--primary)' : 'inherit', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <Filter size={18} style={{ marginRight: '8px' }} />
                            {filterStatus === 'All' ? 'Filter Status' : filterStatus}
                        </button>
                        {showFilterMenu && (
                            <div className={styles.dropdownMenu}>
                                {['All', 'Released', 'Pending'].map(status => (
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
                </div>
            </div>

            {/* Revenue Card Section */}
            <div className={styles.grid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricTitle}>Total Revenue</div>
                    <div className={styles.metricValue}>LKR {revenue.toLocaleString()}</div>
                    <div className={`${styles.metricTrend} ${styles.trendUp}`}>
                        <TrendingUp size={16} />
                        <span>Updated just now</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Company</th>
                            <th>Amount</th>
                            <th>Invoice Status</th>
                            <th>Report Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{inv.companyName}</div>
                                        {/* Optional: Show Client Name too if needed */}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>LKR {inv.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${getInvoiceStatusClass(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.statusBadge} ${getReportStatusClass(inv.reportStatus)}`}
                                            onClick={() => handleStatusUpdate(inv)}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            title="Click to toggle status"
                                        >
                                            {inv.reportStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
