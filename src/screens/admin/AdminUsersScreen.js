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
  Modal,
  TextInput,
  Pressable,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const { data, error} = await apiService.admin.getUsers(
        filter === 'all' ? null : filter
      );

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleUserPress = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement delete functionality
            Alert.alert('Info', 'Delete functionality will be implemented with proper API');
          }
        }
      ]
    );
  };

  const handleSuspendUser = (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    Alert.alert(
      `${newStatus === 'suspended' ? 'Suspend' : 'Activate'} User`,
      `${newStatus === 'suspended' ? 'Suspend' : 'Activate'} ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'suspended' ? 'Suspend' : 'Activate',
          style: newStatus === 'suspended' ? 'destructive' : 'default',
          onPress: () => {
            // Implement suspend/activate functionality
            Alert.alert('Info', 'Suspend/Activate functionality will be implemented with proper API');
          }
        }
      ]
    );
  };

  const renderUserCard = ({ item }) => {
    const getRoleBadgeColor = (role) => {
      switch (role) {
        case 'admin': return '#EF4444';
        case 'vendor': return '#F59E0B';
        case 'student': return COLORS.success;
        default: return COLORS.textSecondary;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return COLORS.success;
        case 'suspended': return COLORS.error;
        case 'inactive': return COLORS.textSecondary;
        default: return COLORS.textSecondary;
      }
    };

    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userCardHeader}>
          <View style={styles.userIconContainer}>
            <Ionicons 
              name={item.role === 'vendor' ? 'storefront' : item.role === 'admin' ? 'shield-checkmark' : 'person'} 
              size={24} 
              color={getRoleBadgeColor(item.role)} 
            />
          </View>
          <View style={styles.userMainInfo}>
            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.role) }]}>
                <Text style={styles.roleBadgeText}>{item.role.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </View>

        <View style={styles.userCardFooter}>
          <View style={styles.footerItem}>
            <Ionicons 
              name={item.email_verified ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={item.email_verified ? COLORS.success : COLORS.error} 
            />
            <Text style={styles.footerText}>
              {item.email_verified ? 'Verified' : 'Not Verified'}
            </Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={16} color="#007AFF" />
            <Text style={styles.footerText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserDetailModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedUser.email}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>{selectedUser.role}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{selectedUser.status}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email Verified</Text>
                <Text style={styles.detailValue}>
                  {selectedUser.email_verified ? 'Yes' : 'No'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created At</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedUser.created_at).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.suspendButton]}
                onPress={() => {
                  setModalVisible(false);
                  handleSuspendUser(selectedUser);
                }}
              >
                <Ionicons 
                  name={selectedUser.status === 'active' ? 'ban' : 'checkmark-circle'} 
                  size={20} 
                  color={selectedUser.status === 'active' ? '#F59E0B' : COLORS.success} 
                />
                <Text style={[styles.modalButtonText, { color: selectedUser.status === 'active' ? '#F59E0B' : COLORS.success }]}>
                  {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => {
                  setModalVisible(false);
                  handleDeleteUser(selectedUser);
                }}
              >
                <Ionicons name="trash" size={20} color={COLORS.error} />
                <Text style={[styles.modalButtonText, { color: COLORS.error }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
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
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>{users.length} total users</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.xl }}
        >
          {[
            { key: 'all', label: 'All', icon: 'apps', color: '#007AFF' },
            { key: 'student', label: 'Students', icon: 'school', color: '#10B981' },
            { key: 'vendor', label: 'Vendors', icon: 'storefront', color: '#F59E0B' },
            { key: 'admin', label: 'Admins', icon: 'shield-checkmark', color: '#EF4444' }
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Ionicons 
                name={f.icon} 
                size={18} 
                color={filter === f.key ? COLORS.white : f.color} 
              />
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* User List */}
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={64} color="#007AFF" />
            </View>
            <Text style={styles.emptyText}>No Users Found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'No users in the system yet' 
                : `No ${filter}s found`}
            </Text>
          </View>
        }
      />

      {renderUserDetailModal()}
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
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  userCard: {
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
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.large,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  userMainInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  statusIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  userCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.sm,
  },
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.large * 2,
    borderTopRightRadius: BORDER_RADIUS.large * 2,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalBody: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1.5,
    gap: SPACING.xs,
  },
  suspendButton: {
    backgroundColor: '#F59E0B10',
    borderColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error,
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
