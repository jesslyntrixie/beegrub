import React, { useState, useContext, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService, supabase } from '../../services/supabase';
import { CartContext } from '../../context/CartContext';

export const CheckoutScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const { cart, clearCart, getCartTotals } = useContext(CartContext);
  const cartItems = cart.items;
  const totals = getCartTotals();
  const [pickupLocations, setPickupLocations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [pickupDate, setPickupDate] = useState('today'); // 'today' or 'tomorrow'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [{ data: locations, error: locError }, { data: slots, error: slotError }] = await Promise.all([
          supabase
            .from('pickup_locations')
            .select('id, name, floor')
            .eq('is_active', true),
          supabase
            .from('time_slots')
            .select('id, time_range, start_time, end_time')
            .eq('is_active', true),
        ]);

        if (locError || slotError) {
          console.error('Error loading pickup options:', locError || slotError);
          Alert.alert('Error', 'Failed to load pickup options');
          return;
        }

        setPickupLocations(locations || []);
        setTimeSlots(slots || []);
      } catch (error) {
        console.error('Error loading pickup options:', error);
        Alert.alert('Error', 'Failed to load pickup options');
      }
    };

    loadReferenceData();
  }, []);

  const calculateServiceFee = () => {
    if (!selectedLocation) return 0;

    const floor = selectedLocation.floor || 1;
    const cappedFloor = Math.min(Math.max(floor, 1), 9);
    const baseFee = 2500;
    const floorFee = (cappedFloor - 1) * 200;

    return baseFee + floorFee;
  };

  const getTotalPrice = () => {
    const serviceFee = calculateServiceFee();
    return totals.subtotal + serviceFee;
  };

  const getFilteredTimeSlots = () => {
    const baseDate = new Date();
    const targetDate = new Date(baseDate);
    if (pickupDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const day = targetDate.getDay(); // 0 = Sun, 6 = Sat

    // No orders on Sunday
    if (day === 0) return [];

    return timeSlots.filter((slot) => {
      if (!slot.time_range) return false;
      const startLabel = slot.time_range.split('-')[0];

      // Saturday: only up to 13:00
      if (day === 6) {
        return ['09:00', '11:00', '13:00'].includes(startLabel);
      }

      // Weekdays: allow all standard slots
      const allowed = ['09:00', '11:00', '13:00', '15:00', '17:00'].includes(startLabel);
      if (!allowed) return false;

      // Hide slots that are already in the past or within 2 hours from now
      const [hours, minutes] = startLabel.split(':').map((n) => parseInt(n, 10));
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      const diffMs = slotDateTime.getTime() - baseDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      return diffHours >= 2;
    });
  };

  const parseSlotStartDateTime = () => {
    if (!selectedTimeSlot?.time_range) return null;

    const baseDate = new Date();
    const targetDate = new Date(baseDate);
    if (pickupDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const [startStr] = selectedTimeSlot.time_range.split('-'); // e.g. "13:00"
    const [hours, minutes] = startStr.split(':').map((n) => parseInt(n, 10));

    const dt = new Date(targetDate);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  };

  const handlePlaceOrder = async () => {
    if (!selectedLocation || !selectedTimeSlot) {
      Alert.alert('Missing Information', 'Please select pickup date, location, and time');
      return;
    }

    // Build actual pickup calendar date from selection
    const baseDate = new Date();
    const pickupDateObj = new Date(baseDate);
    if (pickupDate === 'tomorrow') {
      pickupDateObj.setDate(pickupDateObj.getDate() + 1);
    }

    // Validate day of week (Mon-Sat only)
    const day = pickupDateObj.getDay();
    if (day === 0) {
      Alert.alert('Unavailable', 'Orders are only available Monday to Saturday.');
      return;
    }

    const pickupDateTime = parseSlotStartDateTime();
    if (!pickupDateTime) {
      Alert.alert('Invalid Time', 'Could not determine the selected pickup time.');
      return;
    }

    const now = new Date();
    const diffMs = pickupDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 2) {
      Alert.alert(
        'Too Soon',
        'Please choose a pickup time at least 2 hours from now.'
      );
      return;
    }

    // Navigate to payment selection screen
    const serviceFee = calculateServiceFee();
    const total = totals.subtotal + serviceFee;

    navigation.navigate('PaymentMethod', {
      orderSummary: {
        // Vendor details
        vendorId: vendor?.id,
        vendorName: vendor?.business_name || vendor?.canteen_name,
        vendorLocation: vendor?.location,
        vendor,

        // Cart + pricing
        items: cartItems,
        cartItems,
        subtotal: totals.subtotal,
        serviceFee: serviceFee,
        total,

        // Pickup info
        pickupLocationId: selectedLocation?.id,
        pickupLocationName: selectedLocation?.name,
        pickupLocationFloor: selectedLocation?.floor,
        pickupLocation: selectedLocation,
        pickupTime: pickupDateTime.toISOString(),
        pickupDate,
        timeSlot: selectedTimeSlot?.time_range,
        timeSlotId: selectedTimeSlot?.id,
        selectedTimeSlot,
        notes,
        specialInstructions: notes?.trim() ? notes.trim() : null,

        // Generated order metadata
        orderNumber: `BG-${Date.now()}`,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.orderSummary}>
            <Text style={styles.vendorName}>{vendor.business_name || vendor.canteen_name}</Text>
            {cartItems.map((item, index) => (
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
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalAmount}>
                Rp {totals.subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Service Fee</Text>
              <Text style={styles.totalAmount}>
                Rp {calculateServiceFee().toLocaleString()}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                Rp {getTotalPrice().toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Pickup Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Date</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={pickupDate}
              onValueChange={(value) => setPickupDate(value)}
            >
              {(() => {
                const base = new Date();
                const todayLabel = `${base.toLocaleDateString()}`;
                const tomorrowDate = new Date(base);
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                const tomorrowLabel = `${tomorrowDate.toLocaleDateString()}`;
                return [
                  <Picker.Item
                    key="today"
                    label={`Today (${todayLabel})`}
                    value="today"
                  />,
                  <Picker.Item
                    key="tomorrow"
                    label={`Tomorrow (${tomorrowLabel})`}
                    value="tomorrow"
                  />,
                ];
              })()}
            </Picker>
          </View>
          <Text style={styles.dateInfoTextSmall}>
            Orders are available Monday to Saturday. Time slots adjust based on your chosen day.
          </Text>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedLocation?.id || ''}
              onValueChange={(value) => {
                const loc = pickupLocations.find((l) => l.id === value) || null;
                setSelectedLocation(loc);
              }}
            >
              <Picker.Item label="Select pickup location" value="" />
              {pickupLocations.map((location) => (
                <Picker.Item
                  key={location.id}
                  label={location.name}
                  value={location.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Pickup Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Time</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTimeSlot?.id || ''}
              onValueChange={(value) => {
                const slots = getFilteredTimeSlots();
                const slot = slots.find((s) => s.id === value) || null;
                setSelectedTimeSlot(slot);
              }}
            >
              <Picker.Item label="Select pickup time" value="" />
              {getFilteredTimeSlots().map((slot) => (
                <Picker.Item
                  key={slot.id}
                  label={slot.time_range}
                  value={slot.id}
                />
              ))}
            </Picker>
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
            Continue to Payment - Rp {getTotalPrice().toLocaleString()}
          </Text>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  orderSummary: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorName: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  itemName: {
    fontSize: FONTS.small,
    color: COLORS.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: FONTS.small,
    fontWeight: '500',
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.success,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: COLORS.buttonPrimary,
    backgroundColor: COLORS.buttonPrimary,
  },
  optionText: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    flexShrink: 1,
  },
  selectedOptionText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeButton: {
    width: '31%',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    fontSize: FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minHeight: 80,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  placeOrderButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  dateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xs,
  },
  dateDropdownContent: {
    flexDirection: 'column',
    flex: 1,
    flexShrink: 1,
  },
  dateDropdownLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateDropdownValue: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  dateDropdownArrow: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },
  dateInfoTextSmall: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});