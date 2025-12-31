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
import { Ionicons } from '@expo/vector-icons';
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
          <Text style={styles.greeting}>Hi, {user?.user_metadata?.fullName?.split(' ')[0] || 'Student'}!</Text>
          <Text style={styles.subtitle}>What would you like to order today?</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')} 
            style={styles.iconButton}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Orders')} 
            style={styles.iconButton}
          >
            <Ionicons name="receipt-outline" size={20} color={COLORS.text} />
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  greeting: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  vendorCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vendorInfo: {
    flex: 1,
    flexShrink: 1,
  },
  vendorName: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    flexShrink: 1,
  },
  vendorLocation: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.extraSmall,
    color: COLORS.success,
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: SPACING.sm,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.textMuted,
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
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
});