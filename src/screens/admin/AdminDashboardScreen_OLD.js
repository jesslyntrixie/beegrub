import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function AdminDashboardScreen({ navigation }) {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [approvedVendors, setApprovedVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch vendors
      const [pendingResult, approvedResult, statsResult] = await Promise.all([
        apiService.admin.getVendors('pending'),
        apiService.admin.getVendors('approved'),
        apiService.admin.getStats()
      ]);

      console.log('Pending vendors:', pendingResult.data);
      console.log('Approved vendors:', approvedResult.data);
      console.log('Stats:', statsResult.data);
      console.log('Errors:', { 
        pending: pendingResult.error, 
        approved: approvedResult.error, 
        stats: statsResult.error 
      });

      if (pendingResult.error) throw pendingResult.error;
      if (approvedResult.error) throw approvedResult.error;
      if (statsResult.error) throw statsResult.error;

      setPendingVendors(pendingResult.data || []);
      setApprovedVendors(approvedResult.data || []);
      setStats(statsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (vendorId, businessName) => {
    Alert.alert(
      'Approve Vendor',
      `Approve ${businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const { error } = await apiService.admin.approveVendor(vendorId);
              if (error) throw error;

              Alert.alert('Success', `${businessName} has been approved!`);
              fetchData();
            } catch (error) {
              console.error('Error approving vendor:', error);
              Alert.alert('Error', 'Failed to approve vendor');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (vendorId, businessName) => {
    Alert.alert(
      'Reject Vendor',
      `Reject ${businessName}? This will set their status to rejected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await apiService.admin.rejectVendor(vendorId);
              if (error) throw error;

              Alert.alert('Rejected', `${businessName} has been rejected`);
              fetchData();
            } catch (error) {
              console.error('Error rejecting vendor:', error);
              Alert.alert('Error', 'Failed to reject vendor');
            }
          }
        }
      ]
    );
  };

  const handleSuspend = async (vendorId, businessName) => {
    Alert.alert(
      'Suspend Vendor',
      `Suspend ${businessName}? They will not be able to access the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await apiService.admin.suspendVendor(vendorId);
              if (error) throw error;

              Alert.alert('Suspended', `${businessName} has been suspended`);
              fetchData();
            } catch (error) {
              console.error('Error suspending vendor:', error);
              Alert.alert('Error', 'Failed to suspend vendor');
            }
          }
        }
      ]
    );
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
              await authService.signOut();
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  const renderVendorCard = ({ item }) => {
    const isPending = item.status === 'pending';
    const email = item.user?.email || 'N/A';

    const getStatusColor = () => {
      if (item.status === 'pending') return '#F59E0B';
      if (item.status === 'approved') return COLORS.success;
      return COLORS.textSecondary;
    };

    return (
      <View style={styles.vendorCard}>
        {/* Header with Name and Status */}
        <View style={styles.vendorHeader}>
          <Text style={styles.vendorName}>{item.business_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.vendorInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{item.contact_phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{email}</Text>
          </View>

          {item.description && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText} numberOfLines={2}>{item.description}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.vendorActions}>
          {isPending ? (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item.id, item.business_name)}
              >
                <Text style={[styles.actionButtonText, { color: COLORS.success }]}>
                  Approve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id, item.business_name)}
              >
                <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
                  Reject
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handleSuspend(item.id, item.business_name)}
            >
              <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>
                Suspend
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const displayData = activeTab === 'pending' ? pendingVendors : approvedVendors;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage vendors and users</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutIcon}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>{stats.users.total}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statDetail}>
                {stats.users.students} Students · {stats.users.vendors} Vendors
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>{stats.vendors.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statDetail}>
                {stats.vendors.approved} Approved
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="people-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>All Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AdminOrders')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="receipt-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>All Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Vendor Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Management</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
              onPress={() => setActiveTab('pending')}
            >
              <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                Pending ({pendingVendors.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
              onPress={() => setActiveTab('approved')}
            >
              <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
                Approved ({approvedVendors.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vendor List */}
          {displayData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={activeTab === 'pending' ? "checkmark-circle-outline" : "storefront-outline"} 
                size={48} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.emptyText}>
                {activeTab === 'pending' 
                  ? 'No pending vendors' 
                  : 'No approved vendors'}
              </Text>
            </View>
          ) : (
            displayData.map((item) => (
              <View key={item.id}>
                {renderVendorCard({ item })}
              </View>
            ))
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statDetail: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.small,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  vendorCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  vendorName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  vendorInfo: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  vendorActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
    alignItems: 'center',
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error + '15',
    borderColor: COLORS.error,
  },
  suspendButton: {
    backgroundColor: '#F59E0B15',
    borderColor: '#F59E0B',
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
