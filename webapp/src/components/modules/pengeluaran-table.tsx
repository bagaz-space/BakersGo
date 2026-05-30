'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@bakersgo/types';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  OPERASIONAL: 'Operasional',
  LISTRIK: 'Listrik',
  GAJI: 'Gaji',
  LAINNYA: 'Lainnya',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = now.toISOString().split('T')[0];
  return { from, to };
}

const schema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.enum(['BAHAN_BAKU', 'OPERASIONAL', 'LISTRIK', 'GAJI', 'LAINNYA']),
  description: z.string().min(1, 'Keterangan wajib diisi'),
  amount: z.coerce.number().positive('Jumlah harus > 0'),
});
type FormValues = z.infer<typeof schema>;

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function ExpenseModal({
  expense,
  onClose,
}: {
  expense: Expense | null;
  onClose: () => void;
}) {
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const isEdit = expense !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: expense
      ? {
          date: expense.date.split('T')[0],
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
        }
      : { date: new Date().toISOString().split('T')[0], category: 'OPERASIONAL' },
  });

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      await update.mutateAsync({ id: expense!.id, dto: values });
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
            {isEdit ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal</label>
            <input type="date" {...register('date')} className={fieldCls} />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Kategori</label>
            <div className="relative">
              <select {...register('category')} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]" />
            </div>
            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Pilih kategori yang paling sesuai untuk memudahkan analisis pengeluaran di laporan.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Keterangan</label>
            <input {...register('description')} className={fieldCls} placeholder="cth: Beli tepung terigu 25kg" />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah (Rp)</label>
            <input type="number" step="1" min="0" {...register('amount')} className={fieldCls} placeholder="150000" />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

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

function DeleteConfirm({ description, onConfirm, onCancel }: { description: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus Pengeluaran</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-medium text-foreground">{description}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export function PengeluaranTable() {
  const defaultRange = getMonthRange();
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  const { data, isLoading, error } = useExpenses(from, to);
  const deleteExpense = useDeleteExpense();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(e: Expense) { setEditing(e); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteExpense.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const expenses = data?.data ?? [];
  const totalAmount = data?.totalAmount ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Dari</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Sampai</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
            />
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          Tambah Pengeluaran
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat data. Pastikan Anda sudah login.
        </div>
      )}

      {/* Mobile: card list */}
      <div className="sm:hidden">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Memuat data...</p>
        ) : expenses.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Belum ada pengeluaran di periode ini.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-[#A0813A]/10 px-2.5 py-0.5 text-xs font-medium text-[#A0813A]">
                        {CATEGORY_LABELS[exp.category]}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(exp.date)}</span>
                    </div>
                    <p className="text-sm text-foreground">{exp.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(exp.amount)}</p>
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      <button onClick={() => openEdit(exp)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(exp)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Keterangan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Jumlah</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">Memuat data...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada pengeluaran di periode ini.</td></tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#A0813A]/10 px-2.5 py-0.5 text-xs font-medium text-[#A0813A]">
                      {CATEGORY_LABELS[exp.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{exp.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(exp.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(exp)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(exp)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
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

      {expenses.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3">
          <span className="text-sm font-medium text-[#A0813A]">Total Pengeluaran ({expenses.length} transaksi)</span>
          <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(totalAmount)}</span>
        </div>
      )}

      {modalOpen && <ExpenseModal expense={editing} onClose={closeModal} />}
      {deleting && (
        <DeleteConfirm
          description={deleting.description}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
