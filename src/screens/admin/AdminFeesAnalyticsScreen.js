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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';

export default function AdminFeesAnalyticsScreen({ navigation }) {
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
    loadOrders();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await apiService.admin.getAllOrders();
      if (error) {
        Alert.alert('Error', 'Failed to load orders for analytics');
        return;
      }

      const all = data || [];

      const start = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      );
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

      const filtered = all.filter((o) => {
        const created = new Date(o.created_at);
        return created >= start && created < end;
      });

      setOrders(filtered);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalFees = (orders || []).reduce((sum, o) => sum + (o.service_fee || 0), 0);
  const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = (orders || []).length;
  const averageFee = totalOrders > 0 ? totalFees / totalOrders : 0;

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
          <Text style={styles.orderRowFee}>Rp {(item.service_fee || 0).toLocaleString()}</Text>
          <Text style={styles.orderRowMeta}>{item.order_number || 'No number'}</Text>
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
          <Text style={styles.title}>Fee Analytics</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Track platform and courier fees over time</Text>
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
                  {startDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
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
                  {endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={loadOrders}>
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
            style={styles.primaryCard}
          >
            <View style={styles.primaryCardContent}>
              <MaterialCommunityIcons name="chart-areaspline" size={32} color={COLORS.white} />
              <View style={styles.primaryCardText}>
                <Text style={styles.primaryCardLabel}>Total Fees</Text>
                <Text style={styles.primaryCardValue}>
                  Rp {totalFees.toLocaleString()}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.secondaryCardsRow}>
            <View style={styles.secondaryCard}>
              <Text style={styles.secondaryLabel}>Orders</Text>
              <Text style={styles.secondaryValue}>{totalOrders}</Text>
              <Text style={styles.secondarySub}>in selected range</Text>
            </View>
            <View style={styles.secondaryCard}>
              <Text style={styles.secondaryLabel}>Avg Fee / Order</Text>
              <Text style={styles.secondaryValue}>Rp {averageFee.toFixed(0)}</Text>
              <Text style={styles.secondarySub}>platform + courier</Text>
            </View>
          </View>

          <View style={styles.secondaryCardsRow}>
            <View style={styles.secondaryCard}>
              <Text style={styles.secondaryLabel}>Total Revenue</Text>
              <Text style={styles.secondaryValue}>Rp {totalRevenue.toLocaleString()}</Text>
              <Text style={styles.secondarySub}>student paid total</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Orders & Fees</Text>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderRow}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No orders in this range yet.</Text>
            }
          />
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
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
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
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  quickFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  quickFilterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  quickFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  quickFilterText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  quickFilterTextActive: {
    color: COLORS.white,
  },
  customDateSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  customDateLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  datePickerTextContainer: {
    marginLeft: SPACING.sm,
  },
  datePickerLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  datePickerValue: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  dateRangeSeparator: {
    marginHorizontal: SPACING.sm,
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  applyButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  summaryContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  primaryCard: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
  },
  primaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryCardText: {
    marginLeft: SPACING.md,
  },
  primaryCardLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  primaryCardValue: {
    marginTop: SPACING.xs,
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  secondaryCardsRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.md,
    marginRight: SPACING.md,
  },
  secondaryLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  secondaryValue: {
    marginTop: SPACING.xs,
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  secondarySub: {
    marginTop: SPACING.xs,
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  listSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  listTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  orderRowLeft: {
    flexDirection: 'column',
  },
  orderRowDate: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  orderRowTime: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  orderRowRight: {
    alignItems: 'flex-end',
  },
  orderRowFee: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#007AFF',
  },
  orderRowMeta: {
    marginTop: SPACING.xs,
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});
