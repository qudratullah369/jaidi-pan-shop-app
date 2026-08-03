/**
 * Normalize Pakistani mobile numbers to digits with country code 92.
 */
export function normalizePhone(raw: string): string {
  let p = String(raw || '').replace(/\D/g, '');
  if (p.startsWith('0') && p.length === 11) p = '92' + p.slice(1);
  if (p.length === 10) p = '92' + p;
  return p;
}

export function isValidPkMobile(raw: string): boolean {
  const n = normalizePhone(raw);
  return n.length >= 12 && n.length <= 13 && n.startsWith('92');
}
