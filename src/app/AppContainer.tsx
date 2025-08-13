import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDecryptedCurrentUser, authSlice, pinsSlice, User } from '@/lib/redux';
import DataService from '@/lib/data-service';
import { AuthPage } from '@/app/AuthPage';
import { MainApp } from '@/app/MainApp';

export const AppContainer = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectDecryptedCurrentUser);

    useEffect(() => {
        const user = DataService.getCurrentUser();
        if (user) {
            dispatch(authSlice.actions.loginSuccess(user));
            const pins = DataService.getPins();
            dispatch(pinsSlice.actions.setPins(pins));
            const savedIds = DataService.getSavedPinIds(user.id) as Set<string>;
            dispatch(pinsSlice.actions.setSavedPinIds(Array.from(savedIds)));
        }
    }, [dispatch]);

    const handleLogin = (user: User) => dispatch(authSlice.actions.loginSuccess(user));
    const handleLogout = () => { DataService.logout(); dispatch(authSlice.actions.logout()); };

    if (!currentUser) return <AuthPage onLoginSuccess={handleLogin} />;
    return <MainApp user={currentUser} onLogout={handleLogout} />;
}
