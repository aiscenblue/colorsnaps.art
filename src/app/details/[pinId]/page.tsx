// src/app/details/[pinId]/page.tsx
'use client';

import { MainApp } from '@/app/MainApp';
import { useSelector } from 'react-redux';
import { selectDecryptedCurrentUser } from '@/lib/redux';
import { AppContainer } from '@/app/AppContainer'; // Assuming AppContainer is still needed for auth flow

export default function PinDetailsPageWrapper() {
  const currentUser = useSelector(selectDecryptedCurrentUser);

  // This wrapper ensures MainApp is rendered within the Redux and Auth context
  // If currentUser is null, AppContainer will redirect to AuthPage
  return <AppContainer />;
}