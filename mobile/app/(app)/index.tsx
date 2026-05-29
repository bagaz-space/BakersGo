import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { ReportResponse, UserProfile } from '@bakersgo/types';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { formatRupiah } from '@/lib/format';
import SummaryCard from '@/components/SummaryCard';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getMonthRange(year: number, month: number) {
  const from = new Date(year, month, 1).toISOString().split('T')[0];
  const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

function SkeletonBox({ style }: { style?: object }) {
  return <View style={[styles.skeleton, style]} />;
}

export default function DashboardScreen() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const { from, to } = getMonthRange(year, month);

  const {
    data: reportData,
    isLoading: reportLoading,
    isError: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ['reports', from, to],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ReportResponse>(`/reports/summary?from=${from}&to=${to}`, token ?? undefined);
    },
  });

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = await getToken();
      return api.get<UserProfile>('/auth/me', token ?? undefined);
    },
  });

  const summary = reportData?.summary;
  const isLoading = reportLoading || profileLoading;
  const isError = reportError || profileError;

  function handleRetry() {
    refetchReport();
    refetchProfile();
  }

  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header greeting */}
      <View style={styles.header}>
        {profileLoading ? (
          <SkeletonBox style={{ width: 160, height: 24, marginBottom: 4 }} />
        ) : (
          <Text style={styles.greeting}>
            Halo, {profile?.brandName ?? 'Teman'}!
          </Text>
        )}
        <Text style={styles.monthLabel}>{monthLabel}</Text>
      </View>

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Gagal memuat data. Silakan coba lagi.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A0813A" />
        </View>
      )}

      {/* Summary cards grid */}
      {!isLoading && !isError && (
        <View style={styles.grid}>
          <View style={styles.row}>
            <SummaryCard
              title="Total Penjualan"
              value={formatRupiah(summary?.totalRevenue ?? 0)}
              color="green"
            />
            <SummaryCard
              title="Total Pengeluaran"
              value={formatRupiah(summary?.totalExpenses ?? 0)}
              color="red"
            />
          </View>
          <View style={styles.row}>
            <SummaryCard
              title="Laba Bersih"
              value={formatRupiah(summary?.netProfit ?? 0)}
              color={(summary?.netProfit ?? 0) >= 0 ? 'green' : 'red'}
            />
            <SummaryCard
              title="Saldo Aman"
              value={formatRupiah(summary?.safeBalance ?? 0)}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  monthLabel: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  grid: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  skeleton: {
    backgroundColor: '#E5DDD0',
    borderRadius: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#A0813A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
