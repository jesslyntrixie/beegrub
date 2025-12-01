import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CartContext } from '../../context/CartContext';
import { apiService } from '../../services/api';
import { supabase } from '../../services/supabase';

export const PaymentMethodScreen = ({ route, navigation }) => {
  const { orderSummary } = route.params || {};
  const { clearCart } = useContext(CartContext);
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash on Pickup',
      subtitle: 'Pay when you collect your order',
      icon: 'cash',
      iconLibrary: 'Ionicons',
      color: '#10B981',
      available: true,
      recommended: true,
    },
    {
      id: 'qris',
      name: 'QRIS',
      subtitle: 'Scan QR with any e-wallet',
      icon: 'qrcode-scan',
      iconLibrary: 'MaterialCommunityIcons',
      color: '#007AFF',
      available: true, // DEMO MODE
      badge: 'Demo',
    },
    {
      id: 'gopay',
      name: 'GoPay',
      subtitle: 'Pay with GoPay balance',
      icon: 'wallet',
      iconLibrary: 'Ionicons',
      color: '#00AA13',
      available: false,
      badge: 'Coming Soon',
    },
    {
      id: 'ovo',
      name: 'OVO',
      subtitle: 'Pay with OVO balance',
      icon: 'wallet-outline',
      iconLibrary: 'Ionicons',
      color: '#4C3494',
      available: false,
      badge: 'Coming Soon',
    },
  ];

  const handleMethodSelect = (methodId) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    if (!method.available) {
      Alert.alert('Coming Soon', `${method.name} will be available soon!`);
      return;
    }
    setSelectedMethod(methodId);
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment', 'Please select a payment method');
      return;
    }

    const method = paymentMethods.find((m) => m.id === selectedMethod);

    if (selectedMethod === 'cash') {
      // For cash, create order then go to confirmation
      await createOrder('cash', 'pending');
    } else if (selectedMethod === 'qris') {
      // For QRIS demo, show payment screen first (will create order after "payment")
      navigation.navigate('QRISPaymentDemo', {
        orderData: {
          ...orderSummary,
          orderNumber: orderSummary?.orderNumber || `BG-${Date.now()}`,
        },
      });
    } else {
      // For other e-wallets (future)
      Alert.alert('Coming Soon', `${method.name} will be available soon!`);
    }
  };

  const createOrder = async (paymentMethod, paymentStatus) => {
    try {
      setIsProcessing(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to place order');
        return;
      }

      // Get student record
      const { data: appUser } = await apiService.users.getByAuthUserId(user.id);
      if (!appUser || appUser.role !== 'student') {
        Alert.alert('Error', 'Student profile not found');
        return;
      }

      // Create order data
      const orderData = {
        order_number: orderSummary.orderNumber || `BG-${Date.now()}`,
        student_id: appUser.id,
        vendor_id: orderSummary.vendorId,
        pickup_location_id: orderSummary.pickupLocationId,
        order_type: 'pre_order',
        subtotal: orderSummary.subtotal,
        service_fee: orderSummary.serviceFee,
        total: orderSummary.total,
        status: 'scheduled',
        scheduled_pickup_time: orderSummary.pickupTime,
        time_slot: orderSummary.timeSlot,
        special_instructions: orderSummary.specialInstructions,
        payment_method: paymentMethod,
        payment_status: paymentStatus, // 'pending' for cash, 'completed' for QRIS demo
        items: orderSummary.items,
      };

      // Create order in database
      const { data: order, error } = await apiService.orders.create(orderData);

      if (error) {
        console.error('Order creation error:', error);
        Alert.alert('Error', 'Failed to create order. Please try again.');
        return;
      }

      // Clear cart on success
      clearCart();

      // Navigate to confirmation
      navigation.navigate('OrderConfirmation', {
        orderId: order.id,
        orderNumber: order.order_number,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        total: order.total,
        pickupTime: order.scheduled_pickup_time,
      });

    } catch (error) {
      console.error('Order creation exception:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod === method.id;
    const IconComponent =
      method.iconLibrary === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodCard,
          isSelected && styles.methodCardSelected,
          !method.available && styles.methodCardDisabled,
        ]}
        onPress={() => handleMethodSelect(method.id)}
        disabled={!method.available}
      >
        <View style={styles.methodLeft}>
          <View
            style={[
              styles.methodIcon,
              { backgroundColor: method.color + '15' },
              !method.available && styles.methodIconDisabled,
            ]}
          >
            <IconComponent
              name={method.icon}
              size={28}
              color={method.available ? method.color : COLORS.borderLight}
            />
          </View>

          <View style={styles.methodInfo}>
            <View style={styles.methodHeader}>
              <Text
                style={[
                  styles.methodName,
                  !method.available && styles.textDisabled,
                ]}
              >
                {method.name}
              </Text>
              {method.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
              {method.badge === 'Demo' && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>{method.badge}</Text>
                </View>
              )}
              {method.badge === 'Coming Soon' && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>{method.badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.methodSubtitle,
                !method.available && styles.textDisabled,
              ]}
            >
              {method.subtitle}
            </Text>
          </View>
        </View>

        <View style={styles.methodRight}>
          <View
            style={[
              styles.radio,
              isSelected && styles.radioSelected,
              !method.available && styles.radioDisabled,
            ]}
          >
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              Rp {orderSummary?.subtotal?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>
              Rp {orderSummary?.serviceFee?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              Rp {orderSummary?.total?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            QRIS is in demo mode for presentation purposes. In production, this 
            would integrate with Midtrans payment gateway for real transactions.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedMethod || isProcessing) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirmPayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirm Payment Method
            </Text>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: '#007AFF',
  },

  // Methods Section
  methodsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  methodCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodIconDisabled: {
    backgroundColor: COLORS.background,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  methodName: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.text,
  },
  methodSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  textDisabled: {
    color: COLORS.borderLight,
  },
  recommendedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  demoBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  demoText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  comingSoonBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  methodRight: {
    marginLeft: SPACING.sm,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#007AFF',
  },
  radioDisabled: {
    borderColor: COLORS.borderLight,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },

  // Info Box
  infoBox: {
    backgroundColor: '#F0F8FF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.small,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Bottom
  bottomContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  confirmButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default PaymentMethodScreen;
