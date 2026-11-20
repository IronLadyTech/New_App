import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';
import { LEP_RITUAL_DAILY_MARKS_MAX } from '../../constants/lepFiveRituals';

/**
 * One line icon per ritual, the same set as the 5 Rituals film's artwork (sunrise, target,
 * handshake, heart, mountain peak), in the brand colours instead of phone emojis.
 */
const RITUAL_ICON = {
  mirror: 'weather-sunset-up',
  agame: 'target',
  request: 'handshake-outline',
  gratitude: 'heart-outline',
  bhag: 'image-filter-hdr',
};
const RED = '#E52A2A';

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

      {/* A morning path: five stops joined by a line that fills as she goes. */}
      <View style={{ marginTop: 16 }}>
        <View style={{ position: 'absolute', left: '10%', right: '10%', top: 25, height: 3, borderRadius: 2, backgroundColor: G.line }} />
        <View
          style={{
            position: 'absolute',
            left: '10%',
            top: 25,
            height: 3,
            borderRadius: 2,
            backgroundColor: RED,
            width: `${(Math.min(todayMarks, LEP_RITUAL_DAILY_MARKS_MAX) / LEP_RITUAL_DAILY_MARKS_MAX) * 80}%`,
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
                style={{ alignItems: 'center', width: '20%' }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: marked ? G.dark : G.white,
                    borderWidth: marked ? 0 : 1.5,
                    borderColor: G.line,
                  }}
                >
                  <MaterialCommunityIcons name={RITUAL_ICON[row.id] || 'circle-outline'} size={24} color={marked ? '#FFFFFF' : G.dark} />
                  {marked ? (
                    <View
                      style={{
                        position: 'absolute',
                        right: -3,
                        top: -3,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: RED,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: '#FFFFFF',
                      }}
                    >
                      <MaterialIcons name="check" size={11} color="#FFFFFF" />
                    </View>
                  ) : null}
                </View>
                <ILText role="label" color={marked ? G.ink : G.meta} style={{ marginTop: 7, fontSize: 11 }} numberOfLines={1}>
                  {row.short}
                </ILText>
              </Pressable>
            );
          })}
        </View>
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
