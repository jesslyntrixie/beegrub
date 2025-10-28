import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export const LoginChoiceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to BeeGrub</Text>
          <Text style={styles.subtitle}>Choose your account type</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.studentButton]}
            onPress={() => navigation.navigate('Login', { userType: 'student' })}
          >
            <Text style={styles.buttonText}>I'm a Student</Text>
            <Text style={styles.buttonSubtext}>Order food from campus canteens</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.vendorButton]}
            onPress={() => navigation.navigate('Login', { userType: 'vendor' })}
          >
            <Text style={styles.buttonText}>I'm a Vendor</Text>
            <Text style={styles.buttonSubtext}>Manage my canteen orders</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterChoice')}>
            <Text style={styles.linkText}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Fixed mobile padding instead of SPACING.xl (32px)
    paddingVertical: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24, // Much smaller than SPACING.xxl (48px)
  },
  title: {
    fontSize: 24, // Much smaller than FONTS.large (32px)
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8, // Smaller than SPACING.sm
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, // Smaller than FONTS.regular (16px)
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16, // Smaller than SPACING.lg (24px)
    marginBottom: 24, // Much smaller than SPACING.xxl (48px)
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: 16, // Much smaller than SPACING.xl (32px)
    paddingHorizontal: 20, // Smaller than SPACING.lg (24px)
    borderRadius: 8, // Smaller than BORDER_RADIUS.large (12px)
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  studentButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  vendorButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  buttonText: {
    fontSize: 16, // Smaller than FONTS.medium (18px)
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4, // Smaller than SPACING.xs
  },
  buttonSubtext: {
    fontSize: 12, // Smaller than FONTS.small (14px)
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 4, // Same as SPACING.xs but explicit
    marginTop: 8,
  },
  footerText: {
    fontSize: 12, // Smaller than FONTS.small (14px)
    color: COLORS.textSecondary,
  },
  linkText: {
    fontSize: 12, // Smaller than FONTS.small (14px)
    color: COLORS.info,
    fontWeight: 'bold',
  },
});