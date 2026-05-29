import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Ingredient } from '@bakersgo/types';
import { formatRupiah } from '@/lib/format';
import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients';
import { IngredientModal } from '@/components/IngredientModal';
import { Button } from '@/components/ui/Button';

export default function BahanScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useIngredients();
  const deleteMutation = useDeleteIngredient();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  function openAdd() {
    setSelectedIngredient(null);
    setModalVisible(true);
  }

  function openEdit(ingredient: Ingredient) {
    setSelectedIngredient(ingredient);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedIngredient(null);
  }

  function confirmDelete(ingredient: Ingredient) {
    if (deleteMutation.isPending) return;
    Alert.alert(
      'Hapus Bahan',
      `Yakin ingin menghapus "${ingredient.name}"? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(ingredient.id);
            } catch {
              Alert.alert('Gagal', 'Gagal menghapus bahan. Coba lagi.');
            }
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#A0813A" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Gagal memuat data bahan</Text>
        <Button
          title="Coba Lagi"
          onPress={() => refetch()}
          variant="secondary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const ingredients = data?.data ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          ingredients.length === 0 && styles.listContentEmpty,
        ]}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={56} color="#D1C4A8" />
            <Text style={styles.emptyTitle}>Belum ada bahan baku</Text>
            <Text style={styles.emptySubtitle}>
              Tambahkan bahan baku pertama Anda
            </Text>
            <Button
              title="Tambah Bahan"
              onPress={openAdd}
              style={styles.emptyButton}
            />
          </View>
        }
        renderItem={({ item }) => (
          <IngredientCard
            ingredient={item}
            onEdit={() => openEdit(item)}
            onDelete={() => confirmDelete(item)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      />

      {/* FAB */}
      {ingredients.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <IngredientModal
        visible={modalVisible}
        ingredient={selectedIngredient}
        onClose={closeModal}
      />
    </View>
  );
}

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function IngredientCard({ ingredient, onEdit, onDelete, isDeleting }: IngredientCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {ingredient.name}
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

      <Text style={styles.cardVolume}>
        {ingredient.packageVolume.toLocaleString('id-ID')} {ingredient.unit}
      </Text>

      <View style={styles.cardPricingRow}>
        <Text style={styles.cardPackagePrice}>
          {formatRupiah(ingredient.packagePrice)} / kemasan
        </Text>
        <Text style={styles.cardPricePerUnit}>
          {formatRupiah(ingredient.pricePerUnit)}/{ingredient.unit}
        </Text>
      </View>

      <Text style={styles.cardStock}>
        Stok:{' '}
        <Text style={styles.cardStockValue}>
          {ingredient.stock.toLocaleString('id-ID')} {ingredient.unit}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
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
  cardVolume: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  cardPricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardPackagePrice: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  cardPricePerUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0813A',
  },
  cardStock: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  cardStockValue: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
