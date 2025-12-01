import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Screens
import { StartupScreen } from '../screens/auth/StartupScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupChooseRoleScreen } from '../screens/auth/SignupChooseRoleScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import ConfirmEmailScreen from '../screens/auth/ConfirmEmailScreen';

const Stack = createStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Startup"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Startup" component={StartupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupChooseRole" component={SignupChooseRoleScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
    </Stack.Navigator>
  );
};
