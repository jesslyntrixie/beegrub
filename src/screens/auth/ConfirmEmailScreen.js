import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function ConfirmEmailScreen({ navigation, route }) {
  const { email } = route.params || {};

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon/Illustration */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Check Your Email</Text>

        {/* Message */}
        <Text style={styles.message}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  instructions: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
