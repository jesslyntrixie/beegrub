import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  RefreshControl,
  Alert
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';

export const StudentHomeScreen = ({ navigation }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
    loadVendors();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const { data, error } = await apiService.vendors.getAll();
      if (error) {
        Alert.alert('Error', 'Failed to load canteens');
        return;
      }
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVendors();
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
              console.log('🔴 Starting logout...');
              const { error } = await authService.signOut();
              
              if (error) {
                console.error('❌ Logout error:', error);
                Alert.alert('Error', 'Failed to logout: ' + error.message);
                return;
              }
              
              console.log('✅ Logout successful! AppNavigator will handle navigation automatically.');
              // No need to manually navigate - AppNavigator's auth state listener
              // will detect the sign out and automatically switch to AuthNavigator
            } catch (err) {
              console.error('🔴 Logout catch error:', err);
              Alert.alert('Error', 'An error occurred during logout');
            }
          }
        }
      ]
    );
  };

  const renderVendorCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.vendorCard}
      onPress={() => navigation.navigate('Menu', { vendor: item })}
    >
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.business_name}</Text>
        <Text style={styles.vendorLocation}>{item.location}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.statusText}>Open</Text>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Canteens Available</Text>
      <Text style={styles.emptyStateText}>
        Check back later for available canteen partners
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || 'Student'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Orders')} 
            style={styles.ordersButton}
          >
            <Text style={styles.ordersText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Canteens</Text>
        
        <FlatList
          data={vendors}
          renderItem={renderVendorCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={vendors.length === 0 ? styles.emptyContainer : null}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: SPACING.lg,
  },
  greeting: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
    flexShrink: 0,
  },
  ordersButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.medium,
  },
  ordersText: {
    fontSize: FONTS.small,
    color: COLORS.white,
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
  },
  logoutText: {
    fontSize: FONTS.small,
    color: COLORS.error,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  vendorCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vendorLocation: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.small,
    color: COLORS.success,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: SPACING.md,
  },
  arrow: {
    fontSize: FONTS.medium,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});