import React from 'react';
import { Alert, Linking, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { PROFILE_FAQ, supportEmailFor } from '../../constants/profileSupport';
import { useAuth } from '../../context/AuthContext';
import { GuestBackBar, WhiteCard } from '../guest/GuestBits';
import { Page, RedCta } from '../lep/LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import Pressable from '../../components/il/Press';

async function openSupportEmail(email) {
  const url = `mailto:${email}?subject=${encodeURIComponent('Iron Lady app help')}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Email us', `Write to ${email} from your mail app.`);
  }
}

export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const supportEmail = supportEmailFor(profile);

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestBackBar title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 16),
        }}
      >
        <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 18 }}>
          <MaterialIcons name="help-outline" size={28} color={G.cta} />
          <ILText role="title" color={G.ink} style={{ marginTop: 12, fontSize: 20, lineHeight: 26 }}>
            Frequently asked
          </ILText>
          {PROFILE_FAQ.map((item) => (
            <View key={item.q} style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: G.line }}>
              <ILText role="label" color={G.ink} style={{ fontSize: 14, lineHeight: 20 }}>
                {item.q}
              </ILText>
              <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}>
                {item.a}
              </ILText>
            </View>
          ))}
        </WhiteCard>

        <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 18 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            STILL STUCK?
          </ILText>
          <ILText role="body" color={G.body} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
            Raise a ticket. Your CEM and the Iron Lady team reply in the app, and you can follow it under My tickets.
          </ILText>
          <View style={{ marginTop: 14 }}>
            <RedCta label="Raise a ticket" icon="support-agent" onPress={() => navigation.navigate('SupportTickets', { compose: true })} />
          </View>
          <Pressable
            onPress={() => navigation.navigate('SupportTickets')}
            accessibilityRole="button"
            style={{ marginTop: 12, alignSelf: 'center' }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 14 }}>
              My tickets
            </ILText>
          </Pressable>
        </WhiteCard>

        <Pressable onPress={() => openSupportEmail(supportEmail)} accessibilityRole="button" style={{ marginTop: 16, alignSelf: 'center' }}>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 13 }}>
            {`Or email ${supportEmail}`}
          </ILText>
        </Pressable>
      </ScrollView>
    </Page>
  );
}
