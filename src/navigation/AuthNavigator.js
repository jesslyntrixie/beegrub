import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Screens
import { StartupScreen } from '../screens/auth/StartupScreen';
import { LoginChoiceScreen } from '../screens/auth/LoginChoiceScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterChoiceScreen } from '../screens/auth/RegisterChoiceScreen';
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
      <Stack.Screen name="LoginChoice" component={LoginChoiceScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
    </Stack.Navigator>
  );
};
