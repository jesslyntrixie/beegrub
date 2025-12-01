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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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

export const VendorDashboardScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorName, setVendorName] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const authUser = await authService.getCurrentUser();
      console.log('🔑 Auth user:', authUser?.id, authUser?.email);
      if (!authUser) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      // Look up the application user (vendor) linked to this auth user
      const { data: appUser, error: userError } = await apiService.users.getByAuthUserId(
        authUser.id,
      );

      console.log('👤 App user result:', { appUser, userError });

      if (userError || !appUser) {
        console.error('❌ Error fetching vendor user:', userError);
        console.error('❌ Auth user ID was:', authUser.id);
        Alert.alert('Error', 'Failed to find vendor profile for this account.');
        return;
      }

      console.log('🏪 Fetching vendor data for user ID:', appUser.id);
      // Fetch vendor details to get business name
      const { data: vendorData, error: vendorError } = await apiService.vendors.getById(appUser.id);
      console.log('🏪 Vendor data result:', { vendorData, vendorError });
      
      if (vendorData) {
        setVendorName(vendorData.business_name || 'Vendor');
      } else {
        console.error('❌ No vendor data found for user ID:', appUser.id);
      }

      const { data, error } = await apiService.orders.getByVendor(appUser.id);
      if (error) {
        console.error('Error loading vendor orders:', error);
        Alert.alert('Error', 'Failed to load orders');
        return;
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Error loading vendor orders:', err);
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

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await authService.signOut();
              if (error) {
                console.error('Error logging out:', error);
                Alert.alert('Error', 'Failed to logout');
                return;
              }
              // Navigation will be handled by auth state listener
            } catch (err) {
              console.error('Error logging out:', err);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
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
        console.error('Error updating order status:', error);
        Alert.alert('Error', 'Failed to update order status');
        return;
      }

      loadOrders();
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      Alert.alert('Error', 'Unexpected error updating status');
    }
  };

  const renderOrderCard = ({ item }) => {
    const isCompleted = item.status === 'completed' || item.status === 'cancelled' || item.status === 'missed';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Text style={styles.orderTime}>{formatDateTime(item.created_at)}</Text>
        </View>

        <Text style={styles.studentName}>{item.students?.full_name || 'Student order'}</Text>
        <Text style={styles.pickupInfo}>
          🕐 {item.time_slot || 'Time slot'}  •  📍 {item.pickup_locations?.[0]?.name || item.pickup_location_name || 'Pickup location'}
        </Text>

        <View style={styles.itemsContainer}>
          {(item.order_items || []).length > 0 ? (
            (item.order_items || []).map((oi) => (
              <Text key={oi.id} style={styles.itemLine}>
                {oi.quantity}x {oi.menu_items?.name || oi.menu_item?.name || 'Item'} - Rp {(oi.total_price || 0).toLocaleString()}
              </Text>
            ))
          ) : (
            <Text style={styles.itemLine}>No items loaded</Text>
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.totalAmount}>Total: Rp {(item.total || 0).toLocaleString()}</Text>
          {!isCompleted && (
            <TouchableOpacity
              style={styles.advanceButton}
              onPress={() => handleAdvanceStatus(item)}
            >
              <Text style={styles.advanceButtonText}>Next: {getNextStatusForVendor(item.status)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled', 'missed'].includes(o.status),
  );
  const completedOrders = orders.filter((o) => ['completed'].includes(o.status));

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const todaysOrders = orders.filter((o) => {
    const created = new Date(o.created_at);
    const isToday = created >= startOfDay && created < endOfDay;
    const isValidStatus = !['cancelled', 'missed'].includes(o.status);
    return isToday && isValidStatus;
  });

  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const todaysCount = todaysOrders.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.vendorName}>{vendorName || 'Vendor'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        
        <LinearGradient
          colors={COLORS.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningsCard}
        >
          <View style={styles.earningsRow}>
            <View style={styles.earningsLeft}>
              <Text style={styles.earningsTitle}>Today's Earnings</Text>
              <Text style={styles.earningsAmount}>Rp {todaysRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.earningsRight}>
              <Text style={styles.earningsCount}>{todaysCount}</Text>
              <Text style={styles.earningsLabel}>Orders</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.navigation}>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('VendorOrders')}
          >
            <Ionicons name="receipt-outline" size={24} color={COLORS.buttonPrimary} />
            <Text style={styles.navButtonText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('VendorEarnings')}
          >
            <MaterialIcons name="bar-chart" size={24} color={COLORS.buttonPrimary} />
            <Text style={styles.navButtonText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('VendorMenu')}
          >
            <MaterialCommunityIcons name="food-fork-drink" size={24} color={COLORS.buttonPrimary} />
            <Text style={styles.navButtonText}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('VendorOrderHistory')}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.buttonPrimary} />
            <Text style={styles.navButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.ordersSection}>
        <View style={styles.ordersSectionHeader}>
          <Text style={styles.ordersSectionTitle}>Active Orders</Text>
          <View style={styles.ordersBadge}>
            <Text style={styles.ordersBadgeText}>{activeOrders.length}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.ordersList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>No active orders</Text>
            <Text style={styles.emptyText}>New orders will appear here in real-time.</Text>
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
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + SPACING.sm,
    marginBottom: SPACING.md,
  },
  welcomeSection: {
    flex: 1,
  },
  logoutButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginLeft: SPACING.md,
  },
  welcomeText: {
    fontSize: FONTS.small,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
    letterSpacing: 0.3,
  },
  vendorName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  earningsCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLeft: {
    flex: 1,
  },
  earningsTitle: {
    fontSize: FONTS.small,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    opacity: 0.95,
    letterSpacing: 0.2,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  earningsRight: {
    alignItems: 'center',
  },
  earningsCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  earningsLabel: {
    fontSize: FONTS.extraSmall,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
  },
  navigation: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    gap: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  ordersSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  ordersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ordersSectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ordersBadge: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
    minWidth: 24,
    alignItems: 'center',
  },
  ordersBadgeText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  ordersList: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.small,
  },
  statusText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  orderTime: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
  },
  studentName: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  pickupInfo: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  itemsContainer: {
    marginBottom: SPACING.sm,
  },
  itemLine: {
    fontSize: FONTS.extraSmall,
    color: COLORS.text,
    marginBottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  advanceButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.buttonPrimary,
  },
  advanceButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emptyState: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default VendorDashboardScreen;
