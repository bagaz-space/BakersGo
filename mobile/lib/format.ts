export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return sign + 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}
