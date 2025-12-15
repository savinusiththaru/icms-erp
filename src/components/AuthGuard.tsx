'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const publicRoutes = ['/login', '/signup'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user && !publicRoutes.includes(pathname)) {
                router.push('/login');
            } else if (user && publicRoutes.includes(pathname)) {
                router.push('/');
            }
        }
    }, [user, isLoading, pathname, router]);

    // Show loading or nothing while initializing
    if (isLoading) {
        return null; // Or a loading spinner
    }

    // If not authenticated and on a protected route, show nothing (will redirect)
    if (!user && !publicRoutes.includes(pathname)) {
        return null;
    }

    return <>{children}</>;
}
