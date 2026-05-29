import React, { useState, useMemo, useRef } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRecipes } from '@/hooks/useRecipes';
import { useHppEntries, useSaveHpp, useUpdateHpp, useDeleteHpp } from '@/hooks/useHpp';
import { RecipePickerModal } from '@/components/RecipePickerModal';
import { formatRupiah } from '@/lib/format';
import { calculateHpp } from '@/application/use-cases/hpp/calculateHpp';
import type { HppEntry, CreateHppDto } from '@bakersgo/types';

// ─── Result Row Helper ────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  bold,
  indent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <View style={resultStyles.row}>
      <Text style={[resultStyles.label, bold && resultStyles.bold, indent && resultStyles.indent]}>
        {label}
      </Text>
      <Text style={[resultStyles.value, bold && resultStyles.bold]}>{value}</Text>
    </View>
  );
}

const resultStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#5C3A00',
  },
  value: {
    fontSize: 14,
    color: '#5C3A00',
    textAlign: 'right',
  },
  bold: {
    fontWeight: '700',
    fontSize: 15,
    color: '#3B2200',
  },
  indent: {
    paddingLeft: 8,
  },
});

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(160,129,58,0.3)', marginVertical: 8 }} />;
}

// ─── Numeric Input ────────────────────────────────────────────────────────────

function NumericInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={inputStyles.input}
        keyboardType="numeric"
        value={value === 0 ? '' : String(value)}
        onChangeText={(t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
          onChange(isNaN(n) ? 0 : n);
        }}
        placeholder="0"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
});

// ─── HPP Entry Card ───────────────────────────────────────────────────────────

function HppEntryCard({
  entry,
  onEdit,
  onDelete,
  isDeleting,
}: {
  entry: HppEntry;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.name} numberOfLines={1}>
          {entry.recipeName}
        </Text>
        <View style={cardStyles.actions}>
          <TouchableOpacity onPress={onEdit} style={cardStyles.actionBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={cardStyles.editText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={cardStyles.actionBtn}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            disabled={isDeleting}
          >
            <Text style={cardStyles.deleteText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={cardStyles.batch}>
        {entry.batchSize} {entry.batchUnit} / batch
      </Text>
      <Text style={cardStyles.hpp}>HPP/Unit: {formatRupiah(entry.hppPerUnit)}</Text>
      <View style={cardStyles.priceRow}>
        <Text style={cardStyles.price}>Reseller: {formatRupiah(entry.hargaReseller)}</Text>
        <View style={cardStyles.priceDivider} />
        <Text style={cardStyles.price}>End User: {formatRupiah(entry.hargaEndUser)}</Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  editText: {
    fontSize: 16,
  },
  deleteText: {
    fontSize: 16,
  },
  batch: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  hpp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0813A',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  priceDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5DDD0',
    marginHorizontal: 10,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HppScreen() {
  const scrollRef = useRef<ScrollView>(null);

  const { data: recipesData } = useRecipes();
  const { data: hppData } = useHppEntries();
  const saveHpp = useSaveHpp();
  const updateHpp = useUpdateHpp();
  const deleteHpp = useDeleteHpp();

  const recipes = recipesData?.data ?? [];
  const hppEntries = hppData?.data ?? [];

  const [editingEntry, setEditingEntry] = useState<HppEntry | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [listrik, setListrik] = useState(0);
  const [gas, setGas] = useState(0);
  const [tenagaKerja, setTenagaKerja] = useState(0);
  const [overhead, setOverhead] = useState(0);
  const [kotak, setKotak] = useState(0);
  const [stiker, setStiker] = useState(0);
  const [kemasanLain, setKemasanLain] = useState(0);
  const [marginReseller, setMarginReseller] = useState(0);
  const [marginEndUser, setMarginEndUser] = useState(0);
  const [saved, setSaved] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) ?? null;

  const result = useMemo(() => {
    if (!selectedRecipe) return null;
    return calculateHpp({
      baseRecipeCost: selectedRecipe.baseRecipeCost,
      batchSize: selectedRecipe.batchSize,
      listrik,
      gas,
      tenagaKerja,
      overhead,
      kotak,
      stiker,
      kemasanLain,
      marginReseller,
      marginEndUser,
    });
  }, [selectedRecipe, listrik, gas, tenagaKerja, overhead, kotak, stiker, kemasanLain, marginReseller, marginEndUser]);

  function handleRecipeSelect(id: string) {
    if (id !== selectedRecipeId) {
      setSelectedRecipeId(id);
      setListrik(0);
      setGas(0);
      setTenagaKerja(0);
      setOverhead(0);
      setKotak(0);
      setStiker(0);
      setKemasanLain(0);
      setMarginReseller(0);
      setMarginEndUser(0);
      setSaved(false);
      setSaveError(null);
    }
  }

  function handleEditEntry(entry: HppEntry) {
    setEditingEntry(entry);
    setSelectedRecipeId(entry.recipeId);
    setSaved(false);
    setSaveError(null);
    setListrik(entry.listrik);
    setGas(entry.gas);
    setTenagaKerja(entry.tenagaKerja);
    setOverhead(entry.overhead);
    setKotak(entry.kotak);
    setStiker(entry.stiker);
    setKemasanLain(entry.kemasanLain);
    setMarginReseller(entry.marginReseller);
    setMarginEndUser(entry.marginEndUser);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handleCancelEdit() {
    setEditingEntry(null);
    setSelectedRecipeId('');
    setListrik(0);
    setGas(0);
    setTenagaKerja(0);
    setOverhead(0);
    setKotak(0);
    setStiker(0);
    setKemasanLain(0);
    setMarginReseller(0);
    setMarginEndUser(0);
    setSaved(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (!selectedRecipe || !result) return;
    try {
      setSaveError(null);
      const dto: CreateHppDto = {
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        batchSize: selectedRecipe.batchSize,
        batchUnit: selectedRecipe.batchUnit,
        baseRecipeCost: result.baseRecipeCost,
        listrik,
        gas,
        tenagaKerja,
        overhead,
        kotak,
        stiker,
        kemasanLain,
        marginReseller,
        marginEndUser,
        hppTotal: result.hppTotal,
        hppPerUnit: result.hppPerUnit,
        hargaReseller: result.hargaReseller,
        hargaEndUser: result.hargaEndUser,
      };
      if (editingEntry) {
        await updateHpp.mutateAsync({ id: editingEntry.id, dto });
        setEditingEntry(null);
      } else {
        await saveHpp.mutateAsync(dto);
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan HPP');
    }
  }

  function handleDelete(entry: HppEntry) {
    if (deleteHpp.isPending) return;
    Alert.alert(
      'Hapus HPP',
      `Hapus HPP untuk "${entry.recipeName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHpp.mutateAsync(entry.id);
            } catch (err) {
              Alert.alert(
                'Gagal Hapus',
                err instanceof Error ? err.message : 'Terjadi kesalahan',
              );
            }
          },
        },
      ],
    );
  }

  const isSaving = saveHpp.isPending || updateHpp.isPending;

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Edit Mode Banner */}
        {editingEntry && (
          <View style={styles.editBanner}>
            <Text style={styles.editBannerText} numberOfLines={1}>
              Mengedit HPP: {editingEntry.recipeName}
            </Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.cancelEditText}>Batal Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 1 — Pilih Resep */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pilih Resep</Text>
          <TouchableOpacity
            style={styles.recipePicker}
            onPress={() => {
              if (!editingEntry) setPickerVisible(true);
            }}
            activeOpacity={editingEntry ? 1 : 0.7}
          >
            <Text
              style={[
                styles.recipePickerText,
                !selectedRecipeId && styles.recipePickerPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedRecipe ? selectedRecipe.name : 'Pilih resep...'}
            </Text>
            {!editingEntry && (
              <Text style={styles.recipePickerChevron}>›</Text>
            )}
          </TouchableOpacity>

          {selectedRecipe && (
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeInfoText}>
                Ukuran Batch: {selectedRecipe.batchSize} {selectedRecipe.batchUnit}
              </Text>
              <Text style={styles.recipeInfoText}>
                Biaya Dasar: {formatRupiah(selectedRecipe.baseRecipeCost)}
              </Text>
            </View>
          )}
        </View>

        {selectedRecipe && (
          <>
            {/* Section 2 — Zona Dapur */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Zona Dapur — Biaya Operasional</Text>
              <View style={styles.grid}>
                <NumericInput label="Listrik (Rp)" value={listrik} onChange={setListrik} />
                <View style={styles.gridGap} />
                <NumericInput label="Gas (Rp)" value={gas} onChange={setGas} />
              </View>
              <View style={[styles.grid, { marginTop: 12 }]}>
                <NumericInput label="Tenaga Kerja (Rp)" value={tenagaKerja} onChange={setTenagaKerja} />
                <View style={styles.gridGap} />
                <NumericInput label="Overhead (Rp)" value={overhead} onChange={setOverhead} />
              </View>
            </View>

            {/* Section 3 — Zona Final */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Zona Final — Biaya Kemasan</Text>
              <View style={styles.grid}>
                <NumericInput label="Kotak/Box (Rp)" value={kotak} onChange={setKotak} />
                <View style={styles.gridGap} />
                <NumericInput label="Stiker (Rp)" value={stiker} onChange={setStiker} />
              </View>
              <View style={[styles.grid, { marginTop: 12 }]}>
                <NumericInput label="Kemasan Lain (Rp)" value={kemasanLain} onChange={setKemasanLain} />
                <View style={styles.gridGap} />
                <View style={{ flex: 1 }} />
              </View>
            </View>

            {/* Section 4 — Zona Penjualan */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Zona Penjualan — Margin</Text>
              <View style={styles.grid}>
                <NumericInput label="Margin Reseller (%)" value={marginReseller} onChange={setMarginReseller} />
                <View style={styles.gridGap} />
                <NumericInput label="Margin End User (%)" value={marginEndUser} onChange={setMarginEndUser} />
              </View>
            </View>

            {/* Section 5 — Hasil Kalkulasi */}
            {result && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Hasil Kalkulasi</Text>

                <ResultRow label="Biaya Dasar Resep" value={formatRupiah(result.baseRecipeCost)} />
                <ResultRow label="Total Zona Dapur" value={formatRupiah(result.totalZonaDapur)} />
                <ResultRow label="Total Zona Final" value={formatRupiah(result.totalZonaFinal)} />

                <Divider />

                <ResultRow label="HPP Total (1 Batch)" value={formatRupiah(result.hppTotal)} bold />
                <ResultRow label="HPP per Unit" value={formatRupiah(result.hppPerUnit)} bold />

                <View style={{ height: 12 }} />
                <Text style={styles.resultSectionLabel}>HARGA JUAL</Text>

                <ResultRow
                  label={`Harga Reseller (+${marginReseller}%)`}
                  value={formatRupiah(result.hargaReseller)}
                />
                <ResultRow
                  label="Profit Reseller/Unit"
                  value={formatRupiah(result.profitReseller)}
                  indent
                />

                <Divider />

                <ResultRow
                  label={`Harga End User (+${marginEndUser}%)`}
                  value={formatRupiah(result.hargaEndUser)}
                />
                <ResultRow
                  label="Profit End User/Unit"
                  value={formatRupiah(result.profitEndUser)}
                  indent
                />

                {/* Save button area */}
                <View style={{ marginTop: 16 }}>
                  {saveError && (
                    <Text style={styles.errorText}>{saveError}</Text>
                  )}
                  {saved ? (
                    <View style={styles.successBanner}>
                      <Text style={styles.successText}>
                        HPP berhasil {editingEntry ? 'diperbarui' : 'disimpan'}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                      onPress={handleSave}
                      disabled={isSaving}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.saveBtnText}>
                        {isSaving
                          ? 'Menyimpan...'
                          : editingEntry
                          ? 'Update HPP ini'
                          : 'Simpan HPP ini'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {/* Section 6 — HPP Tersimpan */}
        {hppEntries.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.sectionTitle}>HPP Tersimpan</Text>
            {hppEntries.map((entry) => (
              <HppEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => handleEditEntry(entry)}
                onDelete={() => handleDelete(entry)}
                isDeleting={deleteHpp.isPending}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <RecipePickerModal
        visible={pickerVisible}
        selectedId={selectedRecipeId}
        onSelect={handleRecipeSelect}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0E6D0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4B87A',
  },
  editBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#7A5A1E',
    fontWeight: '500',
    marginRight: 8,
  },
  cancelEditText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5DDD0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  recipePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F0E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
  },
  recipePickerText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  recipePickerPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  recipePickerChevron: {
    fontSize: 20,
    color: '#A0813A',
    lineHeight: 22,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EAE0',
  },
  recipeInfoText: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gridGap: {
    width: 12,
  },
  resultCard: {
    backgroundColor: '#FDF5E4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4B87A',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B2200',
    marginBottom: 12,
  },
  resultSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0813A',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  saveBtn: {
    backgroundColor: '#A0813A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
});
