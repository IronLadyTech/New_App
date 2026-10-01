import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useProgramNav } from '../../context/ProgramNavContext';
import ProgramJourneys from './ProgramJourneys';

const PHASES = [
  { id: 1, title: 'CoDeSeF', kind: 'Reading', done: true },
  { id: 2, title: 'Powerful Extreme Responding', kind: 'Video', done: true },
  { id: 3, title: 'Maximise Key Relationships', kind: 'Reading · ~10 min', done: false },
  { id: 4, title: 'Purpose Peg Table', kind: 'Practice', done: false },
  { id: 5, title: 'Day 2 Assignment', kind: 'Assignment', done: false },
];

export default function MyProgramScreen() {
  const { program, stage, section } = useProgramNav();

  return (
    <ProgramJourneys
      program={program}
      stage={stage}
      lepBody={section === 'Journey' ? <LepJourney /> : <LepPlaceholder section={section} />}
    />
  );
}

function LepPlaceholder({ section }) {
  return (
    <View style={{ paddingVertical: 36 }}>
      <ILText role="body" color={IL_BRAND.muted} align="center">
        {section} for this program will list live sessions, recordings and your circle.
      </ILText>
    </View>
  );
}

function LepJourney() {
  return (
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
  );
}
