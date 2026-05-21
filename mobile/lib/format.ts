export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}
