import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILHeader from '../../components/il/ILHeader';
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

export default function ChooseBatchDateScreen({ navigation, onLock }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(BATCHES[0].id);

  const lockSeat = () => {
    const batch = BATCHES.find((b) => b.id === selected) || BATCHES[0];
    if (typeof onLock === 'function') {
      onLock(batch);
      return;
    }
    navigation?.navigate?.('SeatHeld', { batch });
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <ILHeader
        onSearch={() => {}}
        onNotifications={() => {}}
        onProfile={() => {}}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 28,
        }}
      >
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
          {BATCHES.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              selected={selected === batch.id}
              onPress={() => setSelected(batch.id)}
            />
          ))}
        </View>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Request a date',
              'Someone from Iron Lady will call you to find a weekend that works.'
            )
          }
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
              Request a date and someone will call you
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

        <Pressable
          onPress={lockSeat}
          accessibilityRole="button"
          accessibilityLabel="Lock my seat"
          style={({ pressed }) => ({
            marginTop: 24,
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
      </ScrollView>
    </View>
  );
}
