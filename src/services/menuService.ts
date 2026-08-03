import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { MenuItem, ShopSettings, Promotion } from '../types';
import { MENU as LOCAL_MENU, SHOP_INFO } from '../data/menu';

/**
 * Fetch menu items.
 * Tries Firestore first. Falls back to local hardcoded menu if
 * Firebase is not configured or the request fails.
 */
export async function fetchMenu(): Promise<MenuItem[]> {
  if (!isFirebaseConfigured || !db) {
    return LOCAL_MENU.map((m) => ({
      ...m,
      id: String(m.id),
      available: true,
    }));
  }

  try {
    const q = query(
      collection(db, 'menu'),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('[Jaidi] Firestore menu is empty – using local fallback');
      return LOCAL_MENU.map((m) => ({ ...m, id: String(m.id), available: true }));
    }

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        desc: data.desc || '',
        price: data.price,
        cat: data.cat,
        available: data.available !== false,
        featured: data.featured || false,
        order: data.order ?? 0,
      } as MenuItem;
    });
  } catch (err) {
    console.error('[Jaidi] Failed to fetch menu from Firestore', err);
    return LOCAL_MENU.map((m) => ({ ...m, id: String(m.id), available: true }));
  }
}

/**
 * Fetch only available items (for customer-facing menu)
 */
export async function fetchAvailableMenu(): Promise<MenuItem[]> {
  const all = await fetchMenu();
  return all.filter((m) => m.available !== false);
}

/**
 * Fetch shop settings (open status, wait time, today's special)
 */
export async function fetchShopSettings(): Promise<ShopSettings> {
  const defaults: ShopSettings = {
    isOpen: true,
    waitMinutes: 7,
    todaySpecial: { name: 'Mango Shake', price: 250 },
    phone: SHOP_INFO.phone,
    whatsapp: SHOP_INFO.whatsapp,
    address: SHOP_INFO.address,
    tagline: SHOP_INFO.tagline,
    facebook: SHOP_INFO.facebook,
    mapsUrl: SHOP_INFO.mapsUrl,
  };

  if (!isFirebaseConfigured || !db) {
    return defaults;
  }

  try {
    const ref = doc(db, 'settings', 'shop');
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return defaults;
    }

    const data = snap.data();
    return {
      isOpen: data.isOpen ?? true,
      waitMinutes: data.waitMinutes ?? 7,
      todaySpecial: data.todaySpecial ?? defaults.todaySpecial,
      phone: data.phone ?? defaults.phone,
      whatsapp: data.whatsapp ?? defaults.whatsapp,
      address: data.address ?? defaults.address,
      tagline: data.tagline ?? defaults.tagline,
      facebook: data.facebook ?? defaults.facebook,
      mapsUrl: data.mapsUrl ?? defaults.mapsUrl,
    };
  } catch (err) {
    console.error('[Jaidi] Failed to fetch shop settings', err);
    return defaults;
  }
}

/**
 * Fetch active promotions
 */
export async function fetchPromotions(): Promise<Promotion[]> {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'promotions'),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Promotion[];
  } catch (err) {
    console.error('[Jaidi] Failed to fetch promotions', err);
    return [];
  }
}
