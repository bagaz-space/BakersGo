import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { clearToken } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';

export default function AppLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await clearToken();
    queryClient.clear();
    router.replace('/(auth)/login');
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A0813A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5DDD0',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#F5F0E8',
        },
        headerTintColor: '#A0813A',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="log-out-outline" size={22} color="#A0813A" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="bahan/index"
        options={{
          title: 'Bahan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resep/index"
        options={{
          title: 'Resep',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hpp/index"
        options={{
          title: 'HPP',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaksi/index"
        options={{
          title: 'Transaksi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="laporan/index"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
