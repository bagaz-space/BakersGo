import React, { useState, useMemo } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipes } from '@/hooks/useRecipes';
import { formatRupiah } from '@/lib/format';

export interface RecipePickerModalProps {
  visible: boolean;
  selectedId: string;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

export function RecipePickerModal({
  visible,
  selectedId,
  onSelect,
  onClose,
}: RecipePickerModalProps) {
  const { data, isLoading } = useRecipes();
  const [search, setSearch] = useState('');

  const recipes = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return recipes;
    const lower = search.toLowerCase();
    return recipes.filter((r) => r.name.toLowerCase().includes(lower));
  }, [recipes, search]);

  function handleSelect(id: string) {
    onSelect(id);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pilih Resep</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#6B6B6B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari resep..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#A0813A" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Tidak ada resep ditemukan</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowName, isSelected && styles.rowNameSelected]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.rowInfo, isSelected && styles.rowInfoSelected]}>
                      {item.batchSize} {item.batchUnit} · {formatRupiah(item.baseRecipeCost)}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DDD0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B6B6B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
  },
  rowSelected: {
    backgroundColor: '#A0813A',
    borderColor: '#A0813A',
  },
  rowContent: {
    flex: 1,
    marginRight: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  rowNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rowInfo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  rowInfoSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
});
