import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { authService } from '../../services/supabase';
import { apiService } from '../../services/api';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

export const RegisterScreen = ({ route, navigation }) => {
  const { userType } = route.params;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    // Student specific
    studentId: '',
    // Vendor specific
    canteenName: '',
    canteenLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    const { email, password, confirmPassword, fullName, phone } = formData;
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (userType === 'student' && !email.includes('@binus.ac.id')) {
      newErrors.email = 'Please use your BINUS email (@binus.ac.id)';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = userType === 'vendor' ? 'Owner name is required' : 'Full name is required';
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Student specific validation
    if (userType === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    // Vendor specific validation
    if (userType === 'vendor') {
      if (!formData.canteenName.trim()) {
        newErrors.canteenName = 'Canteen name is required';
      }
      if (!formData.canteenLocation.trim()) {
        newErrors.canteenLocation = 'Canteen location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Prepare user metadata for signup
      const userData = {
        role: userType,
        fullName: formData.fullName,
        phone: formData.phone,
      };

      // Add role-specific data
      if (userType === 'student') {
        userData.studentId = formData.studentId;
      } else {
        userData.canteenName = formData.canteenName;
        userData.canteenLocation = formData.canteenLocation;
      }

      const { data, error } = await authService.signUp(
        formData.email, 
        formData.password, 
        userData
      );
      
      if (error) {
        // Show user-friendly error
        if (error.message && error.message.toLowerCase().includes('already registered')) {
          setErrors({ email: 'This email is already registered' });
        } else {
          setErrors({ general: error.message || 'Registration failed. Please try again.' });
        }
        
        setLoading(false);
        return;
      }

      if (data.user) {
        // Navigate to confirmation screen
        setLoading(false);
        navigation.navigate('ConfirmEmail', { 
          email: formData.email 
        });
        return;
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
        setLoading(false);
      }
    } catch (err) {
      setErrors({ general: err.message || 'An unexpected error occurred' });
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Let's Get Started</Text>
            <Text style={styles.subtitle}>Create an account to continue</Text>
          </View>

          {/* Form Section - Following Figma layout order */}
          <View style={styles.form}>
            {/* General Error Message */}
            {errors.general ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.email && styles.textInputError]}
                placeholder={userType === 'student' ? 'BINUS Email' : 'Email'}
                placeholderTextColor="#636363"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Full Name / Owner Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.fullName && styles.textInputError]}
                placeholder={userType === 'vendor' ? 'Owner Name' : 'Full Name'}
                placeholderTextColor="#636363"
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                editable={!loading}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.phone && styles.textInputError]}
                placeholder="Phone Number"
                placeholderTextColor="#636363"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.password && styles.textInputError]}
                placeholder="Password"
                placeholderTextColor="#636363"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.confirmPassword && styles.textInputError]}
                placeholder="Confirm Password"
                placeholderTextColor="#636363"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Additional fields based on user type */}
            {userType === 'student' && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, errors.studentId && styles.textInputError]}
                  placeholder="Student ID"
                  placeholderTextColor="#636363"
                  value={formData.studentId}
                  onChangeText={(value) => updateFormData('studentId', value)}
                  editable={!loading}
                />
                {errors.studentId ? <Text style={styles.errorText}>{errors.studentId}</Text> : null}
              </View>
            )}

            {userType === 'vendor' && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, errors.canteenName && styles.textInputError]}
                    placeholder="Canteen Name"
                    placeholderTextColor="#636363"
                    value={formData.canteenName}
                    onChangeText={(value) => updateFormData('canteenName', value)}
                    editable={!loading}
                  />
                  {errors.canteenName ? <Text style={styles.errorText}>{errors.canteenName}</Text> : null}
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, errors.canteenLocation && styles.textInputError]}
                    placeholder="Canteen Location"
                    placeholderTextColor="#636363"
                    value={formData.canteenLocation}
                    onChangeText={(value) => updateFormData('canteenLocation', value)}
                    editable={!loading}
                  />
                  {errors.canteenLocation ? <Text style={styles.errorText}>{errors.canteenLocation}</Text> : null}
                </View>
              </>
            )}

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating...' : 'Register'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Login link */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login', { userType })}
          >
            <Text style={styles.loginLinkText}>Already have an account? Login Here</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.xl,
  },
  
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.extraLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.small,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  form: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.medium,
    height: 50,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.regular,
    color: COLORS.text,
  },

  registerButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.medium,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    fontWeight: '700',
  },

  loginLink: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  loginLinkText: {
    fontSize: FONTS.small,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },

  textInputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.extraSmall,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    color: COLORS.error,
    fontSize: FONTS.small,
    lineHeight: 20,
  },
});