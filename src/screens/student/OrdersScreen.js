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

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'scheduled':
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return currentStatus;
    }
  };

  const handleAdvanceStatus = async (order) => {
    const nextStatus = getNextStatus(order.status);

    if (nextStatus === order.status) {
      Alert.alert('Status', 'This order is already completed.');
      return;
    }

    try {
      const { error } = await apiService.orders.updateStatus(order.id, nextStatus);
      if (error) {
        console.error('Error updating order status:', error);
        Alert.alert('Error', 'Failed to update order status');
        return;
      }

      // Refresh list to reflect new status
      loadOrders();
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      Alert.alert('Error', 'Unexpected error updating status');
    }
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => {}}
    >
      <View style={styles.orderHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.vendorName}>{item.vendor?.business_name || item.vendor?.canteen_name || 'Vendor'}</Text>
      <Text style={styles.orderDate}>{formatDateTime(item.created_at)}</Text>
      
      <View style={styles.orderDetails}>
        <Text style={styles.pickupLocation}>📍 {item.pickup_location || item.pickup_location_name || 'Pickup location'}</Text>
        <Text style={styles.pickupTime}>🕐 {item.time_slot || item.pickup_time || 'Time slot'}</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>
          Rp {(item.total || item.total_amount || 0).toLocaleString()}
        </Text>
        <TouchableOpacity
          style={styles.advanceButton}
          onPress={() => handleAdvanceStatus(item)}
        >
          <Text style={styles.advanceButtonText}>Advance Status</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity onPress={() => navigation.navigate('StudentHome')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
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
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  backText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  listContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    maxWidth: '80%',
  },
  statusText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'right',
    flexShrink: 1,
  },
  vendorName: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
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
  },
  pickupTime: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalAmount: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  advanceButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.buttonPrimary,
  },
  advanceButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
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
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
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
  },
  browseButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});