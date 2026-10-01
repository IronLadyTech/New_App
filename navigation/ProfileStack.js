import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LepProfileScreen from '../screens/lep/LepProfileScreen';
import {
  LepCertificateScreen,
  LepNudgeSettingsScreen,
  LepProgressScreen,
} from '../screens/lep/LepFlowScreens';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={LepProfileScreen} />
      <Stack.Screen name="LepProgress" component={LepProgressScreen} />
      <Stack.Screen name="NudgeSettings" component={LepNudgeSettingsScreen} />
      <Stack.Screen name="LepCertificate" component={LepCertificateScreen} />
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
