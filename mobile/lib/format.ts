export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return sign + 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}
