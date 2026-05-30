export const formatCurrency = (value: number | string | undefined | null): string => {
  const num = Number(value || 0);
  return `RM ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
