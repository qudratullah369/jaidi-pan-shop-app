import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../utils/colors';
import { useCart } from '../hooks/useCart';
import { useShopData } from '../hooks/useShopData';
import { SHOP_INFO } from '../data/menu';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cartItems, totalPrice, totalItems, clearCart, setMenuItems } = useCart();
  const { menu, settings } = useShopData();

  // Keep cart menu items in sync
  useEffect(() => {
    if (menu.length > 0) setMenuItems(menu);
  }, [menu, setMenuItems]);

  const whatsapp = settings?.whatsapp ?? SHOP_INFO.whatsapp;

  const handleCheckout = () => {
    if (totalItems === 0) return;

    let message = 'Assalamualaikum! I want to order from Jaidi Pan Shop:\n\n';
    cartItems.forEach(({ item, qty, subtotal }) => {
      message += `• ${item.name} x${qty} = Rs. ${subtotal}\n`;
    });
    message += `\n*Total: Rs. ${totalPrice}*\n\nPlease confirm. Thank you!`;

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed.');
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Order</Text>
      </View>

      {totalItems === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from the Menu</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(c) => c.item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: c }) => (
              <View style={styles.cartItem}>
                <View>
                  <Text style={styles.itemName}>{c.item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {c.qty} × Rs. {c.item.price}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>Rs. {c.subtotal}</Text>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>Rs. {totalPrice}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>Send Order on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
              <Text style={styles.clearText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </>
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: colors.muted,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.red,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.red,
  },
  checkoutBtn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  clearBtn: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearText: {
    color: colors.muted,
    fontSize: 14,
  },
});
