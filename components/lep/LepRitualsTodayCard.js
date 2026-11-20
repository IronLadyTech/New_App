import React from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';
import { LEP_RITUAL_DAILY_MARKS_MAX } from '../../constants/lepFiveRituals';

/** One picture per ritual, so each can be found at a glance in the morning. */
const RITUAL_EMOJI = {
  mirror: '🪞',
  agame: '🎯',
  request: '🙋‍♀️',
  gratitude: '🙏',
  bhag: '🚀',
};

/**
 * Home: today's five rituals. Tapping a ritual ticks it (tap again to untick); tapping anywhere
 * else on the card opens the full weekly grid. The rituals video is one tap away.
 */
export default function LepRitualsTodayCard({ today, model, toggleRitual, unmarkRitual, onOpenTracker, onWatchVideo }) {
  const { grid, todayMarks } = model;
  const allDone = todayMarks >= LEP_RITUAL_DAILY_MARKS_MAX;
  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }} onPress={onOpenTracker}>
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
        {/* The card opens the full tracker (week and month); no score here. */}
        <MaterialIcons name="grid-view" size={18} color={G.meta} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
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
              hitSlop={4}
              style={{ alignItems: 'center', width: '19%' }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: marked ? G.dark : '#F4F1E8',
                  borderWidth: marked ? 0 : 1,
                  borderColor: G.line,
                }}
              >
                <Text style={{ fontSize: 22, opacity: marked ? 0.45 : 1 }}>{RITUAL_EMOJI[row.id] || '•'}</Text>
                {marked ? (
                  <View style={{ position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#1B7A4A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' }}>
                    <MaterialIcons name="check" size={12} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
              <ILText role="label" color={marked ? G.ink : G.meta} style={{ marginTop: 6, fontSize: 11 }} numberOfLines={1}>
                {row.short}
              </ILText>
            </Pressable>
          );
        })}
      </View>

      {onWatchVideo ? (
        <Pressable onPress={onWatchVideo} accessibilityRole="button" hitSlop={8} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
          <MaterialIcons name="play-circle-outline" size={18} color={G.cta} />
          <ILText role="label" color={G.cta} style={{ marginLeft: 6, fontSize: 13 }}>
            Watch the 5 Rituals video
          </ILText>
        </Pressable>
      ) : null}
    </WhiteCard>
  );
}
