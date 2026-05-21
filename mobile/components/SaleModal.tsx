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
import { useCreateSale, useUpdateSale } from '@/hooks/useSales';
import { useHppEntries } from '@/hooks/useHpp';
import { HppPickerModal } from '@/components/HppPickerModal';
import { formatRupiah, getTodayString } from '@/lib/format';
import type { Sale, CreateSaleDto } from '@/hooks/useSales';

const CHANNELS = ['RESELLER', 'END_USER'] as const;
type Channel = typeof CHANNELS[number];

const CHANNEL_LABELS: Record<Channel, string> = {
  RESELLER: 'Reseller',
  END_USER: 'End User',
};

const schema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  itemName: z.string().min(1, 'Nama produk wajib diisi'),
  qty: z.coerce.number().int().positive('Qty harus > 0'),
  pricePerUnit: z.coerce.number().positive('Harga harus > 0'),
});

type FormValues = z.infer<typeof schema>;

export interface SaleModalProps {
  visible: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export function SaleModal({ visible, sale, onClose }: SaleModalProps) {
  const isEdit = sale !== null;
  const createMutation = useCreateSale();
  const updateMutation = useUpdateSale();
  const { data: hppData } = useHppEntries();
  const hppEntries = hppData?.data ?? [];

  const [hppEntryId, setHppEntryId] = useState('');
  const [channel, setChannel] = useState<Channel>('RESELLER');
  const [hppPickerVisible, setHppPickerVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      date: getTodayString(),
      itemName: '',
      qty: 0,
      pricePerUnit: 0,
    },
  });

  useEffect(() => {
    if (visible) {
      if (sale) {
        reset({
          date: sale.date.split('T')[0],
          itemName: sale.itemName,
          qty: sale.qty,
          pricePerUnit: sale.pricePerUnit,
        });
      } else {
        reset({
          date: getTodayString(),
          itemName: '',
          qty: 0,
          pricePerUnit: 0,
        });
        setHppEntryId('');
        setChannel('RESELLER');
      }
    } else {
      setSubmitError(null);
    }
  }, [visible, sale, reset]);

  // HPP autofill effect
  useEffect(() => {
    if (!hppEntryId || isEdit) return;
    const entry = hppEntries.find((h) => h.id === hppEntryId);
    if (!entry) return;
    setValue('itemName', entry.recipeName);
    setValue('pricePerUnit', channel === 'RESELLER' ? entry.hargaReseller : entry.hargaEndUser);
  }, [hppEntryId, channel, hppEntries, setValue, isEdit]);

  const watchedQty = watch('qty');
  const watchedPrice = watch('pricePerUnit');
  const total = (Number(watchedQty) || 0) * (Number(watchedPrice) || 0);

  const selectedHppEntry = hppEntries.find((h) => h.id === hppEntryId);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitError(null);
      const dto: CreateSaleDto = {
        date: values.date,
        itemName: values.itemName,
        qty: values.qty,
        pricePerUnit: values.pricePerUnit,
        ...(hppEntryId && !isEdit ? { recipeId: selectedHppEntry?.recipeId } : {}),
      };
      if (isEdit && sale) {
        await updateMutation.mutateAsync({ id: sale.id, dto });
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
                  {isEdit ? 'Edit Penjualan' : 'Tambah Penjualan'}
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

                {/* HPP Autofill — add mode only */}
                {!isEdit && hppEntries.length > 0 && (
                  <View style={styles.hppSection}>
                    <Text style={styles.hppSectionLabel}>Autofill dari HPP (Opsional)</Text>

                    {/* HPP picker button */}
                    <TouchableOpacity
                      style={styles.hppPickerButton}
                      onPress={() => setHppPickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.hppPickerText, !selectedHppEntry && styles.hppPickerPlaceholder]}>
                        {selectedHppEntry ? selectedHppEntry.recipeName : 'Pilih produk dari HPP...'}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#6B6B6B" />
                    </TouchableOpacity>

                    {/* Channel chips */}
                    {hppEntryId !== '' && (
                      <View style={styles.channelContainer}>
                        <Text style={styles.chipLabel}>Channel</Text>
                        <View style={styles.channelRow}>
                          {CHANNELS.map((c) => {
                            const active = channel === c;
                            return (
                              <TouchableOpacity
                                key={c}
                                onPress={() => setChannel(c)}
                                style={[styles.chip, active && styles.chipActive]}
                              >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                  {CHANNEL_LABELS[c]}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Nama Produk */}
                <Controller
                  control={control}
                  name="itemName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Nama Produk"
                      placeholder="contoh: Croissant Butter"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.itemName?.message}
                    />
                  )}
                />

                {/* Qty */}
                <Controller
                  control={control}
                  name="qty"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Qty"
                      placeholder="0"
                      keyboardType="numeric"
                      value={value === 0 ? '' : String(value)}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.qty?.message}
                    />
                  )}
                />

                {/* Harga per pcs */}
                <Controller
                  control={control}
                  name="pricePerUnit"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.priceContainer}>
                      <Text style={styles.fieldLabel}>Harga/pcs (Rp)</Text>
                      <View
                        style={[
                          styles.priceInputRow,
                          !!errors.pricePerUnit && styles.priceInputRowError,
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
                      {!!errors.pricePerUnit?.message && (
                        <Text style={styles.fieldError}>{errors.pricePerUnit.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Live total preview */}
                {total > 0 && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Total:</Text>
                    <Text style={styles.previewValue}>{formatRupiah(total)}</Text>
                  </View>
                )}

                {submitError && (
                  <Text style={styles.submitError}>{submitError}</Text>
                )}

                <Button
                  title={isEdit ? 'Simpan Perubahan' : 'Tambah Penjualan'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  style={styles.submitButton}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <HppPickerModal
        visible={hppPickerVisible}
        selectedId={hppEntryId}
        onSelect={(id) => setHppEntryId(id)}
        onClose={() => setHppPickerVisible(false)}
      />
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
  hppSection: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
  },
  hppSectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 10,
  },
  hppPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5DDD0',
  },
  hppPickerText: {
    fontSize: 15,
    color: '#1A1A1A',
    flex: 1,
  },
  hppPickerPlaceholder: {
    color: '#9CA3AF',
  },
  channelContainer: {
    marginTop: 12,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 8,
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
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
