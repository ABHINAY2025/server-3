// src/utils/formatAmount.ts
export function formatAmount(
  amount: number,           // ✅ explicitly typed
  decimals: number = 1,
  currencySymbol: string = ""
): string {
  if (amount === null || amount === undefined || isNaN(amount))
    return `${currencySymbol}0`;

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  let formatted = "";

  if (absAmount >= 1_000_000_000_000) {
    formatted = (absAmount / 1_000_000_000_000).toFixed(decimals) + " Tn";
  } else if (absAmount >= 1_000_000_000) {
    formatted = (absAmount / 1_000_000_000).toFixed(decimals) + " Bn";
  } else if (absAmount >= 1_000_000) {
    formatted = (absAmount / 1_000_000).toFixed(decimals) + " Mn";
  } else if (absAmount >= 1_000) {
    formatted = (absAmount / 1_000).toFixed(decimals) + " K";
  } else {
    formatted = absAmount.toFixed(decimals);
  }

  return `${sign}${currencySymbol}${formatted}`;
}
