import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { authService, userService } from '../../services/supabase';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) {
      return;
    }
    
    setLoading(true);
    console.log('🔐 Attempting login with:', email);
    
    try {
      console.log('📞 Calling authService.signIn()...');
      const { data, error: signInError } = await authService.signIn(email, password);
      
      console.log('✅ signIn response:', { data, error: signInError });
      
      if (signInError) {
        console.error('❌ Login error:', signInError);
        
        // Show user-friendly error messages
        if (signInError.message && signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('⚠️ Please check your email and click the confirmation link first.');
        } else if (signInError.message && signInError.message.toLowerCase().includes('invalid')) {
          setError('❌ Invalid email or password. Please try again.');
        } else {
          setError(signInError.message || '❌ Login failed. Please try again.');
        }
        
        setLoading(false);
        return;
      }
      
      if (data?.user) {
        console.log('✅ Login successful! User:', data.user.email);
        
        // Check user status and vendor approval
        console.log('🔍 Checking user status and vendor approval...');
        const { data: userData, error: userError } = await userService.getUserData(data.user.id);
        
        console.log('📊 getUserData result:', JSON.stringify(userData, null, 2));
        
        if (userError) {
          console.error('❌ Error fetching user data:', userError);
          setError('❌ Error checking account status. Please try again.');
          await authService.signOut(); // Sign out if we can't verify status
          setLoading(false);
          return;
        }
        
        if (!userData) {
          console.error('❌ No user data found');
          setError('❌ Account not found. Please contact support.');
          await authService.signOut();
          setLoading(false);
          return;
        }
        
        // Check if user is suspended
        if (userData.status === 'suspended') {
          console.log('🚫 User account is suspended');
          setError('🚫 Your account has been suspended. Please contact support.');
          await authService.signOut();
          setLoading(false);
          return;
        }
        
        // Check if user is inactive
        if (userData.status === 'inactive') {
          console.log('🚫 User account is inactive');
          setError('🚫 Your account is inactive. Please contact support.');
          await authService.signOut();
          setLoading(false);
          return;
        }
        
        // For vendors, check approval status
        if (userData.role === 'vendor') {
          console.log('🏪 Vendor login detected, checking vendors array:', userData.vendors);
          const vendorData = Array.isArray(userData.vendors) && userData.vendors.length > 0 
            ? userData.vendors[0] 
            : userData.vendors;
          
          console.log('🏪 Vendor data extracted:', vendorData);
          
          if (!vendorData) {
            console.error('❌ Vendor data not found for user:', userData.id);
            console.error('❌ Full userData:', JSON.stringify(userData, null, 2));
            setError('❌ Vendor account not properly set up. Please contact support.');
            await authService.signOut();
            setLoading(false);
            return;
          }
          
          if (vendorData.status === 'suspended') {
            console.log('🚫 Vendor account is suspended');
            setError('🚫 Your vendor account has been suspended. Please contact support.');
            await authService.signOut();
            setLoading(false);
            return;
          }
          
          if (vendorData.status === 'pending') {
            console.log('⏳ Vendor account pending approval');
            setError('⏳ Your vendor account is pending approval. Please wait for admin verification.');
            await authService.signOut();
            setLoading(false);
            return;
          }
          
          if (vendorData.status !== 'approved') {
            console.log('🚫 Vendor account not approved');
            setError('🚫 Your vendor account is not approved. Please contact support.');
            await authService.signOut();
            setLoading(false);
            return;
          }
          
          console.log('✅ Vendor account approved, proceeding...');
        }
        
        console.log('✅ All checks passed, login successful!');
        // Login successful - AppNavigator will handle routing based on user role
        // No alert needed, the navigation will happen automatically
      } else {
        console.warn('⚠️ No user data returned');
        setError('❌ Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('🔴 Catch error:', err);
      setError(err.message || '❌ An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignupChooseRole');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Text */}
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to your account</Text>
        <View style={styles.fieldsContainer}>
          {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, emailError && styles.textInputError]}
            placeholder="Email"
            placeholderTextColor="#636363"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(''); // Clear error when user types
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, passwordError && styles.textInputError]}
            placeholder="Password"
            placeholderTextColor="#636363"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(''); // Clear error when user types
            }}
            secureTextEntry
            editable={!loading}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        </View>
        
        {/* General Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        ) : null}

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity onPress={handleSignUp} disabled={loading} style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account yet? Register</Text>
        </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#363434',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 24, // Much smaller margin
  },

  // Input Styles
  inputContainer: {
    marginBottom: 12, // Much smaller spacing between inputs
    // No need for alignItems since parent handles it
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    height: 48, // Much smaller height
    width: Math.min(280, width * 0.8), // Smaller width
    paddingHorizontal: 16, // Less padding
    fontSize: 14, // Smaller font
    color: '#636363',
    fontFamily: 'System',
    // Reduced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Forgot Password
  forgotPasswordContainer: {
    width: Math.min(280, width * 0.8), // Match smaller input width
    alignItems: 'flex-end',
    marginTop: 4, // Smaller margin
    // No marginBottom needed since fieldsContainer handles it
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#363434',
    fontFamily: 'System',
    textAlign: 'center'
  },

  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 48, // Smaller height
    width: 200, // Smaller width
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 16, // Much smaller margin
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16, // Smaller font
    fontWeight: '700',
    fontFamily: 'System',
  },

  // Fields container - groups inputs and forgot password
  fieldsContainer: {
    width: Math.min(280, width * 0.8), // Match smaller input width
    alignItems: 'center',
    marginBottom: 16, // Much smaller margin
  },

  // Sign Up Link
  signUpContainer: {
    alignSelf: 'center',
  },
  signUpText: {
    fontSize: 12, // Smaller font
    fontWeight: '400',
    color: '#363434',
    fontFamily: 'System',
    textAlign: 'center',
  },

  // Error Styles
  textInputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
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
    marginBottom: 16,
    width: Math.min(280, width * 0.8),
  },
  errorMessage: {
    color: '#cc0000',
    fontSize: 14,
    fontFamily: 'System',
    lineHeight: 20,
  },
});