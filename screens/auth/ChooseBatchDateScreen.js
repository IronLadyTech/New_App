import React, { useMemo, useState } from 'react';
import { Animated, Modal, Platform, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';

const PAGE = '#F7F6E4';
const INK = '#113744';
const BODY = '#4A463D';
const META = '#5A574F';
const LINE = '#EAE8DC';
const DASH = '#DCD7C8';
const CTA = '#ED1D24';
const RADIO_OFF = '#DCD7C8';

export const BATCHES = [
  {
    id: 'sep20',
    title: 'Sat 20 Sep – Sun 21 Sep',
    hours: 'Two full days · 9:00 AM – 7:00 PM IST',
    weeks: 'Then weekly sessions until 18 Oct',
    filling: true,
    day1: 'Sat 20 Sep · 9:00 AM – 7:00 PM IST',
    day2: 'Sun 21 Sep · 9:00 AM – 7:00 PM IST',
  },
  {
    id: 'sep27',
    title: 'Sat 27 Sep – Sun 28 Sep',
    hours: 'Two full days · 9:00 AM – 7:00 PM IST',
    weeks: 'Then weekly sessions until 25 Oct',
    day1: 'Sat 27 Sep · 9:00 AM – 7:00 PM IST',
    day2: 'Sun 28 Sep · 9:00 AM – 7:00 PM IST',
  },
  {
    id: 'oct4',
    title: 'Sat 4 Oct – Sun 5 Oct',
    hours: 'Two full days · 9:00 AM – 7:00 PM IST',
    weeks: 'Then weekly sessions until 1 Nov',
    day1: 'Sat 4 Oct · 9:00 AM – 7:00 PM IST',
    day2: 'Sun 5 Oct · 9:00 AM – 7:00 PM IST',
  },
  {
    id: 'oct11',
    title: 'Sat 11 Oct – Sun 12 Oct',
    hours: 'Two full days · 9:00 AM – 7:00 PM IST',
    weeks: 'Then weekly sessions until 8 Nov',
    day1: 'Sat 11 Oct · 9:00 AM – 7:00 PM IST',
    day2: 'Sun 12 Oct · 9:00 AM – 7:00 PM IST',
  },
];

const androidFix = Platform.OS === 'android' ? { includeFontPadding: false } : null;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, n) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function fmtDay(d) {
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
}

function batchFromDate(d) {
  const day1 = startOfDay(d);
  const day2 = addDays(day1, 1);
  const weeks = addDays(day1, 28);
  const key = `${day1.getFullYear()}-${String(day1.getMonth() + 1).padStart(2, '0')}-${String(day1.getDate()).padStart(2, '0')}`;
  return {
    id: `custom-${key}`,
    title: `${fmtDay(day1)} – ${fmtDay(day2)}`,
    hours: 'Two full days · 9:00 AM – 7:00 PM IST',
    weeks: `Then weekly sessions until ${fmtDay(weeks)}`,
    day1: `${fmtDay(day1)} · 9:00 AM – 7:00 PM IST`,
    day2: `${fmtDay(day2)} · 9:00 AM – 7:00 PM IST`,
    custom: true,
  };
}

function monthCells(year, month) {
  const first = new Date(year, month, 1);
  const start = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < start; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
  return cells;
}

function Radio({ selected }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: selected ? CTA : 'transparent',
        borderWidth: selected ? 0 : 2,
        borderColor: RADIO_OFF,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected ? <MaterialIcons name="check" size={12} color="#FFFFFF" /> : null}
    </View>
  );
}

function BatchCard({ batch, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        width: '100%',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: selected ? CTA : LINE,
        backgroundColor: '#FFFFFF',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        ...(selected
          ? {
              shadowColor: '#C94A38',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 9,
              elevation: 4,
            }
          : null),
      }}
    >
      <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
        <ILText
          role="title"
          color={INK}
          style={[
            androidFix,
            {
              fontFamily: IL_FONTS.display,
              fontSize: 16,
              lineHeight: 21,
              letterSpacing: -0.2,
            },
          ]}
        >
          {batch.title}
        </ILText>
        <ILText
          role="bodySm"
          color={META}
          style={[androidFix, { marginTop: 4, fontSize: 11.5, lineHeight: 16 }]}
        >
          {batch.hours}
        </ILText>
        <ILText
          role="bodySm"
          color={BODY}
          style={[androidFix, { marginTop: 4, fontSize: 11.5, lineHeight: 16 }]}
        >
          {batch.weeks}
        </ILText>
        {batch.custom ? (
          <View
            style={{
              marginTop: 8,
              alignSelf: 'flex-start',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: 'rgba(17,55,68,0.08)',
            }}
          >
            <ILText
              role="eyebrow"
              color={INK}
              style={[androidFix, { fontSize: 10, lineHeight: 14, letterSpacing: 1.2 }]}
            >
              Your date
            </ILText>
          </View>
        ) : null}
        {batch.filling ? (
          <View
            style={{
              marginTop: 8,
              alignSelf: 'flex-start',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: 'rgba(237,29,36,0.10)',
            }}
          >
            <ILText
              role="eyebrow"
              color={CTA}
              style={[
                androidFix,
                {
                  fontSize: 10,
                  lineHeight: 14,
                  letterSpacing: 1.2,
                },
              ]}
            >
              Filling
            </ILText>
          </View>
        ) : null}
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}

function CalendarPicker({ visible, onClose, onPick }) {
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const cells = useMemo(() => monthCells(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(17,55,68,0.45)',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 18,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <MaterialIcons name="chevron-left" size={22} color={INK} />
            </Pressable>
            <ILText role="title" color={INK} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
              {MON[cursor.getMonth()]} {cursor.getFullYear()}
            </ILText>
            <Pressable
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <MaterialIcons name="chevron-right" size={22} color={INK} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            {DOW.map((d) => (
              <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                <ILText role="eyebrow" color={META} style={[androidFix, { fontSize: 10 }]}>
                  {d}
                </ILText>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {cells.map((day, i) => {
              const past = day && startOfDay(day) < today;
              return (
                <View key={day ? day.toISOString() : `e-${i}`} style={{ width: `${100 / 7}%`, padding: 3 }}>
                  {day ? (
                    <Pressable
                      onPress={past ? undefined : () => onPick(day)}
                      disabled={past}
                      style={{
                        height: 40,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: past ? 'transparent' : 'rgba(237,29,36,0.08)',
                      }}
                    >
                      <ILText role="label" color={past ? '#C8C4B6' : INK} style={{ fontSize: 13 }}>
                        {day.getDate()}
                      </ILText>
                    </Pressable>
                  ) : (
                    <View style={{ height: 40 }} />
                  )}
                </View>
              );
            })}
          </View>
          <ILText role="bodySm" color={META} style={{ marginTop: 12, fontSize: 12, lineHeight: 16 }}>
            Day 1 is the date you pick. Day 2 is the next day, then weekly sessions for four weeks.
          </ILText>
        </View>
      </View>
    </Modal>
  );
}

export default function ChooseBatchDateScreen({ navigation, onLock, onBack }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(BATCHES[0].id);
  const [custom, setCustom] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const batches = custom ? [custom, ...BATCHES] : BATCHES;

  const goBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  const lockSeat = () => {
    const batch = batches.find((b) => b.id === selected) || batches[0];
    if (typeof onLock === 'function') {
      onLock(batch);
      return;
    }
    navigation?.navigate?.('SeatHeld', { batch });
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <CalendarPicker
        visible={calOpen}
        onClose={() => setCalOpen(false)}
        onPick={(day) => {
          const next = batchFromDate(day);
          setCustom(next);
          setSelected(next.id);
          setCalOpen(false);
        }}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 8) + 16,
          paddingBottom: 20,
        }}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <MaterialIcons name="chevron-left" size={22} color="#1A1F2E" />
        </Pressable>
        <View>
          <ILText
            role="eyebrow"
            color={CTA}
            style={[
              androidFix,
              {
                fontSize: 10,
                lineHeight: 13,
                letterSpacing: 1.6,
                marginBottom: 4,
              },
            ]}
          >
            Step 2 of 2
          </ILText>
          <ILText
            role="display"
            color={INK}
            style={{
              fontSize: 27,
              lineHeight: 32,
              letterSpacing: -0.4,
            }}
          >
            Choose your batch
          </ILText>
          <ILText
            role="bodySm"
            color={BODY}
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Every batch starts with two full days, then runs weekly for four weeks. Pick the start
            that works — you can ask for a different date if none of these do.
          </ILText>
        </View>

        <View style={{ marginTop: 24, gap: 10 }}>
          {batches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              selected={selected === batch.id}
              onPress={() => setSelected(batch.id)}
            />
          ))}
        </View>

        <Pressable
          onPress={() => setCalOpen(true)}
          style={{
            marginTop: 24,
            width: '100%',
            borderRadius: 20,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: DASH,
            backgroundColor: 'rgba(255,255,255,0.60)',
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <ILText
              role="label"
              color={INK}
              style={[androidFix, { fontSize: 13.5, lineHeight: 18 }]}
            >
              None of these work
            </ILText>
            <ILText
              role="bodySm"
              color={META}
              style={[androidFix, { marginTop: 2, fontSize: 11.5, lineHeight: 16 }]}
            >
              Pick a start date on the calendar
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={META} />
        </Pressable>

        <View
          style={{
            marginTop: 24,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: LINE,
            padding: 16,
          }}
        >
          <ILText
            role="bodySm"
            color={BODY}
            style={{ fontSize: 12, lineHeight: 18 }}
          >
            Batches cannot be rescheduled once the programme starts, so pick a weekend you can give
            fully.
          </ILText>
        </View>

      </Animated.ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
          backgroundColor: PAGE,
          borderTopWidth: 1,
          borderTopColor: LINE,
        }}
      >
        <Pressable
          onPress={lockSeat}
          accessibilityRole="button"
          accessibilityLabel="Lock my seat"
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 14,
            borderRadius: 999,
            backgroundColor: CTA,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.92 : 1,
            shadowColor: CTA,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.28,
            shadowRadius: 12,
            elevation: 4,
          })}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 14, lineHeight: 18 }}>
            Lock my seat
          </ILText>
        </Pressable>
      </View>
    </View>
  );
}
