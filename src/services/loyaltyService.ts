import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  limit,
  runTransaction,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Customer, RewardRedemption, LoyaltySettings } from '../types';
import { normalizePhone } from '../utils/phone';
export { normalizePhone } from '../utils/phone';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CUSTOMERS_KEY = 'jaidi-loyalty-customers';
const LOCAL_REWARDS_KEY = 'jaidi-loyalty-rewards';

export const DEFAULT_LOYALTY: LoyaltySettings = {
  stampsRequired: 10,
  rewardLabel: 'Free Meetha Pan',
};


async function loadLocalCustomers(): Promise<Customer[]> {
  const raw = await AsyncStorage.getItem(LOCAL_CUSTOMERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveLocalCustomers(list: Customer[]) {
  await AsyncStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(list));
}

async function loadLocalRewards(): Promise<RewardRedemption[]> {
  const raw = await AsyncStorage.getItem(LOCAL_REWARDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveLocalRewards(list: RewardRedemption[]) {
  await AsyncStorage.setItem(LOCAL_REWARDS_KEY, JSON.stringify(list));
}

/**
 * Find or create a customer by phone number.
 */
export async function findOrCreateCustomer(
  phone: string,
  name?: string
): Promise<Customer> {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) {
    throw new Error('Invalid phone number');
  }

  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'customers'),
      where('phone', '==', normalized),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as Customer;
    }
    // create
    const ref = doc(collection(db, 'customers'));
    const customer: Omit<Customer, 'id'> = {
      name: name || 'Customer',
      phone: normalized,
      totalStamps: 0,
      totalOrders: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, customer);
    return { id: ref.id, ...customer, createdAt: new Date(), updatedAt: new Date() };
  }

  // DEMO / local
  const list = await loadLocalCustomers();
  let found = list.find((c) => c.phone === normalized);
  if (found) return found;
  found = {
    id: 'local-' + Date.now(),
    name: name || 'Customer',
    phone: normalized,
    totalStamps: 0,
    totalOrders: 0,
    createdAt: new Date().toISOString(),
  };
  list.push(found);
  await saveLocalCustomers(list);
  return found;
}

/**
 * Get customer by phone (returns null if not found).
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const normalized = normalizePhone(phone);
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'customers'),
      where('phone', '==', normalized),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Customer;
  }
  const list = await loadLocalCustomers();
  return list.find((c) => c.phone === normalized) || null;
}

/**
 * Add stamps to a customer (typically after an order).
 */
export async function addStamps(
  customerId: string,
  count: number = 1
): Promise<Customer> {
  if (count <= 0) throw new Error('Stamp count must be positive');

  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'customers', customerId);
    const updated = await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Customer not found');
      const data = snap.data() as Customer;
      const totalStamps = (data.totalStamps || 0) + count;
      const totalOrders = (data.totalOrders || 0) + 1;
      tx.update(ref, {
        totalStamps,
        totalOrders,
        updatedAt: serverTimestamp(),
      });
      return {
        id: customerId,
        ...data,
        totalStamps,
        totalOrders,
        updatedAt: new Date(),
      } as Customer;
    });
    return updated;
  }

  const list = await loadLocalCustomers();
  const idx = list.findIndex((c) => c.id === customerId);
  if (idx < 0) throw new Error('Customer not found');
  list[idx].totalStamps = (list[idx].totalStamps || 0) + count;
  list[idx].totalOrders = (list[idx].totalOrders || 0) + 1;
  await saveLocalCustomers(list);
  return list[idx];
}

/**
 * Redeem a reward (deduct stamps).
 */
export async function redeemReward(
  customerId: string,
  stampsRequired: number,
  rewardType: string
): Promise<{ customer: Customer; redemption: RewardRedemption }> {
  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'customers', customerId);
    const rewardRef = doc(collection(db, 'rewards'));

    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Customer not found');
      const data = snap.data() as Customer;
      if ((data.totalStamps || 0) < stampsRequired) {
        throw new Error('Not enough stamps');
      }
      const nextStamps = (data.totalStamps || 0) - stampsRequired;
      tx.update(ref, {
        totalStamps: nextStamps,
        updatedAt: serverTimestamp(),
      });
      tx.set(rewardRef, {
        customerId,
        customerPhone: data.phone,
        stampsUsed: stampsRequired,
        rewardType,
        redeemedAt: serverTimestamp(),
      });
      return {
        customer: { id: customerId, ...data, totalStamps: nextStamps } as Customer,
        redemption: {
          id: rewardRef.id,
          customerId,
          customerPhone: data.phone,
          stampsUsed: stampsRequired,
          rewardType,
          redeemedAt: new Date(),
        } as RewardRedemption,
      };
    });
    return result;
  }

  // DEMO
  const list = await loadLocalCustomers();
  const idx = list.findIndex((c) => c.id === customerId);
  if (idx < 0) throw new Error('Customer not found');
  if (list[idx].totalStamps < stampsRequired) throw new Error('Not enough stamps');
  list[idx].totalStamps -= stampsRequired;
  await saveLocalCustomers(list);

  const redemption: RewardRedemption = {
    id: 'local-r-' + Date.now(),
    customerId,
    customerPhone: list[idx].phone,
    stampsUsed: stampsRequired,
    rewardType,
    redeemedAt: new Date().toISOString(),
  };
  const rewards = await loadLocalRewards();
  rewards.push(redemption);
  await saveLocalRewards(rewards);

  return { customer: list[idx], redemption };
}

/**
 * Get loyalty settings (stamps required + reward label).
 * Currently returns defaults; can later read from settings/loyalty.
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'loyalty'));
      if (snap.exists()) {
        return { ...DEFAULT_LOYALTY, ...snap.data() } as LoyaltySettings;
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_LOYALTY;
}
