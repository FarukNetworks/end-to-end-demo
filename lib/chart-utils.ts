export const chartColors = {
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
};

export const categoryColors = [
  chartColors.success,
  chartColors.warning,
  chartColors.primary,
  chartColors.purple,
  chartColors.danger,
  chartColors.pink,
  chartColors.teal,
  chartColors.orange,
];

export const chartConfig = {
  responsive: {
    width: '100%',
    height: 300,
  },
  margin: {
    top: 5,
    right: 30,
    left: 20,
    bottom: 5,
  },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}
