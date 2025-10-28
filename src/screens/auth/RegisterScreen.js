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
  ScrollView,
  Dimensions
} from 'react-native';
import { authService } from '../../services/supabase';
import { apiService } from '../../services/api';

const { width, height } = Dimensions.get('window');

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
      newErrors.fullName = 'Full name is required';
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
    console.log('📝 Starting registration with:', formData.email, userType);
    
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

      console.log('📞 Calling authService.signUp() with metadata:', userData);
      const { data, error } = await authService.signUp(
        formData.email, 
        formData.password, 
        userData
      );
      
      console.log('✅ signUp response:', { data, error });
      
      if (error) {
        console.error('❌ Signup error:', error);
        
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
        console.log('👤 Auth user created:', data.user.id);
        console.log('📧 Confirmation email sent to:', formData.email);
        
        // Navigate to confirmation screen
        setLoading(false);
        navigation.navigate('ConfirmEmail', { 
          email: formData.email 
        });
        return;
      } else {
        console.warn('⚠️ No user data returned from signup');
        setErrors({ general: 'Registration failed. Please try again.' });
        setLoading(false);
      }
    } catch (err) {
      console.error('🔴 Registration catch error:', err);
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
          {/* Header Section - Following Figma design */}
          <View style={styles.header}>
            <Text style={styles.title}>Let's Get Started</Text>
            <Text style={styles.subtitle}>Create an account to access our features</Text>
          </View>

          {/* Form Section - Following Figma layout order */}
          <View style={styles.form}>
            {/* General Error Message */}
            {errors.general ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{errors.general}</Text>
              </View>
            ) : null}

            {/* BINUS Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.email && styles.textInputError]}
                placeholder="BINUS Email"
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

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, errors.fullName && styles.textInputError]}
                placeholder="Full Name"
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
    // justifyContent: 'center',
    backgroundColor: '#ffffff', // White background as per Figma
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center', // This centers all content vertically
    minHeight: height - 100, // Ensure full height for centering
  },
  
  // Header Section - Following Figma design
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28, // Mobile-friendly size (was 42px in Figma)
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14, // Mobile-friendly size (was 18px in Figma) 
    fontWeight: '400',
    color: '#363434',
    textAlign: 'center',
    fontFamily: 'System',
  },

  // Form Section
  form: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16, // Spacing between inputs
    width: '100%',
    maxWidth: Math.min(330, width * 0.85), // Responsive width
    alignItems: 'center',
  },
  
  // Text Input Styling - Following Figma design
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.5)', // #00000080 from Figma
    borderRadius: 8,
    height: 50, // Mobile-friendly height (was 67px in Figma)
    width: '100%',
    paddingHorizontal: 16,
    fontSize: 14, // Mobile-friendly size (was 18px in Figma)
    color: '#636363',
    fontFamily: 'System',
    // Shadow styling from Figma
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // Register Button - Following Figma design
  registerButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    height: 48, // Mobile-friendly height (was 60px in Figma)
    width: Math.min(200, width * 0.5), // Responsive width (was 234px in Figma)
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16, // Mobile-friendly size (was 24px in Figma)
    fontWeight: '700',
    fontFamily: 'System',
  },

  // Login Link - Following Figma position
  loginLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 12, // Mobile-friendly size (was 14px in Figma)
    fontWeight: '400',
    color: '#363434',
    textAlign: 'center',
    fontFamily: 'System',
  },

  // Error Styles
  textInputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'System',
  },
  errorContainer: {
    backgroundColor: '#fff0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  errorMessage: {
    color: '#cc0000',
    fontSize: 13,
    fontFamily: 'System',
    lineHeight: 18,
  },
});