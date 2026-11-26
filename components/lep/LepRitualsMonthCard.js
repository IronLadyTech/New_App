import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { dailyMarksForDate, weekDaysMonSun } from '../../utils/lepRitualsTracker';
import { LEP_RITUAL_DAILY_MARKS_MAX, LEP_RITUAL_WEEKLY_MARKS_MAX } from '../../constants/lepFiveRituals';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const WEEK_COL = 44;
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Shade for a day: none → light, some rituals → pink, all five → dark. */
function dayStyle(marks) {
  if (marks >= LEP_RITUAL_DAILY_MARKS_MAX) return { bg: G.dark, fg: '#FFFFFF' };
  if (marks > 0) return { bg: G.pink, fg: G.cta };
  return { bg: 'transparent', fg: G.meta };
}

/**
 * The month at a glance: each day shows how many of the five rituals she did (dark = all five),
 * and each row (one Mon–Sun week) ends with that week's score out of 35.
 * Earlier months with the arrows; never past this month.
 */
export default function LepRitualsMonthCard({ today }) {
  const demo = useCourseDemo();
  const [ty, tm] = String(today).split('-').map(Number);
  const [offset, setOffset] = useState(0); // 0 = this month, -1 = last month …
  const view = useMemo(() => {
    const first = new Date(Date.UTC(ty, tm - 1 + offset, 1));
    const y = first.getUTCFullYear();
    const m = first.getUTCMonth();
    const daysIn = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7; // Monday first
    const cells = [];
    for (let i = 0; i < lead; i += 1) cells.push(null);
    let fullDays = 0;
    for (let d = 1; d <= daysIn; d += 1) {
      const iso = isoOf(y, m, d);
      const future = iso > today;
      const n = future ? 0 : dailyMarksForDate(demo.isDoneOnDay, iso);
      if (!future && n >= LEP_RITUAL_DAILY_MARKS_MAX) fullDays += 1;
      cells.push({ d, iso, n, future, isToday: iso === today });
    }
    while (cells.length % 7) cells.push(null);
    // One score per row: the whole Mon–Sun week (also its days in the next / last month).
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      const any = cells.slice(i, i + 7).find(Boolean);
      const days = weekDaysMonSun(any.iso);
      const started = days[0] <= today;
      const score = days.filter((iso) => iso <= today).reduce((t, iso) => t + dailyMarksForDate(demo.isDoneOnDay, iso), 0);
      weeks.push({ started, score, isThisWeek: days.includes(today) });
    }
    return { y, m, cells, fullDays, weeks };
    // demo.done: the marks change as she ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ty, tm, offset, today, demo.done]);

  const rows = [];
  for (let i = 0; i < view.cells.length; i += 7) rows.push(view.cells.slice(i, i + 7));

  return (
    <WhiteCard style={{ marginTop: 14, padding: 16, borderRadius: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, flex: 1 }]}>
          THIS MONTH
        </ILText>
        <Pressable onPress={() => setOffset((o) => o - 1)} hitSlop={10} accessibilityLabel="Previous month">
          <MaterialIcons name="chevron-left" size={22} color={G.ink} />
        </Pressable>
        <ILText role="label" color={G.ink} style={{ marginHorizontal: 6, fontSize: 13 }}>
          {`${MONTHS[view.m]} ${view.y}`}
        </ILText>
        <Pressable
          onPress={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset >= 0}
          hitSlop={10}
          accessibilityLabel="Next month"
          style={{ opacity: offset >= 0 ? 0.3 : 1 }}
        >
          <MaterialIcons name="chevron-right" size={22} color={G.ink} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
        <ILText role="display" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 26 }}>
          {view.fullDays}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, marginLeft: 8 }}>
          {view.fullDays === 1 ? 'day with all five rituals this month' : 'days with all five rituals this month'}
        </ILText>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        {DOW.map((d, i) => (
          <View key={`${d}${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <ILText role="label" color={G.meta} style={{ fontSize: 10 }}>
              {d}
            </ILText>
          </View>
        ))}
        <View style={{ width: WEEK_COL, alignItems: 'flex-end' }}>
          <ILText role="label" color={G.meta} style={{ fontSize: 10 }}>
            WEEK
          </ILText>
        </View>
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', marginTop: 6 }}>
          {row.map((c, i) => {
            if (!c) return <View key={`e${r}${i}`} style={{ flex: 1 }} />;
            const st = dayStyle(c.n);
            return (
              <View key={c.iso} style={{ flex: 1, alignItems: 'center' }}>
                <View
                  accessibilityLabel={`${c.d}: ${c.n} of 5 rituals`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: c.future ? 'transparent' : st.bg,
                    borderWidth: c.isToday ? 1.5 : 0,
                    borderColor: G.cta,
                    opacity: c.future ? 0.35 : 1,
                  }}
                >
                  <ILText role="label" color={c.future ? G.meta : st.fg} style={{ fontSize: 12 }}>
                    {c.d}
                  </ILText>
                </View>
              </View>
            );
          })}
          <View style={{ width: WEEK_COL, alignItems: 'flex-end', justifyContent: 'center' }}>
            {view.weeks[r]?.started ? (
              <ILText
                role="label"
                color={view.weeks[r].isThisWeek ? G.cta : G.ink}
                style={{ fontSize: 12 }}
                accessibilityLabel={`Week score ${view.weeks[r].score} of ${LEP_RITUAL_WEEKLY_MARKS_MAX}`}
              >
                {`${view.weeks[r].score}/${LEP_RITUAL_WEEKLY_MARKS_MAX}`}
              </ILText>
            ) : null}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: G.dark, marginRight: 6 }} />
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 11, marginRight: 14 }}>
          All five
        </ILText>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: G.pink, marginRight: 6 }} />
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
          Some
        </ILText>
      </View>
    </WhiteCard>
  );
}
