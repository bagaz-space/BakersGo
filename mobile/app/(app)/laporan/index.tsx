import React, { useMemo, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useReportSummary } from '@/hooks/useReports';
import { useExpenses } from '@/hooks/useExpenses';
import { useSales } from '@/hooks/useSales';
import SummaryCard from '@/components/SummaryCard';
import { formatRupiah, formatDate, getTodayString, getMonthStart } from '@/lib/format';

// ─── Helper date functions ────────────────────────────────────────────────────

function threeMonthsAgo() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
}

function yearStart() {
  return `${new Date().getFullYear()}-01-01`;
}

// ─── Short date label for bar chart ──────────────────────────────────────────

function shortDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${months[d.getMonth()]}`;
}

// ─── Skeleton component ───────────────────────────────────────────────────────

function SkeletonBox({ width, height, style }: { width?: number | string; height: number; style?: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width ?? '100%',
          height,
          backgroundColor: '#D1C4A8',
          borderRadius: 8,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Transaction item type ────────────────────────────────────────────────────

interface CombinedItem {
  id: string;
  date: string;
  type: 'expense' | 'sale';
  label: string;
  badge: string;
  amount: number;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LaporanScreen() {
  const [from, setFrom] = React.useState(getMonthStart());
  const [to, setTo] = React.useState(getTodayString());

  const { data: reportData, isLoading: reportLoading, isError: reportError, refetch: reportRefetch } =
    useReportSummary(from, to);
  const { data: expenseData } = useExpenses(from, to);
  const { data: saleData } = useSales(from, to);

  const summary = reportData?.summary;
  const daily = reportData?.dailyBreakdown ?? [];
  const chartData = daily.slice(-14);

  // ── Combined transaction list ──────────────────────────────────────────────
  const combined = useMemo<CombinedItem[]>(() => {
    const expenses = (expenseData?.data ?? []).map(e => ({
      id: e.id,
      date: e.date,
      type: 'expense' as const,
      label: e.description,
      badge: e.category,
      amount: -e.amount,
    }));
    const sales = (saleData?.data ?? []).map(s => ({
      id: s.id,
      date: s.date,
      type: 'sale' as const,
      label: s.itemName,
      badge: `${s.qty} pcs`,
      amount: s.totalRevenue,
    }));
    return [...expenses, ...sales].sort((a, b) => b.date.localeCompare(a.date));
  }, [expenseData, saleData]);

  // ── Bar chart max value ────────────────────────────────────────────────────
  const maxValue = chartData.length > 0
    ? Math.max(...chartData.map(d => Math.max(d.revenue, d.expenses)), 1)
    : 1;

  // ── ListHeaderComponent rendered above FlatList items ─────────────────────
  const ListHeader = (
    <View>
      {/* Date filter */}
      <View style={styles.section}>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Dari</Text>
            <TextInput
              style={styles.dateInput}
              value={from}
              onChangeText={setFrom}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.dateSeparatorSpace} />
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Sampai</Text>
            <TextInput
              style={styles.dateInput}
              value={to}
              onChangeText={setTo}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Quick preset chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => { setFrom(getMonthStart()); setTo(getTodayString()); }}
            activeOpacity={0.75}
          >
            <Text style={styles.chipText}>Bulan Ini</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => { setFrom(threeMonthsAgo()); setTo(getTodayString()); }}
            activeOpacity={0.75}
          >
            <Text style={styles.chipText}>3 Bulan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => { setFrom(yearStart()); setTo(getTodayString()); }}
            activeOpacity={0.75}
          >
            <Text style={styles.chipText}>Tahun Ini</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Summary cards or skeleton */}
      {reportLoading ? (
        <View style={styles.section}>
          <View style={styles.cardGrid}>
            <SkeletonBox height={72} style={styles.skeletonCard} />
            <SkeletonBox height={72} style={styles.skeletonCard} />
          </View>
          <View style={[styles.cardGrid, { marginTop: 8 }]}>
            <SkeletonBox height={72} style={styles.skeletonCard} />
            <SkeletonBox height={72} style={styles.skeletonCard} />
          </View>
        </View>
      ) : reportError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Gagal memuat laporan</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => reportRefetch()} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : summary ? (
        <View style={styles.section}>
          <View style={styles.cardGrid}>
            <SummaryCard
              title="Total Penjualan"
              value={formatRupiah(summary.totalRevenue)}
              color={summary.totalRevenue > 0 ? 'green' : 'default'}
            />
            <SummaryCard
              title="Total Pengeluaran"
              value={formatRupiah(summary.totalExpenses)}
              color="default"
            />
          </View>
          <View style={[styles.cardGrid, { marginTop: 8 }]}>
            <SummaryCard
              title="Laba Bersih"
              value={formatRupiah(summary.netProfit)}
              color={summary.netProfit > 0 ? 'green' : summary.netProfit < 0 ? 'red' : 'default'}
            />
            <SummaryCard
              title="Saldo Aman"
              value={formatRupiah(summary.safeBalance)}
              color={summary.safeBalance > 0 ? 'green' : 'default'}
            />
          </View>
        </View>
      ) : null}

      {/* Bar chart — daily breakdown */}
      {chartData.length > 0 && (
        <View style={[styles.section, styles.chartCard]}>
          <Text style={styles.sectionTitle}>Penjualan vs Pengeluaran</Text>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#A0813A' }]} />
              <Text style={styles.legendText}>Penjualan</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendText}>Pengeluaran</Text>
            </View>
          </View>

          {chartData.map((day) => (
            <View key={day.date} style={styles.chartRow}>
              <Text style={styles.chartDateLabel}>{shortDateLabel(day.date)}</Text>
              <View style={styles.chartBars}>
                {/* Revenue bar */}
                <View style={styles.barRow}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: day.revenue > 0 ? `${(day.revenue / maxValue) * 100}%` : 4,
                        backgroundColor: '#A0813A',
                        opacity: day.revenue > 0 ? 1 : 0.15,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {day.revenue > 0 ? formatRupiah(day.revenue) : '-'}
                  </Text>
                </View>
                {/* Expenses bar */}
                <View style={styles.barRow}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: day.expenses > 0 ? `${(day.expenses / maxValue) * 100}%` : 4,
                        backgroundColor: '#DC2626',
                        opacity: day.expenses > 0 ? 1 : 0.15,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {day.expenses > 0 ? formatRupiah(day.expenses) : '-'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Combined transactions header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Semua Transaksi</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {reportLoading && combined.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#A0813A" />
        </View>
      ) : (
        <FlatList<CombinedItem>
          data={combined}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            !reportLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Belum ada transaksi di periode ini</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => <TransactionItem item={item} />}
        />
      )}
    </View>
  );
}

// ─── Transaction item card ────────────────────────────────────────────────────

function TransactionItem({ item }: { item: CombinedItem }) {
  const isSale = item.type === 'sale';
  const badgeBg = isSale ? '#DCFCE7' : '#FEE2E2';
  const badgeColor = isSale ? '#166534' : '#991B1B';
  const badgeLabel = isSale ? 'Penjualan' : 'Pengeluaran';
  const amountColor = isSale ? '#16A34A' : '#DC2626';
  const amountPrefix = isSale ? '+' : '-';
  const displayAmount = `${amountPrefix}${formatRupiah(Math.abs(item.amount))}`;

  return (
    <View style={styles.txCard}>
      <View style={styles.txTop}>
        <View style={[styles.txTypeBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.txTypeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
        </View>
        <Text style={styles.txLabel} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.txBadge} numberOfLines={1}>{item.badge}</Text>
      </View>
      <View style={styles.txBottom}>
        <Text style={styles.txDate}>{formatDate(item.date)}</Text>
        <Text style={[styles.txAmount, { color: amountColor }]}>{displayAmount}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 32,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Date filter
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 4,
  },
  dateInput: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  dateSeparatorSpace: {
    width: 4,
  },

  // Chips
  chipsScroll: {
    marginTop: 10,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0813A',
  },

  // Summary card grid
  cardGrid: {
    flexDirection: 'row',
    gap: 0,
    marginHorizontal: -4,
  },
  skeletonCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
  },

  // Error
  errorBox: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#A0813A',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Bar chart
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartDateLabel: {
    width: 56,
    fontSize: 11,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  chartBars: {
    flex: 1,
    gap: 3,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    height: 10,
    borderRadius: 4,
    minWidth: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B6B6B',
    flexShrink: 1,
  },

  // Transaction list items
  txCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  txTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  txTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  txTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  txLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  txBadge: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  txBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txDate: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});
