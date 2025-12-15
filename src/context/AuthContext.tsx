'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'Super Admin' | 'Admin' | 'Employee';

interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => void;
    signup: (name: string, email: string, password: string, role: UserRole) => void;
    logout: () => void;
    switchRole: (role: UserRole) => void;
    can: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for saved user on mount
    useEffect(() => {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            setUser(JSON.parse(saved));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => { // Changed signature
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Login failed');
                return;
            }

            const user = await res.json();
            setUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            router.push('/');
        } catch (error) {
            console.error('Login error:', error);
            alert('An unexpected error occurred');
        }
    };

    const signup = async (name: string, email: string, password: string, role: UserRole) => { // Changed signature
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Signup failed');
                return;
            }

            const user = await res.json();
            setUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            router.push('/');
        } catch (error) {
            console.error('Signup error:', error);
            alert('An unexpected error occurred');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        router.push('/login');
    };

    const switchRole = (role: UserRole) => {
        if (!user) return;
        const newUser = { ...user, role };
        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
    };

    const can = (action: string): boolean => {
        if (!user) return false;
        if (user.role === 'Super Admin') return true;

        switch (action) {
            case 'manage_payments':
            case 'delete_records':
                return false;

            case 'manage_invoices':
            case 'manage_employees':
            case 'manage_settings':
                return user.role === 'Admin';

            case 'view_finance':
            case 'view_quotations':
            case 'view_employees':
                return user.role !== 'Employee';

            default:
                return true;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, switchRole, can }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
