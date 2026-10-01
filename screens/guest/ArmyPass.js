import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';

const PAPER = '#FFFDF7';
const STUB_W = 74;
const NOTCH = 22;

const STATS = [
  ['78,000+', 'women trained', G.ink],
  ['191', 'now ₹1Cr earners', G.cta],
  ['4.9★', 'average rating', G.ink],
];

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Still up,';
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function Notch({ edge }) {
  return (
    <View
      style={{
        position: 'absolute',
        right: STUB_W - NOTCH / 2,
        [edge]: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: NOTCH / 2,
        backgroundColor: G.page,
      }}
    />
  );
}

/**
 * Guest home opener: a paper pass to the Iron Lady Army with a coral tear-off stub.
 * Deliberately light, so it reads as an object on the page rather than a second header.
 * Her name comes from the "number not recognised" screen.
 */
export default function ArmyPass() {
  const [name, setName] = useState('');
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('il_guest_name')
      .then((v) => setName((v || '').trim().split(/\s+/)[0] || ''))
      .catch(() => {});
    Animated.spring(drop, { toValue: 1, damping: 11, stiffness: 120, mass: 0.8, useNativeDriver: true }).start();
  }, [drop]);

  return (
    <Animated.View
      style={{
        opacity: drop.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
        transform: [
          { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
          { rotate: drop.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '-1.5deg'] }) },
        ],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          borderRadius: 22,
          backgroundColor: PAPER,
          borderWidth: 1,
          borderColor: G.line,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0 18px 36px -14px rgba(17,55,68,0.35)' }
            : {
                shadowColor: '#113744',
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: 0.22,
                shadowRadius: 18,
                elevation: 8,
              }),
        }}
      >
        {/* Main part of the pass. */}
        <View style={{ flex: 1, paddingLeft: 20, paddingRight: 18, paddingTop: 18, paddingBottom: 16 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, letterSpacing: 1.6 }]}>
            WELCOME TO THE IRON LADY ARMY
          </ILText>
          <ILText
            role="title"
            color={G.meta}
            style={{ marginTop: 14, fontFamily: IL_FONTS.displayItalic, fontSize: 17, lineHeight: 22 }}
          >
            {greeting()}
          </ILText>
          <ILText
            role="display"
            color={G.ink}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontFamily: IL_FONTS.display, fontSize: 40, lineHeight: 48, letterSpacing: -0.8 }}
          >
            {name || 'future leader'}
            <ILText role="display" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 40, lineHeight: 48 }}>
              .
            </ILText>
          </ILText>

          <View style={{ height: 1, backgroundColor: G.line, marginTop: 14, marginBottom: 12 }} />
          <View style={{ flexDirection: 'row' }}>
            {STATS.map(([n, l, c], i) => (
              <View key={l} style={{ flex: 1, paddingLeft: i ? 10 : 0, borderLeftWidth: i ? 1 : 0, borderLeftColor: G.line }}>
                <ILText role="display" color={c} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
                  {n}
                </ILText>
                <ILText role="bodySm" color={G.meta} numberOfLines={1} style={{ marginTop: 2, fontSize: 10 }}>
                  {l}
                </ILText>
              </View>
            ))}
          </View>
        </View>

        {/* Perforation between the pass and its stub. */}
        <View style={{ width: 1, marginVertical: 14, borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: G.line }} />

        {/* Coral tear-off stub. */}
        <View
          style={{
            width: STUB_W,
            backgroundColor: G.cta,
            borderTopRightRadius: 21,
            borderBottomRightRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <View style={{ width: 170, alignItems: 'center', transform: [{ rotate: '-90deg' }] }}>
            <ILText role="eyebrow" color="rgba(255,255,255,0.75)" style={[af, { fontSize: 9, letterSpacing: 2 }]}>
              GUEST PASS
            </ILText>
            <ILText
              role="display"
              color="#FFFFFF"
              style={{ marginTop: 2, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 26 }}
            >
              No. 78,001
            </ILText>
            <ILText role="bodySm" color="rgba(255,255,255,0.8)" style={{ fontSize: 10 }}>
              that’s you
            </ILText>
          </View>
        </View>

        <Notch edge="top" />
        <Notch edge="bottom" />
      </View>
    </Animated.View>
  );
}
