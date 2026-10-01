import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import ILHeader from '../../components/il/ILHeader';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';
import { usePrograms } from '../../context/ProgramsContext';

const PHASES = [
  { id: 1, title: 'CoDeSeF', kind: 'Reading', done: true },
  { id: 2, title: 'Powerful Extreme Responding', kind: 'Video', done: true },
  { id: 3, title: 'Maximise Key Relationships', kind: 'Reading · ~10 min', done: false },
  { id: 4, title: 'Purpose Peg Table', kind: 'Practice', done: false },
  { id: 5, title: 'Day 2 Assignment', kind: 'Assignment', done: false },
];

export default function MyProgramScreen({ navigation }) {
  const { profile } = useAuth();
  const { enrolledPrograms } = usePrograms();
  const [tab, setTab] = useState('Journey');
  const hasProgram = enrolledPrograms.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: IL_BRAND.cream }}>
      <StatusBar style="dark" />
      <ILHeader
        photoUrl={profile?.photoURL}
        onProfile={() => navigation.navigate('Profile')}
        onNotifications={() => {}}
        onSearch={() => {}}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: IL_SPACE.page, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ILText role="eyebrow" color={IL_BRAND.red} style={{ marginTop: 6 }}>
          My Program
        </ILText>
        <ILText role="displaySm" style={{ marginTop: 8 }}>
          {hasProgram ? 'Leadership Essentials program' : 'Your program will live here'}
        </ILText>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#EFEADF',
            borderRadius: 999,
            padding: 4,
            marginTop: 18,
          }}
        >
          {['All', 'LEP', '100BM'].map((item, i) => {
            const on = item === 'LEP' || (!hasProgram && i === 0);
            return (
              <View
                key={item}
                style={{
                  flex: 1,
                  minHeight: 36,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? IL_BRAND.forest : 'transparent',
                }}
              >
                <ILText role="label" color={on ? IL_BRAND.white : IL_BRAND.muted}>
                  {item}
                </ILText>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 18, borderBottomWidth: 1, borderBottomColor: IL_BRAND.line }}>
          {['Journey', 'Sessions', 'Cohort'].map((item) => {
            const on = tab === item;
            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingBottom: 10,
                  borderBottomWidth: on ? 2 : 0,
                  borderBottomColor: IL_BRAND.red,
                }}
              >
                <ILText role="label" color={on ? IL_BRAND.ink : IL_BRAND.muted}>
                  {item}
                </ILText>
              </Pressable>
            );
          })}
        </View>

        {tab === 'Journey' ? (
          <>
            <View
              style={{
                backgroundColor: IL_BRAND.forest,
                borderRadius: 24,
                padding: 20,
                marginTop: 18,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ILText role="eyebrow" color={IL_BRAND.mutedOnDark}>
                  Batch 42 · your progress
                </ILText>
                <ILText role="eyebrow" color={IL_BRAND.redSoft}>
                  36%
                </ILText>
              </View>
              <ILText role="displaySm" color={IL_BRAND.white} style={{ marginTop: 10 }}>
                Phase 4 of 11
              </ILText>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  marginTop: 14,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: '36%',
                    height: 4,
                    backgroundColor: IL_BRAND.red,
                    borderRadius: 2,
                  }}
                />
              </View>
              <ILText role="bodySm" color={IL_BRAND.mutedOnDark} style={{ marginTop: 12 }}>
                Day 2 — Strategies and Tactics · 2 of 6 tasks done
              </ILText>
            </View>

            <ILText role="title" style={{ marginTop: 22 }}>
              This phase
            </ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Day 2 · Strategies and Tactics
            </ILText>

            <View
              style={{
                backgroundColor: IL_BRAND.white,
                borderRadius: 22,
                marginTop: 12,
                overflow: 'hidden',
              }}
            >
              {PHASES.map((item, index) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderTopWidth: index ? 1 : 0,
                    borderTopColor: IL_BRAND.line,
                    minHeight: 56,
                  }}
                >
                  <MaterialIcons
                    name={item.done ? 'check-circle' : 'radio-button-unchecked'}
                    size={22}
                    color={item.done ? IL_BRAND.forest : IL_BRAND.dim}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <ILText role="label">{item.title}</ILText>
                    <ILText role="bodySm" color={IL_BRAND.muted}>
                      {item.kind}
                    </ILText>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={{ paddingVertical: 36 }}>
            <ILText role="body" color={IL_BRAND.muted} align="center">
              {tab} for this program will list live sessions, recordings and your circle.
            </ILText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
