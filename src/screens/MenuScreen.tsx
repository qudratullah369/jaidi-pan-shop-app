import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { colors, spacing, radius } from '../utils/colors';
import { CATEGORIES } from '../data/menu';
import { MenuCategory } from '../types';
import { useCart } from '../hooks/useCart';
import { useShopData } from '../hooks/useShopData';

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { getQuantity, addItem, removeItem, setMenuItems } = useCart();
  const { menu, loading, refresh } = useShopData();

  const initialFilter = (route.params?.filter as MenuCategory | 'all') || 'all';
  const [filter, setFilter] = useState<MenuCategory | 'all'>(initialFilter);

  // Keep cart in sync with the latest menu data
  useEffect(() => {
    if (menu.length > 0) {
      setMenuItems(menu);
    }
  }, [menu, setMenuItems]);

  useEffect(() => {
    if (route.params?.filter) {
      setFilter(route.params.filter);
    }
  }, [route.params?.filter]);

  const filtered =
    filter === 'all' ? menu : menu.filter((m) => m.cat === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.filter, filter === cat.key && styles.filterActive]}
            onPress={() => setFilter(cat.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === cat.key && styles.filterTextActive,
              ]}
            >
              {cat.icon} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && menu.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.loaderText}>Loading menu…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.red]} />
          }
          renderItem={({ item }) => {
            const qty = getQuantity(item.id);
            return (
              <View style={styles.menuItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                  <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
                    onPress={() => removeItem(item.id)}
                    disabled={qty === 0}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addItem(item.id)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.red,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  filterBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 8,
  },
  filter: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  menuItem: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    lineHeight: 16,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.red,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {
    backgroundColor: '#ccc',
  },
  qtyBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: colors.muted,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
  },
});
