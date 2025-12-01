import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Student Screens
import { StudentHomeScreen } from '../screens/student/HomeScreen';
import { MenuScreen } from '../screens/student/MenuScreen';
import { CheckoutScreen } from '../screens/student/CheckoutScreen';
import { OrdersScreen } from '../screens/student/OrdersScreen';
import { StudentProfileScreen } from '../screens/student/ProfileScreen';
import PaymentMethodScreen from '../screens/student/PaymentMethodScreen';
import QRISPaymentDemoScreen from '../screens/student/QRISPaymentDemoScreen';
import OrderConfirmationScreen from '../screens/student/OrderConfirmationScreen';

const Stack = createStackNavigator();

export const StudentNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="StudentHome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="QRISPaymentDemo" component={QRISPaymentDemoScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Profile" component={StudentProfileScreen} />
    </Stack.Navigator>
  );
};
