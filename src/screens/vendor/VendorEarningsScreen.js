import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';

export const VendorEarningsScreen = ({ navigation }) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // last 7 days by default
    return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickFilter, setQuickFilter] = useState('week'); // 'week', 'month', 'all'

  useEffect(() => {
    loadEarnings();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadEarnings();
    }
  }, [startDate, endDate]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
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
        Alert.alert('Error', 'Failed to load earnings data');
        return;
      }

      const start = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      );
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

      const filtered = (data || []).filter((o) => {
        const created = new Date(o.created_at);
        const inRange = created >= start && created < end;
        const isValidStatus = !['cancelled', 'missed'].includes(o.status);
        return inRange && isValidStatus;
      });

      setOrders(filtered);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // From the vendor's perspective, earnings should be based on
  // menu sales only, not including platform/courier fees. The
  // `subtotal` column stores the sum of menu item prices.
  const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalOrders = (orders || []).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const applyQuickFilter = (filter) => {
    setQuickFilter(filter);
    const end = new Date();
    const start = new Date();

    if (filter === 'week') {
      start.setDate(start.getDate() - 6);
    } else if (filter === 'month') {
      start.setDate(start.getDate() - 29);
    } else if (filter === 'all') {
      start.setFullYear(start.getFullYear() - 10);
    }

    setStartDate(start);
    setEndDate(end);
  };

  const handleChangeStart = (_, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleChangeEnd = (_, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const renderOrderRow = ({ item }) => {
    const date = new Date(item.created_at);
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <View style={styles.orderRow}>
        <View style={styles.orderRowLeft}>
          <Text style={styles.orderRowDate}>{dateStr}</Text>
          <Text style={styles.orderRowTime}>{timeStr}</Text>
        </View>
        <View style={styles.orderRowRight}>
          <Text style={styles.orderRowTotal}>Rp {(item.subtotal || 0).toLocaleString()}</Text>
          <Text style={styles.orderRowItems}>{item.order_items?.length || 0} items</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Track your earnings and performance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Filter Buttons */}
        <View style={styles.quickFilterRow}>
          {[
            { key: 'week', label: 'Last 7 Days' },
            { key: 'month', label: 'Last 30 Days' },
            { key: 'all', label: 'All Time' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.quickFilterButton,
                quickFilter === filter.key && styles.quickFilterButtonActive,
              ]}
              onPress={() => applyQuickFilter(filter.key)}
            >
              <Text
                style={[
                  styles.quickFilterText,
                  quickFilter === filter.key && styles.quickFilterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Date Range */}
        <View style={styles.customDateSection}>
          <Text style={styles.customDateLabel}>Custom date range</Text>
          <View style={styles.dateRangeRow}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
              <View style={styles.datePickerTextContainer}>
                <Text style={styles.datePickerLabel}>From</Text>
                <Text style={styles.datePickerValue}>
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.dateRangeSeparator}>→</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
              <View style={styles.datePickerTextContainer}>
                <Text style={styles.datePickerLabel}>To</Text>
                <Text style={styles.datePickerValue}>
                  {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={loadEarnings}>
            <Text style={styles.applyButtonText}>
              {loading ? 'Loading...' : 'Apply Custom Range'}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleChangeStart}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleChangeEnd}
          />
        )}

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={COLORS.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.revenueCard}
          >
            <View style={styles.revenueCardContent}>
              <MaterialCommunityIcons name="cash-multiple" size={32} color={COLORS.white} />
              <View style={styles.revenueCardText}>
                <Text style={styles.revenueCardLabel}>Total Revenue</Text>
                <Text style={styles.revenueCardValue}>
                  Rp {totalRevenue.toLocaleString()}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="receipt-outline" size={24} color={COLORS.buttonPrimary} />
              </View>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>{totalOrders}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statLabel}>Avg. Order Value</Text>
              <Text style={styles.statValue}>Rp {Math.round(averageOrderValue).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Order List */}
        <View style={styles.ordersSection}>
          <Text style={styles.ordersSectionTitle}>Recent Transactions</Text>
          {(orders || []).length > 0 ? (
            <View style={styles.ordersListContainer}>
              {(orders || []).slice(0, 10).map((item) => (
                <View key={item.id}>{renderOrderRow({ item })}</View>
              ))}
              {(orders || []).length > 10 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('VendorOrderHistory')}
                >
                  <Text style={styles.viewAllText}>View all {orders.length} orders →</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.borderLight} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>
                Adjust the date range to see your earnings data.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  quickFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickFilterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  quickFilterButtonActive: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  quickFilterText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quickFilterTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  customDateSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  customDateLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
    minHeight: 56,
  },
  datePickerTextContainer: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  datePickerValue: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateRangeSeparator: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
  },
  applyButton: {
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
  summaryContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  revenueCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  revenueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  revenueCardText: {
    flex: 1,
  },
  revenueCardLabel: {
    fontSize: FONTS.small,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  revenueCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ordersSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  ordersSectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ordersListContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderRowLeft: {
    flex: 1,
  },
  orderRowDate: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  orderRowTime: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
  },
  orderRowRight: {
    alignItems: 'flex-end',
  },
  orderRowTotal: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 2,
  },
  orderRowItems: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
  },
  viewAllButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  viewAllText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.buttonPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
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
});

export default VendorEarningsScreen;
