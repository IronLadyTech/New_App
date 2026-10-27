import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { GuestBackBar } from '../guest/GuestBits';
import { Page, RedCta } from './LepBits';
import { useAuth } from '../../context/AuthContext';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useCmsSessionRecordings } from '../../hooks/useCmsLearnerItems';
import { lepAlumniBatchShort } from '../../utils/lepAlumniUi';
import AlumniInnovationComingSoon from '../../components/lep/AlumniInnovationComingSoon';
import PracticeVideo from '../../components/program/PracticeVideo';
import { useLepNav } from './useLepNav';

function AlumniShell({ title, sub, children }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title={title} sub={sub} onBack={() => navigation.goBack()} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 16),
        }}
      >
        {children}
      </ScrollView>
    </Page>
  );
}

/** Batch graduation film (S8) or innovative coming-soon. */
export function LepAlumniGraduationFilmScreen() {
  const { profile } = useAuth();
  const { batch: cmsBatch } = useLearnerCmsBatch('lep');
  const recordings = useCmsSessionRecordings('lep', cmsBatch);
  const grad = recordings.S8;
  const batchShort = lepAlumniBatchShort(profile);
  const title = grad?.title || `${batchShort} graduation day`;

  const body = useMemo(() => {
    if (grad?.url) {
      return 'Your cohort’s graduation ceremony — the moment you crossed the finish line together.';
    }
    return 'We’re stitching your batch’s graduation film from ceremony night. When CX publishes the S8 recording for your cohort, it will play here automatically.';
  }, [grad?.url]);

  return (
    <AlumniShell title="Celebrations" sub={grad?.url ? 'Graduation film' : 'Graduation film · preparing'}>
      {grad?.url ? (
        <View style={{ marginTop: 8 }}>
          <PracticeVideo uri={grad.url} height={220} trackKey={`grad-${cmsBatch?.id || 'batch'}`} />
          <ILText role="title" color={G.ink} style={{ marginTop: 16, fontSize: 20 }}>
            {title}
          </ILText>
          <ILText role="body" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
            {body}
          </ILText>
        </View>
      ) : (
        <AlumniInnovationComingSoon
          icon="movie-filter"
          eyebrow="Celebrations"
          title="Graduation film coming soon"
          batchLabel={`${batchShort} · certification night`}
          body={body}
          footnote="Same recording your cohort lead adds under Sessions & recordings (Graduation / S8). You’ll get a ping on Engage when it’s live."
        />
      )}
    </AlumniShell>
  );
}

/** Alumni circle → community space (not live yet). */
export function LepAlumniCommunityScreen() {
  const { profile } = useAuth();
  const nav = useLepNav();
  const batchShort = lepAlumniBatchShort(profile);

  return (
    <AlumniShell title="Community" sub="Alumni circle">
      <AlumniInnovationComingSoon
        icon="groups"
        eyebrow="Alumni circle"
        title="Community is almost here"
        batchLabel={`${batchShort} graduates`}
        body="A private room for your batch and chapter — monthly meet reminders, wins, and asks. We’re building it so it feels like LEP circle, not another group chat."
        footnote="Until then, RSVP to live alumni touches on Engage and keep your monthly challenge streak."
      />
      <View style={{ marginTop: 20 }}>
        <RedCta label="Open Engage for events →" onPress={nav.goEngage} />
      </View>
    </AlumniShell>
  );
}
