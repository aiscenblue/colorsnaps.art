import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedAuthBackground } from '@/app/components/AnimatedAuthBackground';
import { AuthFormContainer } from '@/app/components/AuthFormContainer';



export const AuthPage = ({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) => {
    const router = useRouter();

    useEffect(() => {
        const redirectPath = localStorage.getItem('redirectPath');
        if (redirectPath) {
            localStorage.removeItem('redirectPath');
            router.push(redirectPath);
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-serif relative overflow-hidden">
            <AnimatedAuthBackground />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>
            <AuthFormContainer onLoginSuccess={onLoginSuccess} />
        </div>
    );
};
