export type MenuCategory = 'pan' | 'juices' | 'shakes' | 'snacks';

export interface MenuItem {
  id: string;           // Firestore doc id (or number as string for local)
  name: string;
  desc: string;
  price: number;
  cat: MenuCategory;
  available?: boolean;  // can be toggled from admin
  featured?: boolean;
  order?: number;       // for sorting
}

export interface ShopSettings {
  isOpen: boolean;
  waitMinutes: number;
  todaySpecial: {
    name: string;
    price: number;
  } | null;
  phone: string;
  whatsapp: string;
  address: string;
  tagline: string;
  facebook?: string;
  mapsUrl?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Order {
  id?: string;
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
  customerNote?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: any; // Firestore Timestamp
  source: 'whatsapp' | 'app';
}

// ---------- Loyalty ----------
export interface Customer {
  id: string;
  name: string;
  phone: string;          // normalized, e.g. 923220971060
  totalStamps: number;
  totalOrders: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface RewardRedemption {
  id: string;
  customerId: string;
  customerPhone: string;
  stampsUsed: number;
  rewardType: string;     // e.g. "Free Meetha Pan"
  redeemedAt: any;
}

export interface LoyaltySettings {
  stampsRequired: number; // e.g. 10
  rewardLabel: string;    // e.g. "Free Meetha Pan"
}
