'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { ICONS } from '@/lib/utils';

import { User } from '@/lib/redux';

export const AuthFormContainer = ({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) => {
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [captchaNums, setCaptchaNums] = useState({ a: 0, b: 0 });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (mode === 'register' && hasMounted) setCaptchaNums({ a: Math.ceil(Math.random() * 10), b: Math.ceil(Math.random() * 10) });
    }, [mode, hasMounted]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); setMessage('');
        let result;
        if (mode === 'register') {
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passRegex.test(password)) {
                setError("Password needs 8+ chars, 1 uppercase, 1 lowercase, 1 number.");
                return;
            }
            if (password !== confirmPassword) { setError("Passwords do not match."); return; }
            if (parseInt(captcha) !== captchaNums.a + captchaNums.b) { setError("Incorrect captcha answer."); return; }
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            result = await response.json();
        } else if (mode === 'login') {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier: email, password })
            });
            result = await response.json();
        } else {
            setMessage('Password reset link sent (simulation).'); return;
        }
        if (result.success && result.token) onLoginSuccess(result.token);
        else if (result.message) setError(result.message);
    };

    return (
        <div className="relative z-20 bg-white/80 p-10 rounded-lg shadow-none border-4 border-primary w-full max-w-md backdrop-blur-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-3xl font-bold text-center text-accent">{mode === 'login' ? 'Login to Color Snaps' : mode === 'register' ? 'Create Account' : 'Reset Password'}</h2>
                {mode === 'register' && <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-3 border-2 border-primary rounded-md text-accent" />}
                <input type="text" placeholder={mode === 'login' ? "Username or Email" : "Email"} value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border-2 border-primary rounded-md text-accent" />
                {mode !== 'forgot' && <div className="relative"><input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border-2 border-primary rounded-md text-accent" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-secondary"><Icon path={showPassword ? ICONS.eyeOff : ICONS.eye} /></button></div>}
                {mode === 'register' && <div className="relative"><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 border-2 border-primary rounded-md text-accent" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-secondary"><Icon path={showConfirmPassword ? ICONS.eyeOff : ICONS.eye} /></button></div>}
                {mode === 'register' && <p className="text-xs text-secondary">Password must be 8+ characters and include an uppercase, lowercase, and number.</p>}
                {mode === 'register' && hasMounted && <div className="flex items-center gap-4"><label className="font-semibold text-accent">{`${captchaNums.a} + ${captchaNums.b} = ?`}</label><input type="number" placeholder="Answer" value={captcha} onChange={e => setCaptcha(e.target.value)} required className="w-full px-4 py-3 border-2 border-primary rounded-md text-accent" /></div>}
                {error && <p className="text-red-600 text-center font-semibold">{error}</p>}
                {message && <p className="text-green-600 text-center font-semibold">{message}</p>}
                <button type="submit" className="w-full bg-accent text-background font-bold py-3 rounded-md hover:bg-primary-dark mt-4">{mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Send Reset Link'}</button>
            </form>
            <div className="text-center mt-6 text-secondary">
                {mode === 'login' && <><p>No account? <button onClick={() => setMode('register')} className="text-accent font-semibold hover:underline">Register</button></p><button onClick={() => setMode('forgot')} className="text-sm mt-2 hover:underline">Forgot Password?</button></>}
                {mode === 'register' && <p>Already have an account? <button onClick={() => setMode('login')} className="text-accent font-semibold hover:underline">Login</button></p>}
                {mode === 'forgot' && <p><button onClick={() => setMode('login')} className="text-accent font-semibold hover:underline">Back to Login</button></p>}
            </div>
        </div>
    );
};
