import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export const OrderConfirmationScreen = ({ route, navigation }) => {
  const { 
    orderNumber, 
    paymentMethod, 
    total, 
    isDemo 
  } = route.params || {};

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  const handleBackHome = () => {
    navigation.navigate('StudentHome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={100} color="#10B981" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Number</Text>
            <Text style={styles.detailValue}>{orderNumber || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {paymentMethod === 'cash' ? 'Cash on Pickup' : 'QRIS'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.detailValueAmount}>
              Rp {total?.toLocaleString() || '0'}
            </Text>
          </View>

          {paymentMethod === 'cash' && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pay on Pickup</Text>
                </View>
              </View>
            </>
          )}

          {paymentMethod === 'qris' && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status</Text>
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.paidText}>Paid</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Demo Notice */}
        {isDemo && (
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.demoNoticeText}>
              This was a demo payment. In production, this would process a real transaction.
            </Text>
          </View>
        )}

        {/* What's Next */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Order Confirmation</Text>
              <Text style={styles.stepText}>
                The vendor will confirm your order shortly
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Preparation</Text>
              <Text style={styles.stepText}>
                Your order will be prepared before pickup time
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Ready for Pickup</Text>
              <Text style={styles.stepText}>
                You'll receive a notification when it's ready
              </Text>
            </View>
          </View>

          {paymentMethod === 'cash' && (
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Pay & Collect</Text>
                <Text style={styles.stepText}>
                  Pay cash when you pick up your order
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewOrders}
        >
          <Ionicons name="receipt-outline" size={20} color={COLORS.white} />
          <Text style={styles.primaryButtonText}>View My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackHome}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },

  // Details Card
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailValueAmount: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  pendingBadge: {
    backgroundColor: '#F59E0B15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.small,
  },
  pendingText: {
    fontSize: FONTS.extraSmall,
    fontWeight: '600',
    color: '#F59E0B',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.small,
    gap: 4,
  },
  paidText: {
    fontSize: FONTS.extraSmall,
    fontWeight: '600',
    color: '#10B981',
  },

  // Demo Notice
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FFE066',
    width: '100%',
  },
  demoNoticeText: {
    flex: 1,
    fontSize: FONTS.small,
    color: '#92400E',
    lineHeight: 20,
  },

  // Next Steps
  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  nextStepsTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  stepText: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Bottom Actions
  bottomContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  secondaryButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default OrderConfirmationScreen;
