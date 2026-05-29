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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { getTodayString } from '@/lib/format';
import type { Expense, ExpenseCategory, CreateExpenseDto } from '@/hooks/useExpenses';

const CATEGORIES: ExpenseCategory[] = ['BAHAN_BAKU', 'OPERASIONAL', 'LISTRIK', 'GAJI', 'LAINNYA'];

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  OPERASIONAL: 'Operasional',
  LISTRIK: 'Listrik',
  GAJI: 'Gaji',
  LAINNYA: 'Lainnya',
};

const schema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.enum(['BAHAN_BAKU', 'OPERASIONAL', 'LISTRIK', 'GAJI', 'LAINNYA']),
  description: z.string().min(1, 'Keterangan wajib diisi'),
  amount: z.coerce.number().positive('Jumlah harus > 0'),
});

type FormValues = z.infer<typeof schema>;

export interface ExpenseModalProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export function ExpenseModal({ visible, expense, onClose }: ExpenseModalProps) {
  const isEdit = expense !== null;
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: getTodayString(),
      category: 'OPERASIONAL',
      description: '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (visible) {
      if (expense) {
        reset({
          date: expense.date.split('T')[0],
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
        });
      } else {
        reset({
          date: getTodayString(),
          category: 'OPERASIONAL',
          description: '',
          amount: 0,
        });
      }
    } else {
      setSubmitError(null);
    }
  }, [visible, expense, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitError(null);
      const dto: CreateExpenseDto = {
        date: values.date,
        category: values.category,
        description: values.description,
        amount: values.amount,
      };
      if (isEdit && expense) {
        await updateMutation.mutateAsync({ id: expense.id, dto });
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
                {isEdit ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
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
              {/* Tanggal */}
              <Controller
                control={control}
                name="date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Tanggal"
                    placeholder="2026-05-01"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.date?.message}
                  />
                )}
              />

              {/* Kategori — chip picker */}
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    <Text style={styles.chipLabel}>Kategori</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      {CATEGORIES.map((cat) => {
                        const active = value === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => onChange(cat)}
                            style={[styles.chip, active && styles.chipActive]}
                          >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                              {CATEGORY_LABELS[cat]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    {!!errors.category?.message && (
                      <Text style={styles.fieldError}>{errors.category.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Keterangan */}
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Keterangan"
                    placeholder="contoh: Beli tepung terigu 25kg"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description?.message}
                  />
                )}
              />

              {/* Jumlah */}
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.priceContainer}>
                    <Text style={styles.fieldLabel}>Jumlah (Rp)</Text>
                    <View
                      style={[
                        styles.priceInputRow,
                        !!errors.amount && styles.priceInputRowError,
                      ]}
                    >
                      <Text style={styles.inputPrefix}>Rp</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                        value={value === 0 ? '' : String(value)}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </View>
                    {!!errors.amount?.message && (
                      <Text style={styles.fieldError}>{errors.amount.message}</Text>
                    )}
                  </View>
                )}
              />

              {submitError && (
                <Text style={styles.submitError}>{submitError}</Text>
              )}

              <Button
                title={isEdit ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
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
  fieldError: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
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
