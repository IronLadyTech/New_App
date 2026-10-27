import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ILText from '../../components/il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';
import { GuestBackBar } from '../guest/GuestBits';
import { Page } from './LepBits';
import { useAuth } from '../../context/AuthContext';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { resolveLepDay1Iso } from '../../utils/lepEnrolledCohortPhase';
import { useLepFiveRitualsTracker } from '../../hooks/useLepFiveRitualsTracker';
import LepRitualsTrackerPanel from '../../components/lep/LepRitualsTrackerPanel';

export default function LepRitualsDashboardScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const day1Iso = resolveLepDay1Iso(profile, cmsBatch);
  const { unlocked } = useLepRitualsUnlocked({ cmsBatch });
  const { today, model, toggleRitual, unmarkRitual } = useLepFiveRitualsTracker(day1Iso);

  if (!unlocked) {
    return (
      <Page>
        <View style={{ paddingTop: Math.max(insets.top, 8) }}>
          <GuestBackBar title="5 Daily Rituals" onBack={() => navigation.goBack()} />
        </View>
        <ILText role="body" color={G.meta} align="center" style={{ marginTop: 40, paddingHorizontal: 24 }}>
          Your tracker opens from Monday after Day 1 and Day 2 (Week 1).
        </ILText>
      </Page>
    );
  }

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title="5 Daily Rituals" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
      >
        <ILText role="title" color={G.ink} style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 26 }}>
          Rituals tracker
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, lineHeight: 20 }}>
          Tick each ritual you did today. Marks roll up to your weekly consistency on Home.
        </ILText>
        <LepRitualsTrackerPanel
          today={today}
          model={model}
          toggleRitual={toggleRitual}
          unmarkRitual={unmarkRitual}
          showVideoLink
        />
      </ScrollView>
    </Page>
  );
}
