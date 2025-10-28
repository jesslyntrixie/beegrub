import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SignupChooseRoleScreen = ({ navigation }) => {
  const handleStudentSignup = () => {
    // Navigate to student registration
    navigation.navigate('RegisterScreen', { role: 'student' });
  };

  const handleVendorSignup = () => {
    // Navigate to vendor registration
    navigation.navigate('RegisterScreen', { role: 'vendor' });
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>SignUp</Text>
        <Text style={styles.subtitle}>"I'm signing up as a…"</Text>
      </View>

      {/* Foodies Card */}
      <TouchableOpacity style={styles.foodiesCard} onPress={handleStudentSignup}>
        <Image 
          source={require('../../../assets/student-card.png')} // Using banner as placeholder
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* Card Content Overlay */}
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTopText}>Order & Grab</Text>
          <Text style={styles.cardRoleText}>Foodies</Text>
          <Text style={styles.cardDescription}>
            Pre-order lunch and{'\n'}skip the line.
          </Text>
          
          <View style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Canteen Partner Card */}
      <TouchableOpacity style={styles.canteenCard} onPress={handleVendorSignup}>
        <Image 
          source={require('../../../assets/vendor-card.png')} // Using icon as placeholder
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* Card Content Overlay */}
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTopText}>Serve & Grow</Text>
          <Text style={styles.cardRoleText}>Canteen Partner</Text>
          <Text style={styles.cardDescription}>
            Manage orders and{'\n'}reach more students.
          </Text>
          
          <View style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 40, // Much smaller top padding
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center', // Center everything vertically
  },
  
  // Title Section
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24, // Much smaller margin
    paddingHorizontal: 20, // Less horizontal padding
  },
  title: {
    fontSize: 24, // Much smaller than 48px
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8, // Smaller margin
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14, // Much smaller than 24px
    fontWeight: '400',
    color: '#363434',
    textAlign: 'center',
    fontFamily: 'System',
  },

  // Card Styles
  foodiesCard: {
    width: Math.min(280, width * 0.85), // Responsive width, smaller than 320px
    height: 200, // Much smaller height than 315px
    alignSelf: 'center',
    marginBottom: 16, // Smaller margin than 30px
    borderRadius: 12, // Slightly smaller radius
    overflow: 'hidden',
    // Use boxShadow for web compatibility
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  
  canteenCard: {
    width: Math.min(280, width * 0.85), // Responsive width, smaller than 320px
    height: 200, // Much smaller height than 315px
    alignSelf: 'center',
    borderRadius: 12, // Slightly smaller radius
    overflow: 'hidden',
    // Use boxShadow for web compatibility
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },

  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  // Card Overlay Content
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker for better text contrast
    justifyContent: 'space-between',
    padding: 16, // Smaller padding
  },

  cardTopText: {
    color: '#ffffff',
    fontSize: 14, // Smaller than 18px
    fontWeight: '400',
    fontFamily: 'System',
  },

  cardRoleText: {
    color: '#ffffff',
    fontSize: 16, // Smaller than 18px
    fontWeight: '600', // Slightly bolder for emphasis
    textAlign: 'center',
    position: 'absolute',
    top: 70, // Adjusted for smaller card height
    left: 0,
    right: 0,
    fontFamily: 'System',
  },

  cardDescription: {
    color: '#ffffff',
    fontSize: 12, // Smaller than 14px
    fontWeight: '400',
    textAlign: 'center',
    position: 'absolute',
    top: 95, // Adjusted for smaller card height
    left: 16, // Adjusted for smaller padding
    right: 16,
    fontFamily: 'System',
  },

  signupButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 20, // Smaller radius
    paddingVertical: 6, // Smaller padding
    paddingHorizontal: 24, // Smaller horizontal padding
    alignSelf: 'center',
    position: 'absolute',
    bottom: 16, // Adjusted for smaller card
    left: 0,
    right: 0,
    marginHorizontal: 60, // Less margin
  },

  signupButtonText: {
    color: '#ffffff',
    fontSize: 12, // Smaller than 15px
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'System',
  },
});
