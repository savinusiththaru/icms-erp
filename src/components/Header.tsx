'use client';

import { useState } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import styles from './Header.module.css';

export default function Header() {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h2 className={styles.title}>Overview</h2>
            </div>

            <div className={styles.right}>
                <button className={styles.iconButton} onClick={() => alert("Search functionality coming soon!")}>
                    <Search size={20} />
                </button>

                <div className={styles.dropdownContainer}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                    </button>
                    {showNotifications && (
                        <div className={styles.dropdownMenu}>
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No new notifications
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.dropdownContainer}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <User size={20} />
                    </button>
                    {showUserMenu && (
                        <div className={styles.dropdownMenu}>
                            <div className={styles.userProfile}>
                                <div className={styles.userName}>{user?.name || 'User'}</div>
                                <div className={styles.userRole}>{user?.role || 'Guest'}</div>
                            </div>
                            <button className={styles.dropdownItem} onClick={() => alert("Settings coming soon!")}>
                                Settings
                            </button>
                            <button
                                className={styles.dropdownItem}
                                onClick={logout}
                                style={{ color: '#ef4444' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
