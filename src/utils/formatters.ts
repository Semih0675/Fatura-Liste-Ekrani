const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatMoney(amount: number): string {
  return `${moneyFormatter.format(amount)} ₺`;
}

export function formatDate(isoDate: string): string {
  const dateParts = isoDate.split('-').map(Number);
  const [year, month, day] = dateParts;

  if (!year || !month || !day) {
    return isoDate;
  }

  const date = new Date(year, month - 1, day);

  return dateFormatter.format(date);
}
