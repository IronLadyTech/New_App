import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import FirstLoginWelcomeScreen from '../screens/auth/FirstLoginWelcomeScreen';
import ChooseBatchDateScreen from '../screens/auth/ChooseBatchDateScreen';
import SeatHeldScreen from '../screens/auth/SeatHeldScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { authEntry } = useAuth();
  return (
    <Stack.Navigator
      initialRouteName={authEntry || 'PhoneLogin'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="FirstLoginWelcome" component={FirstLoginWelcomeScreen} />
      <Stack.Screen name="ChooseBatchDate" component={ChooseBatchDateScreen} />
      <Stack.Screen name="SeatHeld" component={SeatHeldScreen} />
      <Stack.Screen
        name="JourneyPicker"
        getComponent={() => require('../screens/auth/JourneyPickerScreen').default}
      />
      <Stack.Screen
        name="GuestStart"
        getComponent={() => require('../screens/auth/GuestStartScreen').default}
      />
      <Stack.Screen
        name="Login"
        getComponent={() => require('../screens/auth/LoginScreen').default}
      />
      <Stack.Screen
        name="Signup"
        getComponent={() => require('../screens/auth/SignupScreen').default}
      />
      {__DEV__ ? (
        <Stack.Screen
          name="ScreenLab"
          getComponent={() => require('../screens/dev/ScreenLab').default}
        />
      ) : null}
    </Stack.Navigator>
  );
}
