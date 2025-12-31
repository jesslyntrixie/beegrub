import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingResult, statsResult] = await Promise.all([
        apiService.admin.getVendors('pending'),
        apiService.admin.getStats()
      ]);

      if (pendingResult.error) throw pendingResult.error;
      if (statsResult.error) throw statsResult.error;

      setPendingVendors(pendingResult.data || []);
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
      `Reject ${businessName}?`,
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
      `Suspend ${businessName}?`,
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

  const handleLogout = () => {
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
              navigation.replace('Auth');
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
        <View style={styles.vendorHeader}>
          <View style={styles.vendorTitleContainer}>
            <Ionicons name="storefront" size={20} color={COLORS.primary} />
            <Text style={styles.vendorName}>{item.business_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.vendorInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={COLORS.error} />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>{item.contact_phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>{email}</Text>
          </View>

          {item.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.infoText} numberOfLines={2}>{item.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.vendorActions}>
          {isPending ? (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item.id, item.business_name)}
              >
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={[styles.actionButtonText, { color: COLORS.success }]}>
                  Approve
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id, item.business_name)}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.error} />
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
              <Ionicons name="ban" size={18} color="#F59E0B" />
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage your platform</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
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
              <View style={[styles.statIconContainer, { backgroundColor: '#007AFF15', borderColor: '#007AFF' }]}>
                <Ionicons name="people" size={24} color="#007AFF" />
              </View>
              <Text style={styles.statNumber}>{stats.users.total}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statDetail}>
                {stats.users.students} Students · {stats.users.vendors} Vendors
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B' }]}>
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

        {/* Management Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Management</Text>
        </View>

        <View style={styles.menuGrid}>
          <Pressable 
            style={({ pressed }) => [
              styles.menuCard,
              pressed && styles.menuCardPressed
            ]}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#007AFF15', borderColor: '#007AFF' }]}>
              <Ionicons name="people" size={32} color="#007AFF" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>User Management</Text>
              <Text style={styles.menuSubtitle}>View and manage all users</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.menuCard,
              pressed && styles.menuCardPressed
            ]}
            onPress={() => navigation.navigate('AdminOrders')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#10B98115', borderColor: '#10B981' }]}>
              <Ionicons name="receipt" size={32} color="#10B981" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Orders</Text>
              <Text style={styles.menuSubtitle}>View all platform orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </Pressable>
        </View>

        {/* Vendor Approval Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vendor Approval</Text>
          <Text style={styles.sectionCount}>
            {pendingVendors.length} pending
          </Text>
        </View>

        {/* Vendor List */}
        <View style={styles.vendorList}>
          {pendingVendors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={64} 
                  color="#007AFF" 
                />
              </View>
              <Text style={styles.emptyText}>
                {'No Pending Vendors'}
              </Text>
              <Text style={styles.emptySubtext}>
                {'All vendor applications have been reviewed'}
              </Text>
            </View>
          ) : (
            pendingVendors.map((item) => (
              <View key={item.id}>
                {renderVendorCard({ item })}
              </View>
            ))
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  statDetail: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#007AFF',
  },
  menuGrid: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  vendorList: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  vendorCard: {
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
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  vendorTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
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
  vendorInfo: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  vendorActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1.5,
    gap: SPACING.xs,
  },
  approveButton: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error,
  },
  suspendButton: {
    backgroundColor: '#F59E0B10',
    borderColor: '#F59E0B',
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.background,
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
    textAlign: 'center',
  },
});
