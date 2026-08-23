// components/Admin/ProtectedRoute.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'manager' | 'technician' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                console.log('🔒 Not authenticated, redirecting to login...');
                router.replace('/login');
                return;
            }

            if (requiredRole && user) {
                const hasRequiredRole = user.role === requiredRole || user.role === 'admin';
                if (!hasRequiredRole) {
                    console.log('🔒 Insufficient role, redirecting...');
                    router.replace('/dashboard');
                    return;
                }
            }
        }
    }, [isLoading, isAuthenticated, user, router, requiredRole]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060b13]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-emerald-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && user) {
        const hasRequiredRole = user.role === requiredRole || user.role === 'admin';
        if (!hasRequiredRole) {
            return null;
        }
    }

    return <>{children}</>;
}