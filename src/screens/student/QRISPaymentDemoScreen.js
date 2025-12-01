import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CartContext } from '../../context/CartContext';
import { apiService } from '../../services/api';
import { supabase } from '../../services/supabase';

/**
 * DEMO MODE QRIS Payment Screen
 * This simulates a real QRIS payment flow for demonstration purposes
 * In production, this would integrate with actual Midtrans API
 */
export const QRISPaymentDemoScreen = ({ route, navigation }) => {
  const { orderData } = route.params || {};
  const { clearCart } = useContext(CartContext);
  const [paymentStatus, setPaymentStatus] = useState('scanning'); // scanning, processing, success
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Simulate payment processing after 3 seconds
    const timer = setTimeout(() => {
      setPaymentStatus('processing');
      
      // Complete payment after another 2 seconds
      setTimeout(async () => {
        setPaymentStatus('success');
        
        // Animate success
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();

        // Create order in database
        const order = await createOrder();

        // Navigate to confirmation after showing success
        setTimeout(() => {
          if (order) {
            navigation.replace('OrderConfirmation', {
              orderId: order.id,
              orderNumber: order.order_number,
              paymentMethod: 'qris',
              paymentStatus: 'completed',
              total: order.total,
              pickupTime: order.scheduled_pickup_time,
            });
          }
        }, 1500);
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const createOrder = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to place order');
        return null;
      }

      // Get student record
      const { data: appUser } = await apiService.users.getByAuthUserId(user.id);
      if (!appUser || appUser.role !== 'student') {
        Alert.alert('Error', 'Student profile not found');
        return null;
      }

      // Create order data
      const orderPayload = {
        order_number: orderData.orderNumber || `BG-${Date.now()}`,
        student_id: appUser.id,
        vendor_id: orderData.vendorId,
        pickup_location_id: orderData.pickupLocationId,
        order_type: 'pre_order',
        subtotal: orderData.subtotal,
        service_fee: orderData.serviceFee,
        total: orderData.total,
        status: 'scheduled',
        scheduled_pickup_time: orderData.pickupTime,
        time_slot: orderData.timeSlot,
        special_instructions: orderData.specialInstructions,
        payment_method: 'qris',
        payment_status: 'completed', // QRIS demo shows as paid
        items: orderData.items,
      };

      // Create order in database
      const { data: order, error } = await apiService.orders.create(orderPayload);

      if (error) {
        console.error('Order creation error:', error);
        Alert.alert('Error', 'Failed to create order. Please try again.');
        return null;
      }

      // Clear cart on success
      clearCart();

      return order;
    } catch (error) {
      console.error('Order creation exception:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return null;
    }
  };

  const renderScanningState = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Use any e-wallet app to scan and pay
        </Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={`DEMO-QRIS-${orderData?.orderNumber || Date.now()}`}
            size={220}
            backgroundColor="white"
            color="black"
          />
        </View>
        
        {/* Supported Payments */}
        <View style={styles.supportedPayments}>
          <Text style={styles.supportedTitle}>Supported Payment Apps:</Text>
          <View style={styles.paymentLogos}>
            <View style={styles.paymentLogoPlaceholder}>
              <Text style={styles.paymentLogoText}>GoPay</Text>
            </View>
            <View style={styles.paymentLogoPlaceholder}>
              <Text style={styles.paymentLogoText}>OVO</Text>
            </View>
            <View style={styles.paymentLogoPlaceholder}>
              <Text style={styles.paymentLogoText}>Dana</Text>
            </View>
            <View style={styles.paymentLogoPlaceholder}>
              <Text style={styles.paymentLogoText}>ShopeePay</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Payment</Text>
        <Text style={styles.amountValue}>
          Rp {orderData?.total?.toLocaleString() || '0'}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>Open your e-wallet app</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>Scan the QR code above</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>Confirm payment in your app</Text>
        </View>
      </View>

      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Ionicons name="information-circle" size={18} color="#F59E0B" />
        <Text style={styles.demoNoticeText}>
          DEMO MODE: Payment will auto-complete in a few seconds
        </Text>
      </View>

      {/* Waiting indicator */}
      <View style={styles.waitingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.waitingText}>Waiting for payment...</Text>
      </View>
    </Animated.View>
  );

  const renderProcessingState = () => (
    <View style={styles.content}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.processingTitle}>Processing Payment</Text>
        <Text style={styles.processingSubtitle}>
          Please wait while we confirm your payment...
        </Text>
      </View>
    </View>
  );

  const renderSuccessState = () => (
    <Animated.View 
      style={[
        styles.content, 
        { 
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your order has been confirmed
        </Text>
        <Text style={styles.successAmount}>
          Rp {orderData?.total?.toLocaleString() || '0'}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {paymentStatus === 'scanning' && renderScanningState()}
      {paymentStatus === 'processing' && renderProcessingState()}
      {paymentStatus === 'success' && renderSuccessState()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },

  // QR Code
  qrContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  qrCodeWrapper: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  supportedPayments: {
    alignItems: 'center',
  },
  supportedTitle: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  paymentLogos: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  paymentLogoPlaceholder: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  paymentLogoText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Amount
  amountContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  amountLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.buttonPrimary,
  },

  // Instructions
  instructions: {
    marginBottom: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  instructionNumberText: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.white,
  },
  instructionText: {
    fontSize: FONTS.small,
    color: COLORS.text,
    flex: 1,
  },

  // Demo Notice
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E6',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  demoNoticeText: {
    fontSize: FONTS.extraSmall,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },

  // Waiting
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  waitingText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },

  // Processing State
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  processingSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Success State
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default QRISPaymentDemoScreen;
