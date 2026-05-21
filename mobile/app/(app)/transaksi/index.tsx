import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useSales, useDeleteSale } from '@/hooks/useSales';
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses';
import { SaleModal } from '@/components/SaleModal';
import { ExpenseModal } from '@/components/ExpenseModal';
import { formatRupiah, formatDate, getTodayString, getMonthStart } from '@/lib/format';
import type { Sale } from '@/hooks/useSales';
import type { Expense, ExpenseCategory } from '@/hooks/useExpenses';

type Tab = 'penjualan' | 'pengeluaran';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  OPERASIONAL: 'Operasional',
  LISTRIK: 'Listrik',
  GAJI: 'Gaji',
  LAINNYA: 'Lainnya',
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: '#92400E',
  OPERASIONAL: '#1E40AF',
  LISTRIK: '#D97706',
  GAJI: '#065F46',
  LAINNYA: '#6B7280',
};

const CATEGORY_BG: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: '#FEF3C7',
  OPERASIONAL: '#DBEAFE',
  LISTRIK: '#FDE68A',
  GAJI: '#D1FAE5',
  LAINNYA: '#F3F4F6',
};

export default function TransaksiScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('penjualan');
  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(getTodayString());

  const salesQuery = useSales(from, to);
  const expensesQuery = useExpenses(from, to);
  const deleteSaleMutation = useDeleteSale();
  const deleteExpenseMutation = useDeleteExpense();

  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  function openAddSale() {
    setSelectedSale(null);
    setSaleModalVisible(true);
  }
  function openEditSale(sale: Sale) {
    setSelectedSale(sale);
    setSaleModalVisible(true);
  }
  function closeSaleModal() {
    setSaleModalVisible(false);
    setSelectedSale(null);
  }

  function openAddExpense() {
    setSelectedExpense(null);
    setExpenseModalVisible(true);
  }
  function openEditExpense(expense: Expense) {
    setSelectedExpense(expense);
    setExpenseModalVisible(true);
  }
  function closeExpenseModal() {
    setExpenseModalVisible(false);
    setSelectedExpense(null);
  }

  function confirmDeleteSale(sale: Sale) {
    if (deleteSaleMutation.isPending) return;
    Alert.alert(
      'Hapus Penjualan',
      `Yakin ingin menghapus penjualan "${sale.itemName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSaleMutation.mutateAsync(sale.id);
            } catch {
              Alert.alert('Gagal', 'Gagal menghapus penjualan. Coba lagi.');
            }
          },
        },
      ]
    );
  }

  function confirmDeleteExpense(expense: Expense) {
    if (deleteExpenseMutation.isPending) return;
    Alert.alert(
      'Hapus Pengeluaran',
      `Yakin ingin menghapus pengeluaran "${expense.description}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpenseMutation.mutateAsync(expense.id);
            } catch {
              Alert.alert('Gagal', 'Gagal menghapus pengeluaran. Coba lagi.');
            }
          },
        },
      ]
    );
  }

  const sales = salesQuery.data?.data ?? [];
  const totalRevenue = salesQuery.data?.totalRevenue ?? 0;
  const expenses = expensesQuery.data?.data ?? [];
  const totalAmount = expensesQuery.data?.totalAmount ?? 0;

  const activeQuery = activeTab === 'penjualan' ? salesQuery : expensesQuery;

  return (
    <View style={styles.container}>
      {/* Tab switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'penjualan' && styles.tabButtonActive]}
          onPress={() => setActiveTab('penjualan')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'penjualan' && styles.tabButtonTextActive]}>
            Penjualan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pengeluaran' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pengeluaran')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'pengeluaran' && styles.tabButtonTextActive]}>
            Pengeluaran
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date filter row */}
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
        <View style={styles.dateSeparator} />
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

      {/* Content */}
      {activeQuery.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#A0813A" />
        </View>
      ) : activeQuery.isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Gagal memuat data</Text>
          <Button
            title="Coba Lagi"
            onPress={() => activeQuery.refetch()}
            variant="secondary"
            style={styles.retryButton}
          />
        </View>
      ) : activeTab === 'penjualan' ? (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            sales.length === 0 && styles.listContentEmpty,
          ]}
          refreshing={salesQuery.isFetching && !salesQuery.isLoading}
          onRefresh={salesQuery.refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={56} color="#D1C4A8" />
              <Text style={styles.emptyTitle}>Belum ada penjualan</Text>
              <Text style={styles.emptySubtitle}>Catat penjualan pertama Anda</Text>
              <Button title="Tambah Penjualan" onPress={openAddSale} style={styles.emptyButton} />
            </View>
          }
          ListFooterComponent={
            sales.length > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  Total: {formatRupiah(totalRevenue)} ({sales.length} transaksi)
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <SaleCard
              sale={item}
              onEdit={() => openEditSale(item)}
              onDelete={() => confirmDeleteSale(item)}
              isDeleting={deleteSaleMutation.isPending}
            />
          )}
        />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            expenses.length === 0 && styles.listContentEmpty,
          ]}
          refreshing={expensesQuery.isFetching && !expensesQuery.isLoading}
          onRefresh={expensesQuery.refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={56} color="#D1C4A8" />
              <Text style={styles.emptyTitle}>Belum ada pengeluaran</Text>
              <Text style={styles.emptySubtitle}>Catat pengeluaran pertama Anda</Text>
              <Button title="Tambah Pengeluaran" onPress={openAddExpense} style={styles.emptyButton} />
            </View>
          }
          ListFooterComponent={
            expenses.length > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  Total: {formatRupiah(totalAmount)} ({expenses.length} transaksi)
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              onEdit={() => openEditExpense(item)}
              onDelete={() => confirmDeleteExpense(item)}
              isDeleting={deleteExpenseMutation.isPending}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={activeTab === 'penjualan' ? openAddSale : openAddExpense}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <SaleModal
        visible={saleModalVisible}
        sale={selectedSale}
        onClose={closeSaleModal}
      />

      <ExpenseModal
        visible={expenseModalVisible}
        expense={selectedExpense}
        onClose={closeExpenseModal}
      />
    </View>
  );
}

interface SaleCardProps {
  sale: Sale;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function SaleCard({ sale, onEdit, onDelete, isDeleting }: SaleCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {sale.itemName}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.actionButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="pencil" size={18} color="#A0813A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => !isDeleting && onDelete()}
            disabled={isDeleting}
            style={[styles.actionButton, styles.actionButtonDelete]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>
        {sale.qty} pcs × {formatRupiah(sale.pricePerUnit)}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTotal}>Total: {formatRupiah(sale.totalRevenue)}</Text>
        <Text style={styles.cardDate}>{formatDate(sale.date)}</Text>
      </View>
    </View>
  );
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function ExpenseCard({ expense, onEdit, onDelete, isDeleting }: ExpenseCardProps) {
  const color = CATEGORY_COLORS[expense.category];
  const bg = CATEGORY_BG[expense.category];
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: bg }]}>
          <Text style={[styles.categoryBadgeText, { color }]}>
            {CATEGORY_LABELS[expense.category]}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.actionButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="pencil" size={18} color="#A0813A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => !isDeleting && onDelete()}
            disabled={isDeleting}
            style={[styles.actionButton, styles.actionButtonDelete]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.expenseDescription} numberOfLines={2}>
        {expense.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.expenseAmount}>{formatRupiah(expense.amount)}</Text>
        <Text style={styles.cardDate}>{formatDate(expense.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#A0813A',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B6B6B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 8,
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
  dateSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 140,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 96,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 160,
  },
  summaryRow: {
    marginTop: 4,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0813A',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A0813A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FDF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDelete: {
    backgroundColor: '#FEF2F2',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardDate: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 20,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
});
