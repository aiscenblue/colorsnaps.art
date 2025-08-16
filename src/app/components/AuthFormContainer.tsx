'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { ICONS } from '@/lib/utils';



export const AuthFormContainer = ({ defaultMode }: { defaultMode?: 'login' | 'register' | 'forgot' }) => {
    const [mode, setMode] = useState(defaultMode || 'login');
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
                if (result.success && result.token) return result.token;
        else if (result.message) setError(result.message);
        return null;
    };

    return (
        <div className="relative z-20 bg-gray-900 p-10 rounded-lg shadow-lg border-2 border-white w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-3xl font-bold text-center text-white">{mode === 'login' ? 'Login to Color Snaps' : mode === 'register' ? 'Create Account' : 'Reset Password'}</h2>
                {mode === 'register' && <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-700 rounded-md text-white bg-gray-800 placeholder-white" />}
                <input type="text" placeholder={mode === 'login' ? "Username or Email" : "Email"} value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-700 rounded-md text-white bg-gray-800 placeholder-white" />
                {mode !== 'forgot' && <div className="relative"><input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-700 rounded-md text-white bg-gray-800 placeholder-white" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-300"><Icon path={showPassword ? ICONS.eyeOff : ICONS.eye} /></button></div>}
                {mode === 'register' && <div className="relative"><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-700 rounded-md text-white bg-gray-800 placeholder-white" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-300"><Icon path={showConfirmPassword ? ICONS.eyeOff : ICONS.eye} /></button></div>}
                {mode === 'register' && <p className="text-xs text-gray-300">Password must be 8+ characters and include an uppercase, lowercase, and number.</p>}
                {mode === 'register' && hasMounted && <div className="flex items-center gap-4"><label className="font-semibold text-accent">{`${captchaNums.a} + ${captchaNums.b} = ?`}</label><input type="number" placeholder="Answer" value={captcha} onChange={e => setCaptcha(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-700 rounded-md text-white bg-gray-800 placeholder-white" /></div>}
                {error && <p className="text-red-400 text-center font-semibold">{error}</p>}
                {message && <p className="text-green-400 text-center font-semibold">{message}</p>}
                <button type="submit" className="w-full bg-transparent border-2 border-white text-white font-bold py-3 rounded-md hover:bg-white hover:text-gray-900 mt-4">{mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Send Reset Link'}</button>
            </form>
            <div className="text-center mt-6 text-gray-300">
                {mode === 'login' && <><p>No account? <button onClick={() => setMode('register')} className="text-white font-semibold hover:underline">Register</button></p><button onClick={() => setMode('forgot')} className="text-sm mt-2 hover:underline">Forgot Password?</button></>}
                {mode === 'register' && <p>Already have an account? <button onClick={() => setMode('login')} className="text-white font-semibold hover:underline">Login</button></p>}
                {mode === 'forgot' && <p><button onClick={() => setMode('login')} className="text-white font-semibold hover:underline">Back to Login</button></p>}
            </div>
        </div>
    );
};
