import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../utils/colors';
import { SHOP_INFO } from '../data/menu';

const CONTACTS = [
  {
    id: 'call',
    icon: '📞',
    title: 'Call Us',
    subtitle: SHOP_INFO.phoneDisplay,
    bg: '#ffebee',
    action: () => Linking.openURL(`tel:+92${SHOP_INFO.phone}`),
  },
  {
    id: 'whatsapp',
    icon: '💬',
    title: 'WhatsApp Order',
    subtitle: 'Quick order via chat',
    bg: '#e8f5e9',
    action: () => {
      const msg = encodeURIComponent(
        'Assalamualaikum, I want to order from Jaidi Pan Shop'
      );
      Linking.openURL(`https://wa.me/${SHOP_INFO.whatsapp}?text=${msg}`);
    },
  },
  {
    id: 'facebook',
    icon: '📘',
    title: 'Facebook',
    subtitle: 'Jaidi Pan & Juice Shop',
    bg: '#e3f2fd',
    action: () => Linking.openURL(SHOP_INFO.facebook),
  },
  {
    id: 'maps',
    icon: '📍',
    title: 'Directions',
    subtitle: 'Open in Google Maps',
    bg: '#fff3e0',
    action: () => Linking.openURL(SHOP_INFO.mapsUrl),
  },
];

export default function ContactScreen() {
  const insets = useSafeAreaInsets();

  const handlePress = async (action: () => void) => {
    try {
      await action();
    } catch {
      Alert.alert('Error', 'Could not open the link. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Get in Touch</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {CONTACTS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handlePress(c.action)}
          >
            <View style={[styles.iconBox, { backgroundColor: c.bg }]}>
              <Text style={styles.icon}>{c.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.subtitle}>{c.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Tip: Use WhatsApp to send your order. We’ll confirm & prepare it for
            pickup or delivery.
          </Text>
        </View>

        <View style={[styles.note, { backgroundColor: '#e8f5e9', marginTop: 12 }]}>
          <Text style={[styles.noteText, { color: '#1b5e20' }]}>
            About Jaidi: Classic Pakistani pan, fresh juices and chaats in F-10 Markaz.
            Fresh daily · Fast service · Open late for night cravings.
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
  card: {
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  note: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5d4037',
  },
});
