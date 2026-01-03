import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';
import { formatDateTime } from '../../utils/helpers';

const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
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

const getStatusText = (status) => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'pending':
      return 'New order';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for pickup';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'missed':
      return 'Missed pickup';
    default:
      return status;
  }
};

const getNextStatusForVendor = (currentStatus) => {
  switch (currentStatus) {
    case 'scheduled':
    case 'pending':
      return 'confirmed';
    case 'confirmed':
      return 'preparing';
    case 'preparing':
      return 'ready';
    case 'ready':
      return 'completed';
    default:
      return currentStatus;
  }
};

export const VendorOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'completed' | 'all'
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

      const { data: appUser, error: userError } = await apiService.users.getByAuthUserId(
        authUser.id,
      );

      if (userError || !appUser) {
        Alert.alert('Error', 'Failed to find vendor profile for this account.');
        return;
      }

      const { data, error } = await apiService.orders.getByVendor(appUser.id);
      if (error) {
        Alert.alert('Error', 'Failed to load orders');
        return;
      }

      setOrders(data || []);
    } catch (err) {
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

  const handleAdvanceStatus = async (order) => {
    const nextStatus = getNextStatusForVendor(order.status);

    if (nextStatus === order.status) {
      Alert.alert('Status', 'This order is already completed or cannot be advanced.');
      return;
    }

    try {
      const { error } = await apiService.orders.updateStatus(order.id, nextStatus);
      if (error) {
        Alert.alert('Error', 'Failed to update order status');
        return;
      }

      loadOrders();
    } catch (err) {
      Alert.alert('Error', 'Unexpected error updating status');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return !['completed', 'cancelled', 'missed'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['completed'].includes(order.status);
    }
    return true;
  });

  const renderOrderCard = ({ item }) => {
    const isExpanded = expandedOrderId === item.id;
    const isCompleted = ['completed', 'cancelled', 'missed'].includes(item.status);

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
          <Text style={styles.orderNumber}>#{item.order_number || item.id.slice(0, 8)}</Text>
        </View>

        <Text style={styles.studentName}>{item.student?.full_name || 'Student order'}</Text>
        <Text style={styles.orderTime}>{formatDateTime(item.created_at)}</Text>

        <Text style={styles.pickupInfo}>
          🕐 {item.time_slot || item.scheduled_pickup_time || 'Time slot'}  •  📍 {item.pickup_location?.name || item.pickup_location_name || 'Pickup location'}
        </Text>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>Items</Text>
            {item.order_items && item.order_items.length > 0 ? (
              item.order_items.map((oi) => (
                <View key={oi.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {oi.quantity}x {oi.menu_item?.name || 'Item'}
                    </Text>
                    {oi.special_instructions ? (
                      <Text style={styles.itemNote} numberOfLines={2}>
                        {oi.special_instructions}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemPrice}>
                    Rp {(oi.total_price || 0).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyItemsText}>No items loaded for this order.</Text>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rp {(item.subtotal || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service fee</Text>
              <Text style={styles.summaryValue}>Rp {(item.service_fee || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                Rp {(item.subtotal || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.totalAmount}>Rp {(item.subtotal || 0).toLocaleString()}</Text>
          {!isCompleted && (
            <TouchableOpacity
              style={styles.advanceButton}
              onPress={() => handleAdvanceStatus(item)}
            >
              <Text style={styles.advanceButtonText}>
                Next: {getNextStatusForVendor(item.status)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.tabsRow}>
      {['active', 'completed', 'all'].map((value) => (
        <TouchableOpacity
          key={value}
          style={[styles.tabButton, filter === value && styles.tabButtonActive]}
          onPress={() => setFilter(value)}
        >
          <Text
            style={[
              styles.tabButtonText,
              filter === value && styles.tabButtonTextActive,
            ]}
          >
            {value === 'active' ? 'Active' : value === 'completed' ? 'Completed' : 'All'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Active Orders</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Manage incoming orders</Text>
      </View>

      {renderFilterTabs()}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        contentContainerStyle={
          filteredOrders.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No orders to show</Text>
            <Text style={styles.emptyText}>
              New customer orders will appear here as they come in.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    paddingBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '400',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  tabButtonActive: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  tabButtonText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  },
  statusText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  orderNumber: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
  },
  studentName: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  orderTime: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  pickupInfo: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
    flexShrink: 1,
  },
  advanceButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.buttonPrimary,
    flexShrink: 0,
  },
  advanceButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default VendorOrdersScreen;
