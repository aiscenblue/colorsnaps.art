import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDecryptedCurrentUser, authSlice } from '@/lib/redux';
import { MainApp } from '@/app/MainApp';

export const AppContainer = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectDecryptedCurrentUser);

    useEffect(() => {
        const loadUserFromToken = async () => {
            const token = localStorage.getItem('pins_token');
            if (token) {
                const response = await fetch('/api/auth/user', {
                    headers: {
                        'Authorization': token
                    }
                });
                const user = await response.json();
                if (user) {
                    dispatch(authSlice.actions.loginSuccess(user));
                }
            }
        };
        loadUserFromToken();
    }, [dispatch]);

    const handleLogout = () => { 
        localStorage.removeItem('pins_token');
        dispatch(authSlice.actions.logout()); 
    };

    return <MainApp user={currentUser} onLogout={handleLogout} />;
}
