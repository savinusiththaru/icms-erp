'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, UserRole } from '@/context/AuthContext';
import styles from '@/styles/Forms.module.css';

export default function SignupPage() {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Employee');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length > 0 && name.length > 0) {
            signup(name, email, password, role);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'var(--bg-main)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>Sign Up</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Create your ERP account
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            className={styles.input}
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Create a password"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Role</label>
                        <select
                            className={styles.input}
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                        >
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                            <option value="Super Admin">Super Admin</option>
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            * In a real app, Admin roles would require verification.
                        </p>
                    </div>

                    <button type="submit" className={styles.btnSubmit} style={{ marginTop: '16px' }}>
                        Create Account
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}
