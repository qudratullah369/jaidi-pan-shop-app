import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../utils/colors';
import { SHOP_INFO } from '../data/menu';

const HIGHLIGHTS = [
  { icon: '🍃', title: 'Fresh Daily', desc: 'Pan leaves & fruits prepared every morning' },
  { icon: '⚡', title: 'Fast Service', desc: 'Most orders ready in under 10 minutes' },
  { icon: '❤️', title: 'Local Favourite', desc: 'Loved by F-10 residents & students' },
  { icon: '🌙', title: 'Late Hours', desc: 'Open late for those night cravings' },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Our Story</Text>
          <Text style={styles.heroText}>
            Jaidi Pan Shop brings the authentic taste of classic Pakistani pan, freshly
            squeezed juices, creamy shakes and street-style chaats to the heart of F-10
            Markaz, Islamabad.
          </Text>
        </View>

        <View style={styles.grid}>
          {HIGHLIGHTS.map((h) => (
            <View key={h.title} style={styles.hlCard}>
              <Text style={styles.hlIcon}>{h.icon}</Text>
              <Text style={styles.hlTitle}>{h.title}</Text>
              <Text style={styles.hlDesc}>{h.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Address: </Text>
            {SHOP_INFO.address}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Phone: </Text>
            {SHOP_INFO.phoneDisplay} / 0302-2222144
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Hours: </Text>
            Open late most days
          </Text>
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 30,
  },
  hero: {
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 10,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.95)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xl,
  },
  hlCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  hlIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  hlTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hlDesc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoLine: {
    fontSize: 13,
    lineHeight: 22,
    color: colors.text,
  },
  infoLabel: {
    fontWeight: '600',
  },
});
