import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, WhiteCard } from '../guest/GuestBits';
import { Page } from '../lep/LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { LMS_HOST } from '../../constants/lmsHost';

function Section({ title, body }) {
  return (
    <WhiteCard style={{ marginTop: 12, borderRadius: 18, padding: 16 }}>
      <ILText role="label" color={G.ink}>
        {title}
      </ILText>
      <ILText role="body" color={G.body} style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
        {body}
      </ILText>
    </WhiteCard>
  );
}

/** App Store–style transparency: what we collect, alerts, account deletion, legal links. */
export default function PrivacyCenterScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestBackBar title="Privacy & data" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 16),
        }}
      >
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
          Plain-language summary for the Iron Lady app. Full legal text lives on our website.
        </ILText>

        <Section
          title="Data we use to run your program"
          body={
            'Account: mobile number, name, email when provided, profile photo if you add one. Program: batch, tasks, submissions, progress, and certificates. We use this to deliver LEP and related programs — not for unrelated advertising.'
          }
        />
        <Section
          title="Notifications & reminders"
          body={
            'Push and in-app alerts for live sessions, due tasks, cohort updates, and IL Guide nudges. You can turn off push in your phone settings; some program messages may still appear in the in-app inbox.'
          }
        />
        <Section
          title="Delete your account"
          body={
            'Profile → Delete account emails support to remove your account. This cannot be undone. Export anything you need (certificates, receipts) before you request deletion.'
          }
        />
        <Section
          title="Full privacy policy"
          body={`Hosted at ${LMS_HOST}/privacy — opens in your browser when we link it from enrollment.`}
        />
        <Section
          title="Terms of use"
          body={`Hosted at ${LMS_HOST}/terms — governs use of the app and program materials.`}
        />

        <ILText role="eyebrow" color={G.meta} style={[af, { marginTop: 20, fontSize: 10 }]}>
          QUESTIONS
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12, lineHeight: 18 }}>
          Email admin@iamironlady.com for privacy or data requests.
        </ILText>
      </ScrollView>
    </Page>
  );
}
