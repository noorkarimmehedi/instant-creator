export function formatTaka(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `৳${formatted}`;
}

export function readPercentageValue(value: FormDataEntryValue | string | number | null) {
  const percentage = Number(value ?? 0);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
  return percentage;
}
