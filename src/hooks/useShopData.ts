import { useState, useEffect, useCallback } from 'react';
import { MenuItem, ShopSettings, Promotion } from '../types';
import {
  fetchAvailableMenu,
  fetchShopSettings,
  fetchPromotions,
} from '../services/menuService';

interface ShopData {
  menu: MenuItem[];
  settings: ShopSettings | null;
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useShopData(): ShopData {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menuData, settingsData, promoData] = await Promise.all([
        fetchAvailableMenu(),
        fetchShopSettings(),
        fetchPromotions(),
      ]);
      setMenu(menuData);
      setSettings(settingsData);
      setPromotions(promoData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load shop data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    menu,
    settings,
    promotions,
    loading,
    error,
    refresh: load,
  };
}
