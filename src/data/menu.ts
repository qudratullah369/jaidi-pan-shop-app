export type MenuCategory = 'pan' | 'juices' | 'shakes' | 'snacks';

export interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  cat: MenuCategory;
}

export const MENU: MenuItem[] = [
  // Pan
  { id: 1, name: 'Meetha Pan', desc: 'Sweet classic with gulkand & coconut', price: 80, cat: 'pan' },
  { id: 2, name: 'Saada Pan', desc: 'Simple betel leaf with catechu & lime', price: 50, cat: 'pan' },
  { id: 3, name: 'Special Jaidi Pan', desc: 'House special with dry fruits & silver foil', price: 150, cat: 'pan' },
  { id: 4, name: 'Zafrani Pan', desc: 'Saffron infused sweet pan', price: 120, cat: 'pan' },
  { id: 5, name: 'Chocolate Pan', desc: 'Sweet pan with chocolate filling', price: 100, cat: 'pan' },
  { id: 6, name: 'Fire Pan', desc: 'Spicy pan for the brave', price: 90, cat: 'pan' },

  // Juices
  { id: 7, name: 'Fresh Orange Juice', desc: 'Freshly squeezed, no sugar', price: 200, cat: 'juices' },
  { id: 8, name: 'Mango Juice', desc: 'Seasonal Alphonso or local mango', price: 250, cat: 'juices' },
  { id: 9, name: 'Sugarcane Juice', desc: 'Freshly pressed with ginger & lemon', price: 150, cat: 'juices' },
  { id: 10, name: 'Carrot Juice', desc: 'Healthy & refreshing', price: 180, cat: 'juices' },
  { id: 11, name: 'Pomegranate Juice', desc: 'Pure anar juice', price: 280, cat: 'juices' },
  { id: 12, name: 'Mixed Fruit Juice', desc: 'Seasonal mix of fruits', price: 220, cat: 'juices' },

  // Shakes
  { id: 13, name: 'Mango Shake', desc: 'Thick & creamy with ice cream', price: 250, cat: 'shakes' },
  { id: 14, name: 'Banana Shake', desc: 'Classic banana milkshake', price: 200, cat: 'shakes' },
  { id: 15, name: 'Chocolate Shake', desc: 'Rich chocolate delight', price: 230, cat: 'shakes' },
  { id: 16, name: 'Strawberry Shake', desc: 'Fresh strawberry blended', price: 240, cat: 'shakes' },
  { id: 17, name: 'Jaidi Special Shake', desc: 'House special with dry fruits', price: 300, cat: 'shakes' },

  // Snacks / Chaats
  { id: 18, name: 'Fruit Chaat', desc: 'Fresh mixed fruit with spices', price: 200, cat: 'snacks' },
  { id: 19, name: 'Chana Chaat', desc: 'Spicy chickpea chaat', price: 180, cat: 'snacks' },
  { id: 20, name: 'Gol Gappay', desc: 'Crispy puris with tangy water', price: 150, cat: 'snacks' },
  { id: 21, name: 'Papri Chaat', desc: 'Crispy papri with yogurt & chutney', price: 180, cat: 'snacks' },
];

export const CATEGORIES: { key: MenuCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🍽️' },
  { key: 'pan', label: 'Pan', icon: '🍃' },
  { key: 'juices', label: 'Juices', icon: '🥤' },
  { key: 'shakes', label: 'Shakes', icon: '🍦' },
  { key: 'snacks', label: 'Chaats', icon: '🥗' },
];

export const SHOP_INFO = {
  name: 'Jaidi Pan Shop',
  address: 'Near Maroof Hospital, F-10 Markaz, F 10/3, Islamabad',
  phone: '03220971060',
  phoneDisplay: '0322-0971060',
  phoneAlt: '03022222144',
  whatsapp: '923220971060',
  facebook: 'https://www.facebook.com/Jaidi.islamabad',
  mapsUrl: 'https://maps.google.com/?q=Jaidi+Pan+Shop+F-10+Markaz+Islamabad',
  tagline: 'F-10 Markaz • Islamabad',
};
