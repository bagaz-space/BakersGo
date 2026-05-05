'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Trash2, Pencil } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useHppEntries, useSaveHpp, useUpdateHpp, useDeleteHpp } from '@/hooks/useHpp';
import { formatCurrency } from '@/lib/utils';
import type { HppEntry } from '@bakersgo/types';

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function CostInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type="number"
        min="0"
        step="1"
        value={value || ''}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={fieldCls}
        placeholder="0"
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight,
  separator,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  separator?: boolean;
}) {
  return (
    <>
      {separator && <div className="border-t border-border" />}
      <div className="flex items-center justify-between py-2">
        <span className={highlight ? 'text-sm font-semibold text-[#A0813A]' : 'text-sm text-muted-foreground'}>
          {label}
        </span>
        <span className={highlight ? 'text-sm font-bold text-[#A0813A]' : 'text-sm font-medium text-foreground'}>
          {formatCurrency(value)}
        </span>
      </div>
    </>
  );
}

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus HPP</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus HPP untuk{' '}
          <span className="font-medium text-foreground">{name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export function HppCalculator() {
  const { data: recipesData, isLoading: recipesLoading } = useRecipes();
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
  const [deleting, setDeleting] = useState<HppEntry | null>(null);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) ?? null;

  const result = useMemo(() => {
    if (!selectedRecipe) return null;
    const baseRecipeCost = selectedRecipe.baseRecipeCost;
    const totalZonaDapur = listrik + gas + tenagaKerja + overhead;
    const totalZonaFinal = kotak + stiker + kemasanLain;
    const hppTotal = baseRecipeCost + totalZonaDapur + totalZonaFinal;
    const hppPerUnit = selectedRecipe.batchSize > 0 ? hppTotal / selectedRecipe.batchSize : 0;
    const hargaReseller = hppPerUnit * (1 + marginReseller / 100);
    const hargaEndUser = hppPerUnit * (1 + marginEndUser / 100);
    return {
      baseRecipeCost,
      totalZonaDapur,
      totalZonaFinal,
      hppTotal,
      hppPerUnit,
      hargaReseller,
      hargaEndUser,
      profitReseller: hargaReseller - hppPerUnit,
      profitEndUser: hargaEndUser - hppPerUnit,
    };
  }, [selectedRecipe, listrik, gas, tenagaKerja, overhead, kotak, stiker, kemasanLain, marginReseller, marginEndUser]);

  function handleRecipeChange(id: string) {
    setSelectedRecipeId(id);
    setEditingEntry(null);
    setSaved(false);
    setListrik(0); setGas(0); setTenagaKerja(0); setOverhead(0);
    setKotak(0); setStiker(0); setKemasanLain(0);
    setMarginReseller(0); setMarginEndUser(0);
  }

  function handleEditEntry(entry: HppEntry) {
    setEditingEntry(entry);
    setSelectedRecipeId(entry.recipeId);
    setSaved(false);
    setListrik(entry.listrik);
    setGas(entry.gas);
    setTenagaKerja(entry.tenagaKerja);
    setOverhead(entry.overhead);
    setKotak(entry.kotak);
    setStiker(entry.stiker);
    setKemasanLain(entry.kemasanLain);
    setMarginReseller(entry.marginReseller);
    setMarginEndUser(entry.marginEndUser);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingEntry(null);
    setSaved(false);
    setSelectedRecipeId('');
    setListrik(0); setGas(0); setTenagaKerja(0); setOverhead(0);
    setKotak(0); setStiker(0); setKemasanLain(0);
    setMarginReseller(0); setMarginEndUser(0);
  }

  async function handleSave() {
    if (!selectedRecipe || !result) return;
    const dto = {
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      batchSize: selectedRecipe.batchSize,
      batchUnit: selectedRecipe.batchUnit,
      baseRecipeCost: result.baseRecipeCost,
      listrik, gas, tenagaKerja, overhead,
      kotak, stiker, kemasanLain,
      marginReseller, marginEndUser,
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
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteHpp.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const isPending = saveHpp.isPending || updateHpp.isPending;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Hitung Harga Pokok Produksi dari resep yang tersimpan.
      </p>

      {editingEntry && (
        <div className="rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/30 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-medium text-[#A0813A]">
            Mengedit HPP: <span className="font-semibold">{editingEntry.recipeName}</span>
          </p>
          <button
            onClick={handleCancelEdit}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Batal Edit
          </button>
        </div>
      )}

      {/* Recipe selector */}
      <SectionCard title="Pilih Resep">
        {recipesLoading ? (
          <p className="text-sm text-muted-foreground">Memuat resep...</p>
        ) : recipes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada resep. Tambahkan resep di menu Master Resep terlebih dahulu.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <select
                value={selectedRecipeId}
                onChange={(e) => handleRecipeChange(e.target.value)}
                disabled={!!editingEntry}
                className={`${fieldCls} appearance-none pr-9 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">Pilih resep...</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]"
              />
            </div>

            {selectedRecipe && (
              <div className="rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ukuran Batch</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedRecipe.batchSize.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{' '}
                    {selectedRecipe.batchUnit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Biaya Dasar Resep</p>
                  <p className="text-sm font-semibold text-[#A0813A]">
                    {formatCurrency(selectedRecipe.baseRecipeCost)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {selectedRecipe && (
        <>
          {/* Zona Dapur */}
          <SectionCard title="Zona Dapur — Biaya Operasional">
            <div className="grid grid-cols-2 gap-4">
              <CostInput label="Biaya Listrik (Rp)" value={listrik} onChange={(v) => { setListrik(v); setSaved(false); }} />
              <CostInput label="Biaya Gas (Rp)" value={gas} onChange={(v) => { setGas(v); setSaved(false); }} />
              <CostInput label="Upah Tenaga Kerja (Rp)" value={tenagaKerja} onChange={(v) => { setTenagaKerja(v); setSaved(false); }} />
              <CostInput label="Overhead Lainnya (Rp)" value={overhead} onChange={(v) => { setOverhead(v); setSaved(false); }} />
            </div>
          </SectionCard>

          {/* Zona Final */}
          <SectionCard title="Zona Final — Biaya Kemasan">
            <div className="grid grid-cols-2 gap-4">
              <CostInput label="Biaya Kotak/Box (Rp)" value={kotak} onChange={(v) => { setKotak(v); setSaved(false); }} />
              <CostInput label="Biaya Stiker (Rp)" value={stiker} onChange={(v) => { setStiker(v); setSaved(false); }} />
              <CostInput label="Kemasan Lainnya (Rp)" value={kemasanLain} onChange={(v) => { setKemasanLain(v); setSaved(false); }} />
            </div>
          </SectionCard>

          {/* Margin */}
          <SectionCard title="Zona Penjualan — Margin">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Margin Reseller (%)</label>
                <input
                  type="number" min="0" step="1"
                  value={marginReseller || ''}
                  onChange={(e) => { setMarginReseller(Math.max(0, Number(e.target.value) || 0)); setSaved(false); }}
                  className={fieldCls} placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Margin End User (%)</label>
                <input
                  type="number" min="0" step="1"
                  value={marginEndUser || ''}
                  onChange={(e) => { setMarginEndUser(Math.max(0, Number(e.target.value) || 0)); setSaved(false); }}
                  className={fieldCls} placeholder="0"
                />
              </div>
            </div>
          </SectionCard>

          {/* Results */}
          {result && (
            <div className="rounded-2xl border border-[#A0813A]/30 bg-[#A0813A]/5 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Hasil Kalkulasi HPP</h3>

              <div className="space-y-1">
                <ResultRow label="Biaya Dasar Resep" value={result.baseRecipeCost} />
                <ResultRow label="Total Zona Dapur" value={result.totalZonaDapur} />
                <ResultRow label="Total Zona Final" value={result.totalZonaFinal} />
                <ResultRow label="HPP Total (1 Batch)" value={result.hppTotal} highlight separator />
                <ResultRow
                  label={`HPP per Unit (÷ ${selectedRecipe.batchSize} ${selectedRecipe.batchUnit})`}
                  value={result.hppPerUnit}
                  highlight
                />

                <div className="border-t border-border pt-2 mt-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Harga Jual</p>
                  <ResultRow label={`Harga Reseller (+${marginReseller}%)`} value={result.hargaReseller} />
                  <ResultRow label="Profit Reseller / Unit" value={result.profitReseller} />
                  <div className="border-t border-border/50" />
                  <ResultRow label={`Harga End User (+${marginEndUser}%)`} value={result.hargaEndUser} />
                  <ResultRow label="Profit End User / Unit" value={result.profitEndUser} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#A0813A]/20">
                {saved ? (
                  <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-center">
                    <p className="text-sm font-medium text-green-600">
                      HPP berhasil {editingEntry ? 'diperbarui' : 'disimpan'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {isPending ? 'Menyimpan...' : editingEntry ? 'Update HPP ini' : 'Simpan HPP ini'}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Saved HPP list */}
      {hppEntries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">HPP Tersimpan</h3>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Resep</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">HPP/Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga Reseller</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga End User</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {hppEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-border last:border-0 transition-colors ${
                      editingEntry?.id === entry.id
                        ? 'bg-[#A0813A]/10'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{entry.recipeName}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.batchSize} {entry.batchUnit} / batch
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#A0813A]">
                      {formatCurrency(entry.hppPerUnit)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(entry.hargaReseller)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatCurrency(entry.hargaEndUser)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleting(entry)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleting && (
        <DeleteConfirm
          name={deleting.recipeName}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
