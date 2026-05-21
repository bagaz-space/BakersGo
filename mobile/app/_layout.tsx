import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { getToken } from '@/lib/auth';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        if (!mounted) return;
        setChecking(false);
        if (token) {
          router.replace('/(app)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch {
        if (!mounted) return;
        setChecking(false);
        router.replace('/(auth)/login');
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' }}>
        <ActivityIndicator size="large" color="#A0813A" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
