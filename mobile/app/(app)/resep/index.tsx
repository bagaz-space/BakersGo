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
import type { Recipe } from '@bakersgo/types';
import { formatRupiah } from '@/lib/format';
import { useRecipes, useDeleteRecipe } from '@/hooks/useRecipes';
import { RecipeModal } from '@/components/RecipeModal';
import { Button } from '@/components/ui/Button';

export default function ResepScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useRecipes();
  const deleteMutation = useDeleteRecipe();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  function openAdd() {
    setSelectedRecipe(null);
    setModalVisible(true);
  }

  function openEdit(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedRecipe(null);
  }

  function confirmDelete(recipe: Recipe) {
    if (deleteMutation.isPending) return;
    Alert.alert(
      'Hapus Resep',
      `Yakin ingin menghapus "${recipe.name}"? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(recipe.id);
            } catch {
              Alert.alert('Gagal', 'Gagal menghapus resep. Coba lagi.');
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
        <Text style={styles.errorText}>Gagal memuat data resep</Text>
        <Button
          title="Coba Lagi"
          onPress={() => refetch()}
          variant="secondary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const recipes = data?.data ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          recipes.length === 0 && styles.listContentEmpty,
        ]}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={56} color="#D1C4A8" />
            <Text style={styles.emptyTitle}>Belum ada resep</Text>
            <Text style={styles.emptySubtitle}>
              Tambahkan resep pertama Anda
            </Text>
            <Button
              title="Tambah Resep"
              onPress={openAdd}
              style={styles.emptyButton}
            />
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onEdit={() => openEdit(item)}
            onDelete={() => confirmDelete(item)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      />

      {/* FAB */}
      {recipes.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <RecipeModal
        visible={modalVisible}
        recipe={selectedRecipe}
        onClose={closeModal}
      />
    </View>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function RecipeCard({ recipe, onEdit, onDelete, isDeleting }: RecipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {recipe.name}
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

      {recipe.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
      ) : null}

      <Text style={styles.cardBatch}>
        {recipe.batchSize.toLocaleString('id-ID')} {recipe.batchUnit}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardCost}>
          Biaya Dasar:{' '}
          <Text style={styles.cardCostValue}>
            {formatRupiah(recipe.baseRecipeCost)}
          </Text>
        </Text>
        <Text style={styles.cardIngredientCount}>
          {recipe.ingredients.length} bahan
        </Text>
      </View>
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
    marginBottom: 4,
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
  cardDescription: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 6,
    lineHeight: 18,
  },
  cardBatch: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCost: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  cardCostValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0813A',
  },
  cardIngredientCount: {
    fontSize: 13,
    color: '#6B6B6B',
    fontWeight: '500',
  },
});
