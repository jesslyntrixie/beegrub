import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';
import { formatDateTime } from '../../utils/helpers';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return COLORS.warning;
    case 'confirmed':
      return COLORS.info;
    case 'preparing':
      return COLORS.warning;
    case 'ready':
      return COLORS.success;
    case 'completed':
      return COLORS.textSecondary;
    case 'cancelled':
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Waiting for confirmation';
    case 'confirmed':
      return 'Order confirmed';
    case 'preparing':
      return 'Being prepared';
    case 'ready':
      return 'Ready for pickup';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const authUser = await authService.getCurrentUser();
      if (!authUser) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      // Get the application user (and thus student) linked to this auth user
      const { data: appUser, error: userError } = await apiService.users.getByAuthUserId(authUser.id);

      if (userError || !appUser) {
        console.error('Error fetching app user:', userError);
        Alert.alert('Error', 'Failed to find student profile for this account.');
        return;
      }

      const { data, error } = await apiService.orders.getByStudent(appUser.id);
      if (error) {
        console.error('Error loading orders:', error);
        Alert.alert('Error', 'Failed to load orders');
        return;
      }
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleCancelOrder = async (order) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await apiService.orders.updateStatus(order.id, 'cancelled');
              if (error) {
                console.error('Error cancelling order:', error);
                Alert.alert('Error', 'Failed to cancel order');
                return;
              }
              Alert.alert('Success', 'Order cancelled successfully');
              loadOrders();
            } catch (err) {
              console.error('Error cancelling order:', err);
              Alert.alert('Error', 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const renderOrderCard = ({ item }) => {
    const isExpanded = expandedOrderId === item.id;

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        activeOpacity={0.9}
        onPress={() => setExpandedOrderId(isExpanded ? null : item.id)}
      >
        <View style={styles.orderHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Text style={styles.orderNumber}>
            #{item.order_number || item.id.slice(0, 8)}
          </Text>
        </View>
        
        <Text style={styles.vendorName}>{item.vendor?.business_name || item.vendor?.canteen_name || 'Vendor'}</Text>
        <Text style={styles.orderDate}>{formatDateTime(item.created_at)}</Text>
        
        <View style={styles.orderDetails}>
          <Text style={styles.pickupLocation}>
            📍 {item.pickup_location?.name || item.pickup_location_name || 'Pickup location'}
          </Text>
          <Text style={styles.pickupTime}>
            🕐 {item.time_slot || item.pickup_time || 'Time slot'}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {item.order_items && item.order_items.length > 0 ? (
              item.order_items.map((orderItem) => (
                <View key={orderItem.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {orderItem.quantity}x {orderItem.menu_item?.name || 'Item'}
                    </Text>
                    {orderItem.special_instructions ? (
                      <Text style={styles.itemNote} numberOfLines={2}>
                        
                        {orderItem.special_instructions}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemPrice}>
                    Rp {(orderItem.total_price || 0).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyItemsText}>No items found for this order.</Text>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rp {(item.subtotal || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>Rp {(item.service_fee || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotalLabel}>Total Paid</Text>
              <Text style={styles.summaryTotalValue}>Rp {(item.total || item.total_amount || 0).toLocaleString()}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>
            Rp {(item.total || item.total_amount || 0).toLocaleString()}
          </Text>
          {(item.status === 'pending' || item.status === 'scheduled') && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(item)}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
      <Text style={styles.emptyStateText}>
        Start by browsing canteens and placing your first order!
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('StudentHome')}
      >
        <Text style={styles.browseButtonText}>Browse Canteens</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>My Orders</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  orderNumber: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    flexShrink: 0,
  },
  statusText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'right',
    flexShrink: 1,
  },
  vendorName: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    flexShrink: 1,
  },
  orderDate: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  orderDetails: {
    marginBottom: SPACING.md,
  },
  pickupLocation: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  pickupTime: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    flexWrap: 'wrap',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
    flexShrink: 1,
  },
  cancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.error,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cancelButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  expandedSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  itemInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
    flexShrink: 1,
  },
  itemName: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  itemNote: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  emptyItemsText: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.extraSmall,
    color: COLORS.text,
  },
  summaryTotalLabel: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});