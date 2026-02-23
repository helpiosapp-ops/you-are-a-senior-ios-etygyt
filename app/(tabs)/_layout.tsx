
import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  // Simple single-screen game - no tabs needed
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="(home)" />
    </Stack>
  );
}
