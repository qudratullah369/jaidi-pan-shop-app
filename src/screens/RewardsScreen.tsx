import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../utils/colors';
import {
  findOrCreateCustomer,
  getCustomerByPhone,
  redeemReward,
  getLoyaltySettings,
  normalizePhone,
  DEFAULT_LOYALTY,
} from '../services/loyaltyService';
import { Customer, LoyaltySettings } from '../types';

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [settings, setSettings] = useState<LoyaltySettings>(DEFAULT_LOYALTY);
  const [loading, setLoading] = useState(false);
  const [lookedUp, setLookedUp] = useState(false);

  const loadSettings = useCallback(async () => {
    const s = await getLoyaltySettings();
    setSettings(s);
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleLookup = async () => {
    const normalized = normalizePhone(phone);
    if (normalized.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid Pakistani mobile number.');
      return;
    }
    setLoading(true);
    setLookedUp(false);
    try {
      const found = await getCustomerByPhone(phone);
      if (found) {
        setCustomer(found);
        setName(found.name || '');
      } else {
        setCustomer(null);
      }
      setLookedUp(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to join the loyalty program.');
      return;
    }
    setLoading(true);
    try {
      const c = await findOrCreateCustomer(phone, name.trim());
      setCustomer(c);
      setLookedUp(true);
      Alert.alert('Welcome!', 'You are now part of the Jaidi Rewards program.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!customer) return;
    if (customer.totalStamps < settings.stampsRequired) {
      Alert.alert(
        'Not enough stamps',
        `You need ${settings.stampsRequired} stamps. You have ${customer.totalStamps}.`
      );
      return;
    }
    Alert.alert(
      'Redeem Reward?',
      `Use ${settings.stampsRequired} stamps for: ${settings.rewardLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setLoading(true);
            try {
              const { customer: updated } = await redeemReward(
                customer.id,
                settings.stampsRequired,
                settings.rewardLabel
              );
              setCustomer(updated);
              Alert.alert(
                'Congratulations! 🎉',
                `Show this screen to the staff to claim your ${settings.rewardLabel}.`
              );
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Redemption failed');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const stamps = customer?.totalStamps ?? 0;
  const required = settings.stampsRequired;
  const progress = Math.min(stamps / required, 1);
  const canRedeem = stamps >= required;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Intro card */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🎁</Text>
          <Text style={styles.introTitle}>Jaidi Stamp Card</Text>
          <Text style={styles.introText}>
            Collect {required} stamps and get a {settings.rewardLabel}!
          </Text>
        </View>

        {/* Phone lookup */}
        <Text style={styles.label}>Your mobile number</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="03XX-XXXXXXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={15}
          />
          <TouchableOpacity
            style={styles.lookupBtn}
            onPress={handleLookup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.lookupBtnText}>Find</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Not found → register */}
        {lookedUp && !customer && (
          <View style={styles.registerBox}>
            <Text style={styles.registerTitle}>New here? Join free</Text>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>Join Loyalty Program</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Customer found → stamp card */}
        {customer && (
          <View style={styles.card}>
            <Text style={styles.cardName}>{customer.name}</Text>
            <Text style={styles.cardPhone}>{customer.phone}</Text>

            {/* Progress ring / bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {stamps} / {required} stamps
              </Text>
            </View>

            {/* Stamp circles */}
            <View style={styles.stampsGrid}>
              {Array.from({ length: required }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.stamp, i < stamps && styles.stampFilled]}
                >
                  <Text style={styles.stampIcon}>{i < stamps ? '🍃' : '○'}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.ordersText}>
              Total orders: {customer.totalOrders || 0}
            </Text>

            {canRedeem ? (
              <TouchableOpacity
                style={[styles.primaryBtn, styles.redeemBtn]}
                onPress={handleRedeem}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>
                  🎉 Claim {settings.rewardLabel}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.needMore}>
                {required - stamps} more stamp{required - stamps === 1 ? '' : 's'} to unlock your reward
              </Text>
            )}
          </View>
        )}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 After you place an order, ask the staff to add a stamp to your card.
            Stamps are linked to your phone number.
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
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  introIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 6,
  },
  introText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  lookupBtn: {
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    minWidth: 70,
    alignItems: 'center',
  },
  lookupBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  registerBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  registerTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardPhone: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 16,
  },
  progressWrap: {
    width: '100%',
    marginBottom: 16,
  },
  progressBg: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.green,
    textAlign: 'center',
    marginTop: 6,
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stamp: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampFilled: {
    borderColor: colors.green,
    borderStyle: 'solid',
    backgroundColor: colors.greenLight,
  },
  stampIcon: {
    fontSize: 16,
  },
  ordersText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 14,
  },
  redeemBtn: {
    backgroundColor: colors.green,
    width: '100%',
  },
  needMore: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  note: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: spacing.lg,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5d4037',
  },
});
