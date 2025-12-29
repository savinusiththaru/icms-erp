'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import styles from './page.module.css';
import formStyles from '@/styles/Forms.module.css';
import Modal from '@/components/Modal';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    type: 'Client' | 'Vendor' | 'Partner';
    address?: string;
}

export default function VendorsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state - Default to Vendor
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'Vendor',
        address: ''
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            const data = await res.json();
            if (Array.isArray(data)) setContacts(data);
        } catch (error) {
            console.error('Failed to fetch contacts', error);
        }
    };

    // Filter only Vendors
    const filteredContacts = contacts.filter(c => c.type === 'Vendor');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    type: 'Vendor',
                    address: ''
                });
                fetchContacts();
            }
        } catch (error) {
            console.error('Failed to create vendor', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this vendor?')) return;
        try {
            await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
            fetchContacts();
        } catch (error) {
            console.error('Failed to delete vendor', error);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Vendors</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your suppliers and vendors</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Vendor
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredContacts.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        No vendors found. Click "Add Vendor" to create one.
                    </div>
                ) : (
                    filteredContacts.map(contact => (
                        <div key={contact.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                            <button
                                onClick={() => handleDelete(contact.id)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%', background: '#ccfbf1', // Teal for vendors
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', fontWeight: '600', color: '#0f766e'
                                }}>
                                    {contact.name[0]}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{contact.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{contact.company}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                    {contact.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                    <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                    {contact.phone}
                                </div>
                                {contact.address && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                        <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                                        {contact.address}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vendor">
                <form onSubmit={handleCreate} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Vendor Name</label>
                        <input className={formStyles.input} required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Vendor Name" />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Company/Entity</label>
                        <input className={formStyles.input} required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Company Name" />
                    </div>

                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Email</label>
                            <input className={formStyles.input} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@vendor.com" />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Phone</label>
                            <input className={formStyles.input} required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Address</label>
                        <input className={formStyles.input} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="123 Vendor St, City" />
                    </div>

                    {/* Hidden Type Field - Always Vendor */}
                    <input type="hidden" value="Vendor" />

                    <div className={formStyles.actions}>
                        <button type="button" className={formStyles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className={formStyles.btnSubmit}>Add Vendor</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
