import React, { useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import type { Ingredient } from '@bakersgo/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients';

const UNITS = ['gram', 'kg', 'ml', 'liter', 'pcs', 'butir', 'pack'] as const;

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  packagePrice: z.coerce.number().positive('Harga harus > 0'),
  packageVolume: z.coerce.number().positive('Volume harus > 0'),
  stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
});

type FormValues = z.infer<typeof schema>;

export interface IngredientModalProps {
  visible: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
}

export function IngredientModal({ visible, ingredient, onClose }: IngredientModalProps) {
  const isEdit = ingredient !== null;
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      unit: 'gram',
      packagePrice: undefined as unknown as number,
      packageVolume: undefined as unknown as number,
      stock: undefined as unknown as number,
    },
  });

  useEffect(() => {
    if (visible) {
      if (ingredient) {
        reset({
          name: ingredient.name,
          unit: ingredient.unit,
          packagePrice: ingredient.packagePrice,
          packageVolume: ingredient.packageVolume,
          stock: ingredient.stock,
        });
      } else {
        reset({
          name: '',
          unit: 'gram',
          packagePrice: undefined as unknown as number,
          packageVolume: undefined as unknown as number,
          stock: undefined as unknown as number,
        });
      }
    }
  }, [visible, ingredient, reset]);

  const watchedPrice = watch('packagePrice');
  const watchedVolume = watch('packageVolume');
  const pricePerUnit =
    watchedPrice > 0 && watchedVolume > 0
      ? Math.round(watchedPrice / watchedVolume)
      : 0;
  const unitLabel = watch('unit') || 'satuan';

  const onSubmit = async (values: FormValues) => {
    if (isEdit && ingredient) {
      await updateMutation.mutateAsync({ id: ingredient.id, dto: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavWrapper}
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {isEdit ? 'Edit Bahan' : 'Tambah Bahan'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Nama Bahan */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nama Bahan"
                    placeholder="contoh: Tepung Terigu"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />

              {/* Satuan — chip picker */}
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    <Text style={styles.chipLabel}>Satuan</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      {UNITS.map((u) => {
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
                    {!!errors.unit?.message && (
                      <Text style={styles.fieldError}>{errors.unit.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Harga Kemasan */}
              <Controller
                control={control}
                name="packagePrice"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.priceContainer}>
                    <Text style={styles.fieldLabel}>Harga Kemasan</Text>
                    <View
                      style={[
                        styles.priceInputRow,
                        !!errors.packagePrice && styles.priceInputRowError,
                      ]}
                    >
                      <Text style={styles.inputPrefix}>Rp</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                        value={value !== undefined && !isNaN(value) ? String(value) : ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </View>
                    {!!errors.packagePrice?.message && (
                      <Text style={styles.fieldError}>{errors.packagePrice.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Volume Kemasan */}
              <Controller
                control={control}
                name="packageVolume"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Volume Kemasan"
                    placeholder="0"
                    keyboardType="numeric"
                    value={value !== undefined && !isNaN(value) ? String(value) : ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.packageVolume?.message}
                  />
                )}
              />

              {/* Stok Awal */}
              <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Stok Awal"
                    placeholder="0"
                    keyboardType="numeric"
                    value={value !== undefined && !isNaN(value) ? String(value) : ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.stock?.message}
                  />
                )}
              />

              {/* Live preview */}
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Harga per Satuan:</Text>
                <Text style={styles.previewValue}>
                  Rp {pricePerUnit.toLocaleString('id-ID')}/{unitLabel}
                </Text>
              </View>

              <Button
                title={isEdit ? 'Simpan Perubahan' : 'Tambah Bahan'}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  kavWrapper: {
    maxHeight: '92%',
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
  priceContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1C4A8',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  priceInputRowError: {
    borderColor: '#DC2626',
  },
  inputPrefix: {
    fontSize: 15,
    color: '#6B6B6B',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0813A',
  },
  submitButton: {
    marginTop: 4,
  },
});
