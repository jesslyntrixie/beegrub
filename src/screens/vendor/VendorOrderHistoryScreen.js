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
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

export const VendorOrderHistoryScreen = ({ navigation }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'cancelled', 'missed'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allOrders, searchQuery, statusFilter, dateFilter, customStartDate, customEndDate]);

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
        console.error('Error fetching vendor user:', userError);
        Alert.alert('Error', 'Failed to find vendor profile for this account.');
        return;
      }

      const { data, error } = await apiService.orders.getByVendor(appUser.id);
      if (error) {
        console.error('Error loading vendor order history:', error);
        Alert.alert('Error', 'Failed to load order history');
        return;
      }

      // Debug: log first order to check student data structure
      if (data && data.length > 0) {
        console.log('=== FULL ORDER OBJECT ===');
        console.log(JSON.stringify(data[0], null, 2));
        console.log('=== STUDENT OBJECT ONLY ===');
        console.log(JSON.stringify(data[0].students, null, 2));
      }

      // Sort by created_at descending (newest first)
      const sorted = (data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setAllOrders(sorted);
    } catch (err) {
      console.error('Error loading vendor order history:', err);
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

  const applyFilters = () => {
    let filtered = [...allOrders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => {
        if (statusFilter === 'completed') return order.status === 'completed';
        if (statusFilter === 'cancelled') return order.status === 'cancelled';
        if (statusFilter === 'missed') return order.status === 'missed';
        return true;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);

        if (dateFilter === 'today') {
          return (
            orderDate.getDate() === now.getDate() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        }

        if (dateFilter === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        }

        if (dateFilter === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setDate(monthAgo.getDate() - 30);
          return orderDate >= monthAgo;
        }

        if (dateFilter === 'custom') {
          const start = new Date(
            customStartDate.getFullYear(),
            customStartDate.getMonth(),
            customStartDate.getDate()
          );
          const end = new Date(
            customEndDate.getFullYear(),
            customEndDate.getMonth(),
            customEndDate.getDate() + 1
          );
          return orderDate >= start && orderDate < end;
        }

        return true;
      });
    }

    // Search filter (student name or order number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        const studentName = (order.students?.full_name || '').toLowerCase();
        const orderNumber = (order.order_number || order.id.slice(0, 8)).toLowerCase();
        return studentName.includes(query) || orderNumber.includes(query);
      });
    }

    setFilteredOrders(filtered);
  };

  const handleChangeStartDate = (_, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setCustomStartDate(selectedDate);
    }
  };

  const handleChangeEndDate = (_, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setCustomEndDate(selectedDate);
    }
  };

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const completedCount = filteredOrders.filter((o) => o.status === 'completed').length;

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
          <Text style={styles.orderNumber}>#{item.order_number || item.id.slice(0, 8)}</Text>
        </View>

        <Text style={styles.studentName}>{item.students?.full_name || 'Student order'}</Text>
        <Text style={styles.orderTime}>{formatDateTime(item.created_at)}</Text>

        <Text style={styles.pickupInfo}>
          🕐 {item.time_slot || 'Time slot'}  •  📍 {item.pickup_locations?.name || 'Pickup location'}
        </Text>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>Items</Text>
            {item.order_items && item.order_items.length > 0 ? (
              item.order_items.map((oi) => (
                <View key={oi.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {oi.quantity}x {oi.menu_items?.name || 'Item'}
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
                Rp {(item.total || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.totalAmount}>Rp {(item.total || 0).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Order History</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>View all past orders and transactions</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="receipt-outline" size={20} color={COLORS.buttonPrimary} />
          <Text style={styles.statValue}>{filteredOrders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="cash" size={20} color={COLORS.warning} />
          <Text style={styles.statValue}>Rp {(totalRevenue / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or order ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        contentContainerStyle={
          (filteredOrders || []).length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Your order history will appear here once you have completed orders.'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Orders</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Status Filter */}
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all', label: 'All Orders' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                  { key: 'missed', label: 'Missed Pickup' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      statusFilter === option.key && styles.filterOptionActive,
                    ]}
                    onPress={() => setStatusFilter(option.key)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        statusFilter === option.key && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Filter */}
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'Last 7 Days' },
                  { key: 'month', label: 'Last 30 Days' },
                  { key: 'custom', label: 'Custom Range' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      dateFilter === option.key && styles.filterOptionActive,
                    ]}
                    onPress={() => setDateFilter(option.key)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        dateFilter === option.key && styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <View style={styles.customDateSection}>
                  <TouchableOpacity
                    style={styles.customDateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={styles.customDateLabel}>From</Text>
                    <Text style={styles.customDateValue}>
                      {customStartDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.customDateButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text style={styles.customDateLabel}>To</Text>
                    <Text style={styles.customDateValue}>
                      {customEndDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  {showStartPicker && (
                    <DateTimePicker
                      value={customStartDate}
                      mode="date"
                      display="default"
                      onChange={handleChangeStartDate}
                    />
                  )}
                  {showEndPicker && (
                    <DateTimePicker
                      value={customEndDate}
                      mode="date"
                      display="default"
                      onChange={handleChangeEndDate}
                    />
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.small,
    color: COLORS.text,
  },
  filterButton: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: BORDER_RADIUS.medium,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.sm,
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
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalAmount: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
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
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.large,
    borderTopRightRadius: BORDER_RADIUS.large,
    maxHeight: '55%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.sm,
  },
  modalContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterOptionActive: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  filterOptionText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  customDateSection: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  customDateButton: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  customDateLabel: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  customDateValue: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  resetButtonText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  applyButtonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default VendorOrderHistoryScreen;
