import React from 'react';
import { AnimatedAuthBackground } from '@/app/components/AnimatedAuthBackground';
import { AuthFormContainer } from '@/app/components/AuthFormContainer';

import { User } from '@/lib/redux';

export const AuthPage = ({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-serif relative overflow-hidden">
        <AnimatedAuthBackground />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>
        <AuthFormContainer onLoginSuccess={onLoginSuccess} />
    </div>
);
