import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ProfileHome"
        getComponent={() => require('../screens/profile/ProfileScreen').default}
      />
      <Stack.Screen
        name="Settings"
        getComponent={() => require('../screens/profile/SettingsScreen').default}
      />
      <Stack.Screen
        name="Certificates"
        getComponent={() => require('../screens/profile/CertificatesScreen').default}
      />
      <Stack.Screen
        name="PaymentEnrollment"
        getComponent={() => require('../screens/payment/PaymentEnrollmentScreen').default}
      />
      <Stack.Screen
        name="Orders"
        getComponent={() => require('../screens/payment/OrdersScreen').default}
      />
      <Stack.Screen
        name="OrderReceipt"
        getComponent={() => require('../screens/payment/OrderReceiptScreen').default}
      />
    </Stack.Navigator>
  );
}
