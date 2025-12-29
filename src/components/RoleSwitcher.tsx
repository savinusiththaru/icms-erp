'use client';

import { useAuth, UserRole } from '@/context/AuthContext';
import { Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function RoleSwitcher() {
    const { user, switchRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const roles: UserRole[] = ['Super Admin', 'Admin', 'Employee'];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-body)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'var(--text-dark)'
                }}
            >
                <Shield size={16} color="var(--primary)" />
                <span>{user.role}</span>
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    width: '180px',
                    zIndex: 100,
                    padding: '4px'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        padding: '8px',
                        borderBottom: '1px solid var(--border-light)'
                    }}>
                        Switch Role
                    </div>
                    {roles.map(role => (
                        <button
                            key={role}
                            onClick={() => {
                                switchRole(role);
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px',
                                fontSize: '0.85rem',
                                color: user.role === role ? 'var(--primary)' : 'var(--text-main)',
                                backgroundColor: user.role === role ? 'var(--bg-body)' : 'transparent',
                                borderRadius: '4px',
                            }}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
