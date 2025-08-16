import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Pin, pinsSlice, RootState, User } from '@/lib/redux';
import { PinDetailPage } from './PinDetailPage';
import { PinNotFound } from './PinNotFound';

export const PinDetails = ({ pinId, user, allAvailablePins, onLoginRedirect, scriptsLoaded }: { pinId: string, user: User | null, allAvailablePins: Pin[], onLoginRedirect: (path: string) => void, scriptsLoaded: boolean }) => {
    const [selectedPin, setSelectedPin] = useState<Pin | undefined>();
    const { savedIds } = useSelector((state: RootState) => state.pins);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const fetchPin = async () => {
            const response = await fetch(`/api/pins/${pinId}`);
            if (response.ok) {
                const pin = await response.json();
                setSelectedPin(pin);
            } else {
                setSelectedPin(undefined); // Pin not found
            }
        };
        fetchPin();
    }, [pinId]);

    const isSaved = savedIds.includes(pinId);

    const handleUpdatePin = async (updatedPin: Pin) => {
        dispatch(pinsSlice.actions.updatePin(updatedPin));
        await fetch(`/api/pins/${updatedPin.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedPin)
        });
    };

    const handleSavePin = (pinId: string) => {
        dispatch(pinsSlice.actions.addSavedPinId(pinId));
        // TODO: Save saved pins to API
    };

    const handleRemovePin = (pinId: string) => {
        dispatch(pinsSlice.actions.removePin(pinId));
        dispatch(pinsSlice.actions.removeSavedPinId(pinId));
        // TODO: Remove pin from API
    };

    if (!selectedPin) {
        return <PinNotFound />;
    }

    return (
        <PinDetailPage
            pin={selectedPin}
            onBack={() => router.back()}
            onUpdatePin={handleUpdatePin}
            onSavePin={handleSavePin}
            onRemovePin={handleRemovePin}
            isSaved={isSaved}
            scriptsLoaded={scriptsLoaded}
            currentUser={user}
            allAvailablePins={allAvailablePins}
            onLoginRedirect={onLoginRedirect}
        />
    );
};