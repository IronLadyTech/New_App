import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { LEP_FIVE_RITUALS, LEP_RITUAL_DAILY_MARKS_MAX, LEP_RITUAL_WEEKLY_MARKS_MAX } from '../../constants/lepFiveRituals';

const RITUAL_ICONS = {
  mirror: 'face-retouching-natural',
  agame: 'emoji-events',
  request: 'record-voice-over',
  gratitude: 'favorite-border',
  bhag: 'flag',
};

function RitualTile({ ritual, marked, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: marked ? G.dark : G.mutedFill,
          borderWidth: marked ? 0 : 1,
          borderColor: G.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {marked ? (
          <MaterialIcons name="check" size={22} color="#FFF" />
        ) : (
          <MaterialIcons name={RITUAL_ICONS[ritual.id] || 'circle'} size={22} color={G.meta} />
        )}
      </View>
      <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 10, textAlign: 'center' }} numberOfLines={2}>
        {ritual.short}
      </ILText>
    </Pressable>
  );
}

/** Today’s five rituals — ticks sync with home tracker and weekly consistency. */
export default function LepRitualsTodayStrip({ todayMarks, weekMarks, grid, today, toggleRitual, unmarkRitual, onOpenFull }) {

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <ILText role="eyebrow" color="#ED1D24" style={[af, { fontSize: 10 }]}>
            5 DAILY RITUALS
          </ILText>
          <ILText role="title" color={G.ink} style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 20 }}>
            Today {todayMarks}/{LEP_RITUAL_DAILY_MARKS_MAX}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
            This week {weekMarks}/{LEP_RITUAL_WEEKLY_MARKS_MAX} marks
          </ILText>
        </View>
        {onOpenFull ? (
          <Pressable onPress={onOpenFull} hitSlop={8}>
            <MaterialIcons name="calendar-view-week" size={26} color={G.ink} />
          </Pressable>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 14, gap: 4 }}>
        {LEP_FIVE_RITUALS.map((ritual) => {
          const row = grid?.find((r) => r.id === ritual.id);
          const marked = row?.days?.find((d) => d.iso === today)?.marked;
          return (
            <RitualTile
              key={ritual.id}
              ritual={ritual}
              marked={marked}
              onToggle={() => {
                if (marked) unmarkRitual(ritual.id, today);
                else toggleRitual(ritual.id, today);
              }}
            />
          );
        })}
      </View>
    </WhiteCard>
  );
}
