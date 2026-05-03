'use client';

export function HppCalculator() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Hitung Harga Pokok Produksi dari resep yang tersimpan.
      </p>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground text-center py-8">
          Pilih resep untuk menghitung HPP. Pastikan sudah menambahkan resep di menu Master Resep.
        </p>
      </div>
    </div>
  );
}
