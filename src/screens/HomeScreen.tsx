import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '../utils/colors';
import { SHOP_INFO } from '../data/menu';
import { useShopData } from '../hooks/useShopData';

const CATEGORY_CARDS = [
  { key: 'pan', label: 'Pan', icon: '🍃' },
  { key: 'juices', label: 'Juices', icon: '🥤' },
  { key: 'shakes', label: 'Shakes', icon: '🍦' },
  { key: 'snacks', label: 'Chaats', icon: '🥗' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { settings, loading, promotions } = useShopData();

  const isOpen = settings?.isOpen ?? true;
  const waitMinutes = settings?.waitMinutes ?? 7;
  const special = settings?.todaySpecial;
  const address = settings?.address ?? SHOP_INFO.address;
  const mapsUrl = settings?.mapsUrl ?? SHOP_INFO.mapsUrl;

  const openMaps = () => {
    Linking.openURL(mapsUrl);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>J</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{SHOP_INFO.name}</Text>
            <Text style={styles.headerSubtitle}>
              {settings?.tagline ?? SHOP_INFO.tagline}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Fresh Pan & Juices</Text>
            <Text style={styles.heroSubtitle}>Since forever • Always open</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpen ? colors.green : '#999' },
              ]}
            />
            <View>
              <Text style={styles.statusTitle}>
                {isOpen ? 'Open Now' : 'Closed'}
              </Text>
              <Text style={styles.statusSub}>
                {isOpen ? `Est. wait: ${waitMinutes} min` : 'Check back later'}
              </Text>
            </View>
          </View>

          {special && (
            <View style={styles.specialBox}>
              <Text style={styles.specialLabel}>TODAY</Text>
              <Text style={styles.specialText}>
                {special.name} Rs. {special.price}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_CARDS.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.catCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Menu', { filter: cat.key })}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {promotions && promotions.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Offers</Text>
            {promotions.filter((p) => p.active !== false).map((p) => (
              <View
                key={p.id}
                style={{
                  backgroundColor: colors.greenLight,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: '700', color: colors.green, fontSize: 14 }}>
                  {p.title}
                </Text>
                {!!p.description && (
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    {p.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.addressCard}>
          <Text style={styles.addrIcon}>📍</Text>
          <View style={styles.addrInfo}>
            <Text style={styles.addrTitle}>Near Maroof Hospital</Text>
            <Text style={styles.addrSub}>{address}</Text>
          </View>
          <TouchableOpacity style={styles.mapBtn} onPress={openMaps}>
            <Text style={styles.mapBtnText}>Map</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.red} />
            <Text style={styles.loadingText}>Syncing with shop…</Text>
          </View>
        )}
      </ScrollView>
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.red,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 30,
  },
  hero: {
    height: 170,
    borderRadius: radius.lg,
    backgroundColor: colors.redDark,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: spacing.lg,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusSub: {
    fontSize: 12,
    color: colors.muted,
  },
  specialBox: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  specialLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.green,
    letterSpacing: 0.5,
  },
  specialText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.xl,
  },
  catCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  catIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  addrIcon: {
    fontSize: 22,
  },
  addrInfo: {
    flex: 1,
  },
  addrTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addrSub: {
    fontSize: 12,
    color: colors.muted,
  },
  mapBtn: {
    backgroundColor: colors.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 13,
    color: colors.muted,
  },
});
