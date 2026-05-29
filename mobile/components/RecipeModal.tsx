import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import type { Recipe } from '@bakersgo/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatRupiah } from '@/lib/format';
import { useIngredients } from '@/hooks/useIngredients';
import { useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { IngredientPickerModal } from '@/components/IngredientPickerModal';

const BATCH_UNITS = ['pcs', 'loyang', 'porsi', 'lusin', 'buah'] as const;

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  description: z.string().optional(),
  batchSize: z.coerce.number().positive('Ukuran batch harus > 0'),
  batchUnit: z.string().min(1),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().min(1, 'Pilih bahan'),
        amount: z.coerce.number().positive('Jumlah harus > 0'),
      })
    )
    .min(1, 'Minimal 1 bahan diperlukan'),
});

type FormValues = z.infer<typeof schema>;

export interface RecipeModalProps {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
}

export function RecipeModal({ visible, recipe, onClose }: RecipeModalProps) {
  const isEdit = recipe !== null;
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const { data: ingredientsData } = useIngredients();
  const allIngredients = ingredientsData?.data ?? [];

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      batchSize: 1,
      batchUnit: 'pcs',
      ingredients: [{ ingredientId: '', amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  useEffect(() => {
    if (visible) {
      if (recipe) {
        reset({
          name: recipe.name,
          description: recipe.description ?? '',
          batchSize: recipe.batchSize,
          batchUnit: recipe.batchUnit,
          ingredients: recipe.ingredients.map((ri) => ({
            ingredientId: ri.ingredientId,
            amount: ri.amount,
          })),
        });
      } else {
        reset({
          name: '',
          description: '',
          batchSize: 1,
          batchUnit: 'pcs',
          ingredients: [{ ingredientId: '', amount: 0 }],
        });
      }
    } else {
      setSubmitError(null);
    }
  }, [visible, recipe, reset]);

  const watchedIngredients = watch('ingredients');

  // Compute live total cost
  const totalCost = watchedIngredients.reduce((sum, row) => {
    const ingredient = allIngredients.find((i) => i.id === row.ingredientId);
    if (!ingredient || !row.amount) return sum;
    return sum + ingredient.pricePerUnit * row.amount;
  }, 0);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitError(null);
      const dto = {
        name: values.name,
        description: values.description || undefined,
        batchSize: values.batchSize,
        batchUnit: values.batchUnit,
        ingredients: values.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          amount: i.amount,
        })),
      };
      if (isEdit && recipe) {
        await updateMutation.mutateAsync({ id: recipe.id, dto });
      } else {
        await createMutation.mutateAsync(dto);
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setSubmitError(message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.kavWrapper}
          >
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {isEdit ? 'Edit Resep' : 'Tambah Resep'}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Nama Resep */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Nama Resep"
                      placeholder="contoh: Roti Tawar Original"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.name?.message}
                    />
                  )}
                />

                {/* Deskripsi */}
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Deskripsi (opsional)"
                      placeholder="contoh: Resep standar untuk 1 loyang"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.description?.message}
                    />
                  )}
                />

                {/* Ukuran Batch */}
                <Controller
                  control={control}
                  name="batchSize"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Ukuran Batch"
                      placeholder="0"
                      keyboardType="numeric"
                      value={value === 1 && !isEdit ? '' : String(value)}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.batchSize?.message}
                    />
                  )}
                />

                {/* Satuan Batch — chip picker */}
                <Controller
                  control={control}
                  name="batchUnit"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.chipContainer}>
                      <Text style={styles.chipLabel}>Satuan Batch</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipRow}
                      >
                        {BATCH_UNITS.map((u) => {
                          const active = value === u;
                          return (
                            <TouchableOpacity
                              key={u}
                              onPress={() => onChange(u)}
                              style={[styles.chip, active && styles.chipActive]}
                            >
                              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                {u}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                      {!!errors.batchUnit?.message && (
                        <Text style={styles.fieldError}>{errors.batchUnit.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Komposisi Bahan */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Komposisi Bahan</Text>
                </View>

                {errors.ingredients?.root?.message && (
                  <Text style={[styles.fieldError, { marginBottom: 8 }]}>
                    {errors.ingredients.root.message}
                  </Text>
                )}
                {errors.ingredients?.message && (
                  <Text style={[styles.fieldError, { marginBottom: 8 }]}>
                    {errors.ingredients.message}
                  </Text>
                )}

                {fields.map((field, index) => {
                  const rowIngredient = allIngredients.find(
                    (i) => i.id === watchedIngredients[index]?.ingredientId
                  );
                  const rowAmount = watchedIngredients[index]?.amount ?? 0;
                  const subtotal = rowIngredient ? rowIngredient.pricePerUnit * rowAmount : 0;

                  return (
                    <View key={field.id} style={styles.ingredientRow}>
                      <View style={styles.ingredientRowTop}>
                        {/* Ingredient selector */}
                        <Controller
                          control={control}
                          name={`ingredients.${index}.ingredientId`}
                          render={({ field: f }) => (
                            <TouchableOpacity
                              style={[
                                styles.ingredientPicker,
                                !!errors.ingredients?.[index]?.ingredientId &&
                                  styles.ingredientPickerError,
                              ]}
                              onPress={() => setPickerIndex(index)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.ingredientPickerText,
                                  !f.value && styles.ingredientPickerPlaceholder,
                                ]}
                                numberOfLines={1}
                              >
                                {f.value
                                  ? (allIngredients.find((i) => i.id === f.value)?.name ??
                                    'Pilih bahan...')
                                  : 'Pilih bahan...'}
                              </Text>
                              <Ionicons name="chevron-down" size={16} color="#6B6B6B" />
                            </TouchableOpacity>
                          )}
                        />

                        {/* Amount input */}
                        <Controller
                          control={control}
                          name={`ingredients.${index}.amount`}
                          render={({ field: f }) => (
                            <TextInput
                              style={[
                                styles.amountInput,
                                !!errors.ingredients?.[index]?.amount &&
                                  styles.amountInputError,
                              ]}
                              placeholder="Jml"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="numeric"
                              value={f.value === 0 ? '' : String(f.value)}
                              onChangeText={f.onChange}
                              onBlur={f.onBlur}
                            />
                          )}
                        />

                        {/* Remove button */}
                        <TouchableOpacity
                          onPress={() => remove(index)}
                          style={styles.removeButton}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="close-circle" size={22} color="#DC2626" />
                        </TouchableOpacity>
                      </View>

                      {/* Subtotal preview */}
                      {subtotal > 0 && (
                        <Text style={styles.subtotalText}>
                          {rowIngredient?.unit && `${rowAmount} ${rowIngredient.unit} × `}
                          {formatRupiah(rowIngredient?.pricePerUnit ?? 0)} ={' '}
                          <Text style={styles.subtotalValue}>{formatRupiah(subtotal)}</Text>
                        </Text>
                      )}

                      {/* Row-level errors */}
                      {errors.ingredients?.[index]?.ingredientId?.message && (
                        <Text style={styles.fieldError}>
                          {errors.ingredients[index]?.ingredientId?.message}
                        </Text>
                      )}
                      {errors.ingredients?.[index]?.amount?.message && (
                        <Text style={styles.fieldError}>
                          {errors.ingredients[index]?.amount?.message}
                        </Text>
                      )}
                    </View>
                  );
                })}

                {/* Add row button */}
                <TouchableOpacity
                  style={styles.addRowButton}
                  onPress={() => append({ ingredientId: '', amount: 0 })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#A0813A" />
                  <Text style={styles.addRowText}>Tambah Bahan</Text>
                </TouchableOpacity>

                {/* Live total cost */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Biaya Dasar:</Text>
                  <Text style={styles.totalValue}>{formatRupiah(Math.round(totalCost))}</Text>
                </View>

                {submitError && (
                  <Text style={styles.submitError}>{submitError}</Text>
                )}

                <Button
                  title={isEdit ? 'Simpan Perubahan' : 'Tambah Resep'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  style={styles.submitButton}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Ingredient picker */}
      {pickerIndex !== null && (
        <IngredientPickerModal
          visible={pickerIndex !== null}
          selectedId={watchedIngredients[pickerIndex]?.ingredientId ?? ''}
          onSelect={(id) => {
            setValue(`ingredients.${pickerIndex}.ingredientId`, id, {
              shouldValidate: true,
            });
          }}
          onClose={() => setPickerIndex(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  kavWrapper: {
    maxHeight: '95%',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DDD0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  chipContainer: {
    marginBottom: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#A0813A',
    borderColor: '#A0813A',
  },
  chipText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  fieldError: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  ingredientRow: {
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  ingredientRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientPicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1C4A8',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  ingredientPickerError: {
    borderColor: '#DC2626',
  },
  ingredientPickerText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    marginRight: 4,
  },
  ingredientPickerPlaceholder: {
    color: '#9CA3AF',
  },
  amountInput: {
    width: 72,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1C4A8',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  amountInputError: {
    borderColor: '#DC2626',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtotalText: {
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 6,
  },
  subtotalValue: {
    color: '#A0813A',
    fontWeight: '600',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 16,
  },
  addRowText: {
    fontSize: 14,
    color: '#A0813A',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A0813A',
  },
  submitError: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 4,
  },
});
