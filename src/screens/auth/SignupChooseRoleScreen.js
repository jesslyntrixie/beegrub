import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SignupChooseRoleScreen = ({ navigation }) => {
  const handleStudentSignup = () => {
    navigation.navigate('Register', { userType: 'student' });
  };

  const handleVendorSignup = () => {
    navigation.navigate('Register', { userType: 'vendor' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Choose your account type to get started</Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Student Card */}
          <TouchableOpacity 
            style={[styles.roleCard, styles.studentCard]}
            onPress={handleStudentSignup}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={48} color="#007AFF" />
            </View>
            <Text style={styles.roleTitle}>Student</Text>
            <Text style={styles.roleDescription}>
              Order food from campus canteens and skip the line
            </Text>
            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Continue as Student</Text>
            </View>
          </TouchableOpacity>

          {/* Vendor Card */}
          <TouchableOpacity 
            style={[styles.roleCard, styles.vendorCard]}
            onPress={handleVendorSignup}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="storefront-outline" size={48} color="#34C759" />
            </View>
            <Text style={styles.roleTitle}>Canteen Partner</Text>
            <Text style={styles.roleDescription}>
              Manage your canteen and reach more students
            </Text>
            <View style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Continue as Vendor</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#363434',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Cards Container
  cardsContainer: {
    gap: 20,
    marginBottom: 32,
  },

  // Role Card
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  studentCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  vendorCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 13,
    color: '#636363',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#363434',
  },
  linkText: {
    fontSize: 12,
    color: '#363434',
    fontWeight: '400',
  },
});
