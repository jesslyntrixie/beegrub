import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function ConfirmEmailScreen({ navigation, route }) {
  const { email } = route.params || {};

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        {/* Icon/Illustration */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a confirmation email to
        </Text>
        <Text style={styles.email}>{email}</Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Please check your inbox and click the confirmation link to activate your account.
          </Text>
          <Text style={styles.instructions}>
            After confirming your email, you can log in to BeeGrub.
          </Text>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>💡 Didn't receive the email?</Text>
          <Text style={styles.note}>
            • Check your spam/junk folder{'\n'}
            • Make sure you entered the correct email{'\n'}
            • Wait a few minutes and check again
          </Text>
        </View>

        {/* Go to Login Button */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleGoToLogin}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  instructions: {
    fontSize: FONTS.small,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#FFF9E6',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  noteTitle: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  note: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    width: '100%',
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.regularfff',
    fontSize: 16,
    fontWeight: '700',
  },
});
