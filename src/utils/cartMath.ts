/** Pure helpers for cart totals (easy to unit test). */

export function lineSubtotal(price: number, qty: number): number {
  if (qty <= 0 || price < 0) return 0;
  return price * qty;
}

export function cartTotal(
  lines: { price: number; qty: number }[]
): number {
  return lines.reduce((sum, l) => sum + lineSubtotal(l.price, l.qty), 0);
}

export function cartItemCount(lines: { qty: number }[]): number {
  return lines.reduce((sum, l) => sum + Math.max(0, l.qty || 0), 0);
}
