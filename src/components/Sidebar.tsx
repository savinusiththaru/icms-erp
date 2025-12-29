'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    Settings,
    Briefcase,
    PieChart,
    Building,
    Package
} from 'lucide-react';
import styles from './Sidebar.module.css';

import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: 'Employees', href: '/employees', icon: Users, permission: 'view_employees' },
    { name: 'Expenses', href: '/expenses', icon: CreditCard, permission: 'view_finance' },
    { name: 'Clients', href: '/clients', icon: Users, permission: 'view_crm' },
    { name: 'Vendors', href: '/vendors', icon: Building, permission: 'view_crm' },
    { name: 'Rentals', href: '/rentals', icon: Package, permission: 'view_inventory' },
    { name: 'Quotations', href: '/quotations', icon: FileText, permission: 'view_quotations' },
    { name: 'Invoices', href: '/invoices', icon: Briefcase, permission: 'view_finance' },
    { name: 'Payments', href: '/payments', icon: CreditCard, permission: 'view_finance' },
    { name: 'Reports', href: '/reports', icon: PieChart, permission: 'view_finance' },
    { name: 'Settings', href: '/settings', icon: Settings, permission: 'manage_settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, can } = useAuth(); // Get user and permissions

    if (!user) return null;

    // Simple permission mapping for sidebar items
    const canView = (item: any) => {
        if (user.role === 'Super Admin') return true;
        if (user.role === 'Admin') return true; // Admins see everything for now

        // Employee restrictions
        if (user.role === 'Employee') {
            if (['Invoices', 'Payments', 'Settings', 'Employees'].includes(item.name)) return false;
            return true;
        }
        return true;
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                {/* <div className={styles.logo}>Compliance ERP</div> */}
                <div style={{ background: 'white', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '50px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="ICMS Logo" style={{ height: '36px', width: 'auto', display: 'block' }} />
                </div>
            </div>

            <nav className={styles.nav}>
                {menuItems.filter(canView).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>{user.avatar}</div>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
