import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorEarningsScreen from '../screens/vendor/VendorEarningsScreen';
import VendorMenuManagementScreen from '../screens/vendor/VendorMenuManagementScreen';
import VendorOrderHistoryScreen from '../screens/vendor/VendorOrderHistoryScreen';

const Stack = createStackNavigator();

export const VendorNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} />
      <Stack.Screen name="VendorOrders" component={VendorOrdersScreen} />
      <Stack.Screen name="VendorEarnings" component={VendorEarningsScreen} />
      <Stack.Screen name="VendorMenu" component={VendorMenuManagementScreen} />
      <Stack.Screen name="VendorOrderHistory" component={VendorOrderHistoryScreen} />
    </Stack.Navigator>
  );
};
