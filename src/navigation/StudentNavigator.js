import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Student Screens
import { StudentHomeScreen } from '../screens/student/HomeScreen';
import { MenuScreen } from '../screens/student/MenuScreen';
import { CheckoutScreen } from '../screens/student/CheckoutScreen';
import { OrdersScreen } from '../screens/student/OrdersScreen';

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
      <Stack.Screen name="Orders" component={OrdersScreen} />
    </Stack.Navigator>
  );
};
