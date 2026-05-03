'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from '@/hooks/useIngredients';
import { formatCurrency } from '@/lib/utils';
import type { Ingredient } from '@bakersgo/types';

const UNIT_OPTIONS = ['gram', 'kg', 'ml', 'liter', 'pcs', 'butir', 'pack'] as const;

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  packagePrice: z.coerce.number().positive('Harga harus > 0'),
  packageVolume: z.coerce.number().positive('Volume harus > 0'),
  stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
});
type FormValues = z.infer<typeof schema>;

/** Restrict input to digits and at most 2 decimal places */
function handleDecimalInput(e: React.FormEvent<HTMLInputElement>) {
  const input = e.currentTarget;
  const cleaned = input.value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  input.value = parts.length > 2
    ? parts[0] + '.' + parts.slice(1).join('')
    : parts[0] + (parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '');
}

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function IngredientModal({
  ingredient,
  onClose,
}: {
  ingredient: Ingredient | null;
  onClose: () => void;
}) {
  const create = useCreateIngredient();
  const update = useUpdateIngredient();
  const isEdit = ingredient !== null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: ingredient
      ? {
          name: ingredient.name,
          unit: ingredient.unit,
          packagePrice: ingredient.packagePrice,
          packageVolume: ingredient.packageVolume,
          stock: ingredient.stock,
        }
      : { unit: 'gram', stock: 0 },
  });

  const packagePrice = watch('packagePrice') ?? 0;
  const packageVolume = watch('packageVolume') ?? 0;
  // Safety: avoid division by zero or empty volume
  const pricePerUnit = packageVolume > 0 ? packagePrice / packageVolume : 0;

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      await update.mutateAsync({ id: ingredient!.id, dto: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Bahan' : 'Tambah Bahan'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nama Bahan */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Nama Bahan</label>
              <input
                {...register('name')}
                className={fieldCls}
                placeholder="cth: Tepung Terigu"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Satuan — dropdown */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Satuan</label>
              <div className="relative">
                <select
                  {...register('unit')}
                  className={`${fieldCls} appearance-none pr-9 cursor-pointer`}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]"
                />
              </div>
              {errors.unit && <p className="mt-1 text-xs text-destructive">{errors.unit.message}</p>}
            </div>

            {/* Stok — decimal */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Stok</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('stock')}
                onInput={handleDecimalInput}
                className={fieldCls}
                placeholder="0.00"
              />
              {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            {/* Harga Kemasan */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Harga Kemasan (Rp)</label>
              <input
                type="number"
                step="1"
                min="0"
                {...register('packagePrice')}
                className={fieldCls}
                placeholder="15000"
              />
              {errors.packagePrice && <p className="mt-1 text-xs text-destructive">{errors.packagePrice.message}</p>}
            </div>

            {/* Volume Kemasan — decimal */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Volume Kemasan</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('packageVolume')}
                onInput={handleDecimalInput}
                className={fieldCls}
                placeholder="1000.00"
              />
              {errors.packageVolume && <p className="mt-1 text-xs text-destructive">{errors.packageVolume.message}</p>}
            </div>
          </div>

          {/* Live price-per-unit preview */}
          <div className="rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#A0813A]">Harga per Satuan</span>
            <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(pricePerUnit)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus Bahan</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-medium text-foreground">{name}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export function MasterBahanTable() {
  const { data, isLoading, error } = useIngredients();
  const deleteIngredient = useDeleteIngredient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [deleting, setDeleting] = useState<Ingredient | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(ing: Ingredient) { setEditing(ing); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteIngredient.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const ingredients = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Memuat...' : `${ingredients.length} bahan terdaftar`}
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <Plus size={14} />
          Tambah Bahan
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat data. Pastikan Anda sudah login.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nama Bahan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Satuan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga Kemasan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Volume</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga/Satuan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Stok</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Memuat data...</td></tr>
            ) : ingredients.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada bahan baku. Klik &quot;Tambah Bahan&quot; untuk memulai.</td></tr>
            ) : (
              ingredients.map((ing) => (
                <tr key={ing.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{ing.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ing.unit}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(ing.packagePrice)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {ing.packageVolume.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#A0813A]">{formatCurrency(ing.pricePerUnit)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {ing.stock.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(ing)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleting(ing)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && <IngredientModal ingredient={editing} onClose={closeModal} />}
      {deleting && (
        <DeleteConfirm
          name={deleting.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
