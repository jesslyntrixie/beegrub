import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export const RegisterChoiceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join BeeGrub</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.studentButton]}
            onPress={() => navigation.navigate('Register', { userType: 'student' })}
          >
            <Text style={styles.buttonText}>Register as Student</Text>
            <Text style={styles.buttonSubtext}>
              Use your BINUS email to create a student account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.vendorButton]}
            onPress={() => navigation.navigate('Register', { userType: 'vendor' })}
          >
            <Text style={styles.buttonText}>Register as Vendor</Text>
            <Text style={styles.buttonSubtext}>
              Create a canteen partner account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginChoice')}>
            <Text style={styles.linkText}>Sign in here</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
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
  studentButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  vendorButton: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  buttonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  buttonSubtext: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  linkText: {
    fontSize: FONTS.small,
    color: COLORS.info,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
});