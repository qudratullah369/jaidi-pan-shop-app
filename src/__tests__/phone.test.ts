import { normalizePhone, isValidPkMobile } from '../utils/phone';

describe('normalizePhone', () => {
  it('strips non-digits', () => {
    expect(normalizePhone('0300-1234567')).toBe('923001234567');
  });

  it('converts leading 0 to 92', () => {
    expect(normalizePhone('03220971060')).toBe('923220971060');
  });

  it('adds 92 to 10-digit local', () => {
    expect(normalizePhone('3220971060')).toBe('923220971060');
  });

  it('keeps already international format', () => {
    expect(normalizePhone('923220971060')).toBe('923220971060');
  });
});

describe('isValidPkMobile', () => {
  it('accepts normalized PK mobile', () => {
    expect(isValidPkMobile('0322-0971060')).toBe(true);
  });

  it('rejects short numbers', () => {
    expect(isValidPkMobile('123')).toBe(false);
  });
});
