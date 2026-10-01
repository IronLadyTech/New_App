import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import GuestHeader from '../../components/il/GuestHeader';
import { G, af } from '../../constants/guestTheme';
import {
  ActionLabel,
  FindCta,
  Kicker,
  Page,
  RedOrb,
  SectionHead,
  WhiteCard,
} from './GuestBits';
import { useGuestActions } from './useGuestActions';

const UNLOCK = [
  { title: 'Your batch & community circle', sub: 'Cohort chat, Thursday triads' },
  { title: 'All 27 Principles, in order', sub: 'Full practice library, tracked progress' },
  { title: 'Certificates & program record', sub: 'Shareable, tied to your name' },
];

const SETTINGS = ['Notifications', 'Privacy', 'Terms & policies'];

const PROOF = [
  { n: '78,000+', l: 'women enrolled' },
  { n: '4.9★', l: 'average rating' },
  { n: '3', l: 'flagship programs' },
];

export default function GuestMeScreen() {
  const insets = useSafeAreaInsets();
  const { findRegistration, goLearn } = useGuestActions();

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <View
          style={{
            borderRadius: 20,
            backgroundColor: G.dark,
            padding: 20,
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <RedOrb size={160} />
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.20)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <MaterialIcons name="person-outline" size={28} color="rgba(255,255,255,0.70)" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Kicker onDark>Browsing as a guest</Kicker>
            <ILText
              role="title"
              color="#FFFFFF"
              style={{
                marginTop: 8,
                fontFamily: IL_FONTS.display,
                fontSize: 17,
                lineHeight: 22,
              }}
            >
              No profile yet — that’s okay
            </ILText>
            <ILText
              role="bodySm"
              color="rgba(255,255,255,0.70)"
              style={{ marginTop: 4, fontSize: 11.5, lineHeight: 16 }}
            >
              Your name, batch and progress appear here the moment we match your registration.
            </ILText>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="New here?" />
          <WhiteCard
            onPress={goLearn}
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(237,29,36,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <ILText style={{ fontSize: 20, lineHeight: 24 }}>🎯</ILText>
            </View>
            <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
              <ILText role="label" color={G.ink} style={[af, { fontSize: 13.5, lineHeight: 18 }]}>
                Find your program in 60 seconds
              </ILText>
              <ILText
                role="bodySm"
                color={G.meta}
                style={[af, { marginTop: 2, fontSize: 11.5, lineHeight: 16 }]}
              >
                A short quiz — LEP, 100 Board Members or Master Board Woman
              </ILText>
            </View>
            <ActionLabel>Start</ActionLabel>
          </WhiteCard>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="What you’ll unlock" />
          <WhiteCard style={{ marginTop: 12, borderRadius: 20, overflow: 'hidden' }}>
            {UNLOCK.map((row, i) => (
              <View
                key={row.title}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: G.line,
                }}
              >
                <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  <ILText role="label" color={G.ink} style={[af, { fontSize: 13, lineHeight: 18 }]}>
                    {row.title}
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={G.meta}
                    style={[af, { marginTop: 2, fontSize: 11, lineHeight: 15 }]}
                  >
                    {row.sub}
                  </ILText>
                </View>
                <MaterialIcons name="lock-outline" size={16} color={G.meta} />
              </View>
            ))}
          </WhiteCard>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="Saved" />
          <WhiteCard
            dashed
            style={{
              marginTop: 12,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              backgroundColor: 'rgba(247,246,228,0.60)',
            }}
          >
            <ILText style={{ fontSize: 22, lineHeight: 28 }}>🔖</ILText>
            <ILText
              role="bodySm"
              color={G.meta}
              align="center"
              style={{ marginTop: 8, fontSize: 12, lineHeight: 17, maxWidth: 220 }}
            >
              Save a video or drill and it will show up here — no login needed to bookmark.
            </ILText>
          </WhiteCard>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="Why women trust this" />
          <WhiteCard
            style={{
              marginTop: 12,
              borderRadius: 20,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {PROOF.map((p, i) => (
              <React.Fragment key={p.l}>
                {i > 0 ? (
                  <View style={{ width: 1, height: 32, backgroundColor: G.line }} />
                ) : null}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <ILText
                    role="title"
                    color={G.ink}
                    style={{ fontFamily: IL_FONTS.display, fontSize: 17, lineHeight: 22 }}
                  >
                    {p.n}
                  </ILText>
                  <ILText
                    role="bodySm"
                    color={G.meta}
                    align="center"
                    style={[af, { marginTop: 2, fontSize: 10, lineHeight: 13 }]}
                  >
                    {p.l}
                  </ILText>
                </View>
              </React.Fragment>
            ))}
          </WhiteCard>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionHead title="Settings" />
          <WhiteCard style={{ marginTop: 12, borderRadius: 20, overflow: 'hidden' }}>
            {SETTINGS.map((row, i) => (
              <Pressable
                key={row}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: G.line,
                }}
              >
                <ILText role="label" color={G.ink} style={[af, { fontSize: 13, lineHeight: 18 }]}>
                  {row}
                </ILText>
                <MaterialIcons name="chevron-right" size={16} color={G.meta} />
              </Pressable>
            ))}
          </WhiteCard>
        </View>

        <FindCta
          kicker="Already registered?"
          title="Turn this into your profile"
          body="Tell us the number or email you registered with and everything above becomes real."
          onPress={findRegistration}
        />
      </ScrollView>
    </Page>
  );
}
