import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await apiService.admin.getAllOrders();
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'preparing': return '#8B5CF6';
      case 'ready': return '#10B981';
      case 'completed': return '#059669';
      case 'cancelled': return '#EF4444';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'preparing': return 'restaurant-outline';
      case 'ready': return 'gift-outline';
      case 'completed': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const renderOrderCard = ({ item }) => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberContainer}>
            <Ionicons name="receipt" size={18} color="#007AFF" />
            <Text style={styles.orderNumber}>{item.order_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={COLORS.white} />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.orderRow}>
            <View style={styles.orderCol}>
              <View style={styles.detailRow}>
                <Ionicons name="storefront" size={16} color="#007AFF" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.vendor?.business_name || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color={COLORS.error} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.pickup_location?.name || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.orderRow}>
            <View style={styles.orderCol}>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color={COLORS.success} />
                <Text style={styles.detailText}>
                  {item.scheduled_pickup_time 
                    ? new Date(item.scheduled_pickup_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : 'Not scheduled'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#007AFF" />
                <Text style={styles.detailText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            Rp {item.total?.toLocaleString() || '0'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSubtitle}>{filteredOrders.length} orders</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#007AFF15' }]}>
            <Ionicons name="receipt-outline" size={24} color="#007AFF" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>{filteredOrders.length}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: COLORS.success + '15' }]}>
            <Ionicons name="cash-outline" size={24} color={COLORS.success} />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryNumber}>
              Rp {(totalRevenue / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.summaryLabel}>Revenue</Text>
          </View>
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.xl }}
        >
          {[
            { key: 'all', label: 'All', count: orders.length },
            { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
            { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
            { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
            { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
            { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filterStatus === f.key && styles.filterChipActive]}
              onPress={() => setFilterStatus(f.key)}
            >
              <Text style={[styles.filterText, filterStatus === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
              {f.count > 0 && (
                <View style={[styles.filterBadge, filterStatus === f.key && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, filterStatus === f.key && styles.filterBadgeTextActive]}>
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="receipt-outline" size={64} color="#007AFF" />
            </View>
            <Text style={styles.emptyText}>No Orders Found</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'all' 
                ? 'No orders have been placed yet' 
                : `No ${filterStatus} orders`}
            </Text>
          </View>
        }
      />
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.md,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  summaryContent: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  filters: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.white + '30',
  },
  filterBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  filterBadgeTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  orderNumber: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  orderBody: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  orderRow: {
    flexDirection: 'row',
  },
  orderCol: {
    flex: 1,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#007AFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
});
