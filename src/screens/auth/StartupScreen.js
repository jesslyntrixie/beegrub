import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import * as Linking from 'expo-linking';

const { width, height } = Dimensions.get('window');

export const StartupScreen = ({ navigation }) => {
  React.useEffect(() => {
    let timer;

    const init = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        // If the app was opened via a password reset deep link,
        // we skip the auto-redirect to Login so that the
        // ResetPassword screen (navigated from App.js) stays visible.
        if (initialUrl && initialUrl.includes('reset-password')) {
          return;
        }
      } catch (e) {
      }

      timer = setTimeout(() => {
        navigation.replace('Login');
      }, 2000);
    };

    init();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo + Banner Container - This is your "one div" */}
      <View style={styles.logoAndBannerContainer}>
        {/* Logo Image */}
        <Image 
          source={require('../../../assets/clipped-icon-min.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        {/* Banner Image - Now closer to logo */}
        <Image 
          source={require('../../../assets/banner.png')} 
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Tagline - Separate from logo/banner group */}
      <Text style={styles.tagline}>
        "Fast bites, no lines, more time to shine."
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // NEW: Container for logo + banner
  logoAndBannerContainer: {
    alignItems: 'center',        // Center both images horizontally
    marginBottom: 40,            // Space between this group and tagline
  },
  logoImage: {
    width: 150,
    height: 150,
    // marginBottom: 10,            // REDUCED: Small gap between logo and banner
    // Removed: top: -30 (no longer needed)
  },
  bannerImage: {
    width: width,
    height: 120,
    // Removed: marginBottom: 40 (now handled by container)
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#363434',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});