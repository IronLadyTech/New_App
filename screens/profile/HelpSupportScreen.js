import React from 'react';
import { Alert, Linking, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { IRON_LADY_SUPPORT_EMAIL, PROFILE_FAQ } from '../../constants/profileSupport';
import { GuestBackBar, WhiteCard } from '../guest/GuestBits';
import { Page, RedCta } from '../lep/LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';

async function openSupportEmail() {
  const url = `mailto:${IRON_LADY_SUPPORT_EMAIL}?subject=${encodeURIComponent('Iron Lady app help')}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Email us', `Write to ${IRON_LADY_SUPPORT_EMAIL} from your mail app.`);
  }
}

export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
            Email the Iron Lady team. Include the mobile number you use to sign in and a short description of the
            issue.
          </ILText>
          <ILText role="label" color={G.ink} style={{ marginTop: 12 }}>
            {IRON_LADY_SUPPORT_EMAIL}
          </ILText>
        </WhiteCard>

        <View style={{ marginTop: 16 }}>
          <RedCta label="Email us" icon="email" onPress={openSupportEmail} />
        </View>
      </ScrollView>
    </Page>
  );
}
