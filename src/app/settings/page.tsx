'use client';

import { useState, useEffect } from 'react';
import formStyles from '@/styles/Forms.module.css';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        contactEmail: '',
        currency: 'USD'
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch settings on load
    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setFormData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load settings', err);
                setIsLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div style={{ padding: '32px' }}>Loading settings...</div>;

    return (
        <div style={{ padding: '32px', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: 'var(--text-dark)' }}>Settings</h1>

            <div className="card">
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    Company Profile
                </h2>

                <form onSubmit={handleSave} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Company Name</label>
                        <input
                            className={formStyles.input}
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Address</label>
                        <input
                            className={formStyles.input}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className={formStyles.row}>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Contact Email</label>
                            <input
                                className={formStyles.input}
                                type="email"
                                value={formData.contactEmail}
                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                            />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label className={formStyles.label}>Currency</label>
                            <select
                                className={formStyles.input}
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="LKR">LKR (Rs)</option>
                            </select>
                        </div>
                    </div>

                    <div className={formStyles.actions}>
                        <button type="submit" className={formStyles.btnSubmit} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
