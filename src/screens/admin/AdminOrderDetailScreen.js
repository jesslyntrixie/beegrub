import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return COLORS.warning;
    case 'confirmed':
    case 'preparing':
      return COLORS.info;
    case 'ready':
      return COLORS.success;
    case 'completed':
      return COLORS.textSecondary;
    case 'cancelled':
    case 'missed':
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
};

export default function AdminOrderDetailScreen({ route, navigation }) {
  const { orderId, orderNumber } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const { data, error } = await apiService.orders.getById(orderId);
      if (error) {
        Alert.alert('Error', 'Failed to load order details');
        return;
      }
      setOrder(data);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const createdAt = new Date(order.created_at);
  const createdDate = createdAt.toLocaleDateString();
  const createdTime = createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = order.subtotal || 0;
  const serviceFee = order.service_fee || 0;
  const total = order.total || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <Text style={styles.headerSubtitle}>{orderNumber || order.order_number}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status & Time */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
            >
              <Text style={styles.statusText}>{(order.status || '').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.sectionText}>Created: {createdDate} · {createdTime}</Text>
          {order.scheduled_pickup_time && (
            <Text style={styles.sectionText}>
              Pickup time:{' '}
              {new Date(order.scheduled_pickup_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
          {order.time_slot && (
            <Text style={styles.sectionText}>Time slot: {order.time_slot}</Text>
          )}
        </View>

        {/* Parties */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>People</Text>
          <View style={styles.detailRow}>
            <Ionicons name="storefront" size={18} color="#007AFF" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Vendor</Text>
              <Text style={styles.detailValue}>
                {order.vendor?.business_name || 'N/A'}
              </Text>
              {order.vendor?.location && (
                <Text style={styles.detailSub}>{order.vendor.location}</Text>
              )}
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={18} color={COLORS.text} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Student</Text>
              <Text style={styles.detailValue}>
                {order.student?.full_name || 'N/A'}
              </Text>
              {order.student?.phone && (
                <Text style={styles.detailSub}>{order.student.phone}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Delivery / Pickup */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={18} color={COLORS.error} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {order.pickup_location?.name || 'N/A'}
              </Text>
              {order.pickup_location?.building && (
                <Text style={styles.detailSub}>{order.pickup_location.building}</Text>
              )}
              {order.pickup_location?.description && (
                <Text style={styles.detailSub}>{order.pickup_location.description}</Text>
              )}
            </View>
          </View>
          {order.special_instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsLabel}>Special instructions</Text>
              <Text style={styles.instructionsText}>{order.special_instructions}</Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.quantity}x {item.menu_item?.name || 'Item'}
                  </Text>
                  {item.special_instructions ? (
                    <Text style={styles.itemNote} numberOfLines={2}>
                      {item.special_instructions}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.itemPrice}>
                  Rp {(item.total_price || 0).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionText}>No items found for this order.</Text>
          )}
        </View>

        {/* Totals */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rp {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fees (Platform + Courier)</Text>
            <Text style={styles.summaryValue}>Rp {serviceFee.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>Rp {total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  sectionText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  detailTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  detailSub: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  instructionsBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.background,
  },
  instructionsLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  instructionsText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  itemLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  itemName: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  itemNote: {
    marginTop: SPACING.xs,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#007AFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#007AFF',
  },
});
