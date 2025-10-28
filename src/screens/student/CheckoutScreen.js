import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';

const PICKUP_LOCATIONS = [
  'Ground Floor - Main Lobby',
  'Ground Floor - Canteen Area',
  'First Floor - Study Area',
  'Second Floor - Library Entrance',
];

const PICKUP_TIMES = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
];

export const CheckoutScreen = ({ route, navigation }) => {
  const { vendor, cart } = route.params;
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedLocation || !selectedTime) {
      Alert.alert('Missing Information', 'Please select pickup location and time');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      // Create order
      const orderData = {
        student_id: user.id,
        vendor_id: vendor.id,
        pickup_location: selectedLocation,
        pickup_time: selectedTime,
        notes: notes,
        total_amount: getTotalPrice(),
        status: 'pending',
        order_items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      };

      const { data, error } = await apiService.orders.create(orderData);
      
      if (error) {
        Alert.alert('Order Error', error.message);
        return;
      }

      Alert.alert(
        'Order Placed!', 
        'Your order has been placed successfully. You will receive a notification when it\'s ready for pickup.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Orders')
          }
        ]
      );
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummary}>
            <Text style={styles.vendorName}>{vendor.canteen_name}</Text>
            {cart.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  Rp {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                Rp {getTotalPrice().toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          {PICKUP_LOCATIONS.map((location, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedLocation === location && styles.selectedOption
              ]}
              onPress={() => setSelectedLocation(location)}
            >
              <Text style={[
                styles.optionText,
                selectedLocation === location && styles.selectedOptionText
              ]}>
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pickup Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Time</Text>
          <View style={styles.timeGrid}>
            {PICKUP_TIMES.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.selectedTime
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requests or notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.placeOrderButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? 'Placing Order...' : `Place Order - Rp ${getTotalPrice().toLocaleString()}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  orderSummary: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
  },
  vendorName: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  itemName: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: FONTS.regular,
    fontWeight: '500',
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.buttonPrimary,
    backgroundColor: COLORS.buttonPrimary,
  },
  optionText: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '30%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedTime: {
    borderColor: COLORS.buttonPrimary,
    backgroundColor: COLORS.buttonPrimary,
  },
  timeText: {
    fontSize: FONTS.small,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    fontSize: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeOrderButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});