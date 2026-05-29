'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSales,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
} from '@/hooks/useSales';
import { useHppEntries } from '@/hooks/useHpp';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale } from '@bakersgo/types';

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = now.toISOString().split('T')[0];
  return { from, to };
}

const schema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  hppEntryId: z.string().optional(),
  channel: z.enum(['RESELLER', 'END_USER']).optional(),
  itemName: z.string().min(1, 'Nama produk wajib diisi'),
  qty: z.coerce.number().int().positive('Qty harus > 0'),
  pricePerUnit: z.coerce.number().positive('Harga harus > 0'),
});
type FormValues = z.infer<typeof schema>;

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function SaleModal({
  sale,
  onClose,
}: {
  sale: Sale | null;
  onClose: () => void;
}) {
  const create = useCreateSale();
  const update = useUpdateSale();
  const { data: hppData } = useHppEntries();
  const isEdit = sale !== null;

  const hppEntries = hppData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: sale
      ? {
          date: sale.date.split('T')[0],
          itemName: sale.itemName,
          qty: sale.qty,
          pricePerUnit: sale.pricePerUnit,
        }
      : { date: new Date().toISOString().split('T')[0], qty: 1 },
  });

  const hppEntryId = useWatch({ control, name: 'hppEntryId' });
  const channel = useWatch({ control, name: 'channel' });
  const qty = useWatch({ control, name: 'qty' }) ?? 0;
  const pricePerUnit = useWatch({ control, name: 'pricePerUnit' }) ?? 0;
  const previewTotal = qty * pricePerUnit;

  useEffect(() => {
    if (!hppEntryId || !channel) return;
    const entry = hppEntries.find((e) => e.id === hppEntryId);
    if (!entry) return;
    setValue('itemName', entry.recipeName);
    setValue(
      'pricePerUnit',
      channel === 'RESELLER' ? entry.hargaReseller : entry.hargaEndUser,
    );
  }, [hppEntryId, channel, hppEntries, setValue]);

  async function onSubmit(values: FormValues) {
    const dto = {
      date: values.date,
      itemName: values.itemName,
      qty: values.qty,
      pricePerUnit: values.pricePerUnit,
      recipeId: values.hppEntryId
        ? hppEntries.find((e) => e.id === values.hppEntryId)?.recipeId
        : undefined,
    };
    if (isEdit) {
      await update.mutateAsync({ id: sale!.id, dto });
    } else {
      await create.mutateAsync(dto);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Penjualan' : 'Tambah Penjualan'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal</label>
            <input type="date" {...register('date')} className={fieldCls} />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {!isEdit && hppEntries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Produk (HPP)</label>
                <div className="relative">
                  <select {...register('hppEntryId')} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
                    <option value="">— Manual —</option>
                    {hppEntries.map((e) => (
                      <option key={e.id} value={e.id}>{e.recipeName}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Pilih dari HPP tersimpan agar nama produk dan harga terisi otomatis, atau pilih &apos;Manual&apos; untuk isi sendiri.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Channel</label>
                <div className="relative">
                  <select {...register('channel')} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
                    <option value="">— Pilih —</option>
                    <option value="RESELLER">Reseller</option>
                    <option value="END_USER">End User</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Reseller: harga dengan margin reseller. End User: harga eceran langsung ke pembeli.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nama Produk</label>
            <input {...register('itemName')} className={fieldCls} placeholder="cth: Croissant Butter" />
            {errors.itemName && <p className="mt-1 text-xs text-destructive">{errors.itemName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Qty</label>
              <input type="number" min="1" step="1" {...register('qty')} className={fieldCls} placeholder="10" />
              {errors.qty && <p className="mt-1 text-xs text-destructive">{errors.qty.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Harga/pcs (Rp)</label>
              <input type="number" min="0" step="1" {...register('pricePerUnit')} className={fieldCls} placeholder="25000" />
              {errors.pricePerUnit && <p className="mt-1 text-xs text-destructive">{errors.pricePerUnit.message}</p>}
            </div>
          </div>

          {previewTotal > 0 && (
            <div className="rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#A0813A]">Total</span>
              <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(previewTotal)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ itemName, onConfirm, onCancel }: { itemName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus Penjualan</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus penjualan <span className="font-medium text-foreground">{itemName}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export function PenjualanTable() {
  const defaultRange = getMonthRange();
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  const { data, isLoading, error } = useSales(from, to);
  const deleteSale = useDeleteSale();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(s: Sale) { setEditing(s); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteSale.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const sales = data?.data ?? [];
  const totalRevenue = data?.totalRevenue ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Dari</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Sampai</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
            />
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#A0813A] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          Tambah Penjualan
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat data. Pastikan Anda sudah login.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produk</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga/pcs</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Memuat data...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada penjualan di periode ini.</td></tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(s.date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.itemName}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{s.qty}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(s.pricePerUnit)}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(s.totalRevenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
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
      </div>

      {sales.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3">
          <span className="text-sm font-medium text-[#A0813A]">Total Penjualan ({sales.length} transaksi)</span>
          <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(totalRevenue)}</span>
        </div>
      )}

      {modalOpen && <SaleModal sale={editing} onClose={closeModal} />}
      {deleting && (
        <DeleteConfirm
          itemName={deleting.itemName}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
