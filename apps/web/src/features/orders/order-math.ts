/**
 * Order totals for the create/edit forms.
 * Works in satang (integer) to avoid floating point errors; the API remains the source of truth.
 */
export interface LineInput {
  qty: number;
  /** Unit price in baht */
  price: number;
}

const toSatang = (baht: number) => Math.round(baht * 100);

export function lineTotal(line: LineInput): number {
  return (toSatang(line.price) * Math.max(0, Math.trunc(line.qty))) / 100;
}

export function orderTotals(lines: LineInput[], shippingFee = 0) {
  const itemsSatang = lines.reduce((sum, l) => sum + toSatang(lineTotal(l)), 0);
  const items = itemsSatang / 100;
  return { items, shipping: shippingFee, total: (itemsSatang + toSatang(shippingFee)) / 100 };
}
