import { lineSubtotal, cartTotal, cartItemCount } from '../utils/cartMath';

describe('cartMath', () => {
  it('computes line subtotal', () => {
    expect(lineSubtotal(100, 3)).toBe(300);
  });

  it('ignores invalid qty/price', () => {
    expect(lineSubtotal(100, 0)).toBe(0);
    expect(lineSubtotal(-5, 2)).toBe(0);
  });

  it('sums cart total', () => {
    expect(
      cartTotal([
        { price: 80, qty: 2 },
        { price: 250, qty: 1 },
      ])
    ).toBe(410);
  });

  it('counts items', () => {
    expect(cartItemCount([{ qty: 2 }, { qty: 3 }])).toBe(5);
  });
});
