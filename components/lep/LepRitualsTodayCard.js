import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';
import { LEP_RITUAL_DAILY_MARKS_MAX, LEP_RITUAL_WEEKLY_MARKS_MAX } from '../../constants/lepFiveRituals';

/**
 * Home: today's five rituals only, one tap each. The week grid lives on the full tracker —
 * on Home it was a wall of empty boxes.
 */
export default function LepRitualsTodayCard({ today, model, toggleRitual, unmarkRitual, onOpenTracker }) {
  const { grid, todayMarks, weekMarks } = model;
  const allDone = todayMarks >= LEP_RITUAL_DAILY_MARKS_MAX;
  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
            Your 5 Daily Rituals
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
            {allDone
              ? 'All five done today. Same time tomorrow.'
              : `${todayMarks} of ${LEP_RITUAL_DAILY_MARKS_MAX} today · tap each one as you do it`}
          </ILText>
        </View>
        <Pressable onPress={onOpenTracker} accessibilityRole="button" hitSlop={8}>
          <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
            {`Week ${weekMarks}/${LEP_RITUAL_WEEKLY_MARKS_MAX}`}
          </ILText>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {grid.map((row) => {
          const cell = row.days.find((d) => d.iso === today);
          const marked = Boolean(cell?.marked);
          return (
            <Pressable
              key={row.id}
              onPress={() => (marked ? unmarkRitual(row.id, today) : toggleRitual(row.id, today))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: marked }}
              accessibilityLabel={row.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 8,
                marginBottom: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: marked ? G.dark : G.line,
                backgroundColor: marked ? G.dark : G.white,
              }}
            >
              {marked ? <MaterialIcons name="check" size={14} color="#FFFFFF" style={{ marginRight: 4 }} /> : null}
              <ILText role="label" color={marked ? '#FFFFFF' : G.ink} style={{ fontSize: 13 }}>
                {row.short}
              </ILText>
            </Pressable>
          );
        })}
      </View>
    </WhiteCard>
  );
}
