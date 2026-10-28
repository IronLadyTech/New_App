import React from 'react';
import { View } from 'react-native';
import Pressable from '../il/Press';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';

function PercentRing({ percent = 0, size = 56 }) {
  const stroke = 4.5;
  const c = size / 2;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, percent / 100));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} stroke={G.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={G.cta}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ * frac} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <ILText role="label" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 14 }}>
        {percent}%
      </ILText>
    </View>
  );
}

function ReadyRow({ item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: G.pink,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginTop: 8,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          backgroundColor: item.done ? G.cta : 'rgba(255,255,255,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.done ? <MaterialIcons name="check" size={16} color="#FFFFFF" /> : null}
      </View>
      <ILText
        role="label"
        color={item.done ? G.meta : G.ink}
        style={{
          marginLeft: 12,
          flex: 1,
          fontSize: 14,
          lineHeight: 20,
          textDecorationLine: item.done ? 'line-through' : 'none',
        }}
      >
        {item.title}
      </ILText>
    </Pressable>
  );
}

/** Pre–Day 1 boardroom prep — hides when every row is checked. */
export default function GetReadyChecklistCard({ items, onToggleItem }) {
  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const remaining = total - doneCount;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  if (!total || remaining === 0) return null;

  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
            Get ready checklist
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
            {remaining} small step{remaining === 1 ? '' : 's'} remaining for a seamless boardroom
          </ILText>
        </View>
        <PercentRing percent={percent} />
      </View>
      {items.map((item) => (
        <ReadyRow key={item.id || item.title} item={item} onPress={() => onToggleItem(item)} />
      ))}
    </WhiteCard>
  );
}
