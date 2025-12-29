'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Box, Package, User } from 'lucide-react';
import styles from './page.module.css'; // Reusing generic style if possible or we'll inline simple styles 
import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

// Types (Ideally import from index.ts, but defining locally for clear context in this file for now if simple)
interface RentalItem {
    id: string;
    name: string;
    dailyRate: number;
    quantity: number;
    description?: string;
    status: string;
}

interface RentalAgreement {
    id: string;
    clientId: string;
    clientName: string;
    itemId: string;
    itemName: string;
    startDate: string;
    endDate: string;
    dailyRate: number;
    totalCost: number;
    status: string;
}

export default function RentalsPage() {
    const [activeTab, setActiveTab] = useState<'Inventory' | 'Rentals'>('Rentals');

    // Data
    const [inventory, setInventory] = useState<RentalItem[]>([]);
    const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    // Modals
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchInventory();
        fetchAgreements();
        fetchClients();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch('/api/rentals/items');
            const data = await res.json();
            if (Array.isArray(data)) setInventory(data);
        } catch (error) { console.error(error); }
    };

    const fetchAgreements = async () => {
        try {
            const res = await fetch('/api/rentals/agreements');
            const data = await res.json();
            if (Array.isArray(data)) setAgreements(data);
        } catch (error) { console.error(error); }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/contacts');
            const data = await res.json();
            if (Array.isArray(data)) setClients(data.filter((c: any) => c.type === 'Client'));
        } catch (error) { console.error(error); }
    };

    // --- Inventory Form ---
    const [itemForm, setItemForm] = useState({
        name: '',
        dailyRate: '',
        quantity: '',
        description: '',
        status: 'Available'
    });

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/rentals/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...itemForm,
                    dailyRate: Number(itemForm.dailyRate),
                    quantity: Number(itemForm.quantity)
                })
            });
            if (res.ok) {
                setIsItemModalOpen(false);
                fetchInventory();
                setItemForm({ name: '', dailyRate: '', quantity: '', description: '', status: 'Available' });
            }
        } catch (error) { console.error(error); }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        try {
            await fetch(`/api/rentals/items?id=${id}`, { method: 'DELETE' });
            fetchInventory();
        } catch (error) { console.error(error); }
    };


    // --- Agreement Form ---
    const [agreementForm, setAgreementForm] = useState({
        clientId: '',
        clientName: '',
        itemId: '',
        itemName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    // Calculated fields
    const selectedItem = inventory.find(i => i.id === agreementForm.itemId);
    const days = Math.max(1, Math.ceil((new Date(agreementForm.endDate).getTime() - new Date(agreementForm.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const estimatedCost = selectedItem ? selectedItem.dailyRate * days : 0;

    const handleCreateAgreement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        try {
            const res = await fetch('/api/rentals/agreements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...agreementForm,
                    dailyRate: selectedItem.dailyRate,
                    totalCost: estimatedCost,
                })
            });
            if (res.ok) {
                setIsAgreementModalOpen(false);
                fetchAgreements();
                setAgreementForm({
                    clientId: '', clientName: '', itemId: '', itemName: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
            }
        } catch (error) { console.error(error); }
    };


    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Rentals</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage rental inventory and agreements</p>
                </div>

                {activeTab === 'Rentals' ? (
                    <button className="btn btn-primary" onClick={() => setIsAgreementModalOpen(true)}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        New Rental
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={() => setIsItemModalOpen(true)}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Add Inventory
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)' }}>
                {['Rentals', 'Inventory'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        style={{
                            padding: '12px 24px',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                            background: 'none',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {tab === 'Rentals' ? 'Active Rentals' : 'Inventory Items'}
                    </button>
                ))}
            </div>

            {/* --- Rentals Tab Content --- */}
            {activeTab === 'Rentals' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {agreements.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            No active rentals found.
                        </div>
                    ) : (
                        agreements.map(agreement => (
                            <div key={agreement.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{agreement.itemName}</div>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                                        background: agreement.status === 'Active' ? '#dbeafe' : '#f1f5f9',
                                        color: agreement.status === 'Active' ? '#1d4ed8' : '#64748b'
                                    }}>
                                        {agreement.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <User size={16} />
                                    {agreement.clientName}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <Calendar size={16} />
                                    {new Date(agreement.startDate).toLocaleDateString()} - {new Date(agreement.endDate).toLocaleDateString()}
                                </div>
                                <div style={{ marginTop: '8px', fontWeight: '600', textAlign: 'right', color: 'var(--primary)' }}>
                                    Total: LKR {agreement.totalCost.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- Inventory Tab Content --- */}
            {activeTab === 'Inventory' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {inventory.map(item => (
                        <div key={item.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                            <button
                                onClick={() => handleDeleteItem(item.id)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ffe4e6', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={20} />
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginTop: '8px' }}>{item.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.description || 'No description'}</div>
                            <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)' }}>
                                <span style={{ fontWeight: '600' }}>LKR {item.dailyRate}/day</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Add Inventory Item">
                <form onSubmit={handleCreateItem} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Item Name</label>
                        <input className={formStyles.input} required value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} />
                    </div>
                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Daily Rate (LKR)</label>
                            <input className={formStyles.input} type="number" required value={itemForm.dailyRate} onChange={e => setItemForm({ ...itemForm, dailyRate: e.target.value })} />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Quantity</label>
                            <input className={formStyles.input} type="number" required value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} />
                        </div>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Description</label>
                        <input className={formStyles.input} value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} />
                    </div>
                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsItemModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>Add Item</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAgreementModalOpen} onClose={() => setIsAgreementModalOpen(false)} title="New Rental Agreement">
                <form onSubmit={handleCreateAgreement} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Select Client</label>
                        <select className={formStyles.input} required value={agreementForm.clientId} onChange={e => {
                            const c = clients.find(cl => cl.id === e.target.value);
                            if (c) setAgreementForm({ ...agreementForm, clientId: c.id, clientName: c.name });
                        }}>
                            <option value="" disabled>-- Select Client --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
                        </select>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Select Item</label>
                        <select className={formStyles.input} required value={agreementForm.itemId} onChange={e => {
                            const i = inventory.find(inv => inv.id === e.target.value);
                            if (i) setAgreementForm({ ...agreementForm, itemId: i.id, itemName: i.name });
                        }}>
                            <option value="" disabled>-- Select Inventory Item --</option>
                            {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (LKR {i.dailyRate}/day)</option>)}
                        </select>
                    </div>

                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Start Date</label>
                            <input type="date" className={formStyles.input} required value={agreementForm.startDate} onChange={e => setAgreementForm({ ...agreementForm, startDate: e.target.value })} />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>End Date</label>
                            <input type="date" className={formStyles.input} required value={agreementForm.endDate} onChange={e => setAgreementForm({ ...agreementForm, endDate: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', textAlign: 'right', fontWeight: '600' }}>
                        Estimated Total: LKR {estimatedCost.toLocaleString()}
                    </div>

                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsAgreementModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>Create Rental</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
