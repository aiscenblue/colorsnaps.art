// src/app/details/[pinId]/page.tsx
'use client';

import { AppContainer } from '@/app/AppContainer'; // Assuming AppContainer is still needed for auth flow

export default function PinDetailsPageWrapper() {
  // This wrapper ensures MainApp is rendered within the Redux and Auth context
  // If currentUser is null, AppContainer will redirect to AuthPage
  return <AppContainer />;
}