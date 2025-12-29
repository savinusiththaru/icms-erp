'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublic = ['/login', '/signup'].includes(pathname);

    return (
        <AuthGuard>
            {isPublic ? (
                children
            ) : (
                <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
                    <Sidebar />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <Header />
                        <main style={{ flex: 1, overflow: 'auto' }}>
                            {children}
                        </main>
                    </div>
                </div>
            )}
        </AuthGuard>
    );
}
