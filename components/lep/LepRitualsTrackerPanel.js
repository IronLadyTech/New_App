import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import {
  LEP_RITUAL_DAILY_MARKS_MAX,
  LEP_RITUAL_WEEKLY_MARKS_MAX,
} from '../../constants/lepFiveRituals';

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function MarkCell({ marked, isToday, beforeUnlock, onPress, disabled }) {
  const bg = beforeUnlock
    ? G.mutedFill
    : marked
      ? G.dark
      : isToday
        ? 'rgba(237,29,36,0.12)'
        : '#FFF';
  const border = isToday ? '#ED1D24' : G.line;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || beforeUnlock}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        marginHorizontal: 2,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ILText role="label" color={marked ? '#FFF' : G.meta} style={[af, { fontSize: 12 }]}>
        {beforeUnlock ? '·' : marked ? '✓' : ''}
      </ILText>
    </Pressable>
  );
}

/**
 * Shared 5 Daily Rituals marks grid (today + week scores).
 */
export default function LepRitualsTrackerPanel({
  today,
  model,
  toggleRitual,
  unmarkRitual,
  showVideoLink = false,
}) {
  const navigation = useNavigation();
  const { grid, todayMarks, weekMarks, weekDays } = model;

  return (
    <>
      <WhiteCard style={{ marginTop: 14, padding: 14, borderRadius: 18 }}>
        <ILText role="eyebrow" color="#ED1D24" style={[af, { fontSize: 10 }]}>
          5 DAILY RITUALS
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, lineHeight: 18, fontSize: 12 }}>
          1 mark per ritual · {LEP_RITUAL_DAILY_MARKS_MAX} per day · {LEP_RITUAL_WEEKLY_MARKS_MAX} per week
        </ILText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <View>
            <ILText role="eyebrow" color={G.meta}>Today</ILText>
            <ILText role="display" color={G.ink} style={{ fontSize: 28, marginTop: 4 }}>
              {todayMarks}/{LEP_RITUAL_DAILY_MARKS_MAX}
            </ILText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ILText role="eyebrow" color={G.meta}>This week</ILText>
            <ILText role="display" color={G.ink} style={{ fontSize: 28, marginTop: 4 }}>
              {weekMarks}/{LEP_RITUAL_WEEKLY_MARKS_MAX}
            </ILText>
          </View>
        </View>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, padding: 12, borderRadius: 18, overflow: 'hidden' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: 'row', marginBottom: 8, paddingLeft: 88 }}>
              {weekDays.map((iso, i) => (
                <View key={iso} style={{ width: 36, marginHorizontal: 2, alignItems: 'center' }}>
                  <ILText role="label" color={iso === today ? '#ED1D24' : G.meta} style={{ fontSize: 10 }}>
                    {DOW[i]}
                  </ILText>
                </View>
              ))}
            </View>
            {grid.map((row) => (
              <View key={row.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ width: 80, paddingRight: 8 }}>
                  <ILText role="label" color={G.ink} style={{ fontSize: 12 }} numberOfLines={2}>
                    {row.short}
                  </ILText>
                </View>
                {row.days.map((cell) => (
                  <MarkCell
                    key={`${row.id}-${cell.iso}`}
                    marked={cell.marked}
                    isToday={cell.isToday}
                    beforeUnlock={cell.beforeUnlock}
                    disabled={cell.iso > today}
                    onPress={() => {
                      if (cell.marked) unmarkRitual(row.id, cell.iso);
                      else toggleRitual(row.id, cell.iso);
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </WhiteCard>

      {showVideoLink ? (
        <Pressable
          onPress={() => navigation.navigate('Practice', { programId: 'lep', practiceId: 'lep-rituals' })}
          style={{ marginTop: 12, paddingVertical: 8 }}
        >
          <ILText role="label" color="#ED1D24" style={{ textAlign: 'center' }}>
            Watch 5 Daily Rituals video →
          </ILText>
        </Pressable>
      ) : null}
    </>
  );
}
