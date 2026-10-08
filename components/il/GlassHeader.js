import React, { useState } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, View } from 'react-native';
import Pressable from './Press';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILLogoMark from './ILLogoMark';
import ILText from './ILText';

// Same glass as the liquid tab bar, so the top and bottom of the app read as one set.
const GLASS = 'rgba(17,55,68,0.86)';
const GLASS_EDGE = 'rgba(248,214,212,0.45)';
const CREAM = '#F5F2E8';
const CORAL = '#ED1D24';
const PILL_H = 56;
const SIDE = 16;
const GAP_TOP = 6;

/**
 * Bell default: climb to the navigator that owns Notifications. In the member app that is
 * the Home tab's stack, so from other tabs it goes through Home.
 */
function openNotifications(navigation) {
  let nav = navigation;
  while (nav) {
    const names = nav.getState?.()?.routeNames || [];
    if (names.includes('Notifications')) {
      nav.navigate('Notifications');
      return;
    }
    if (names.includes('MyProgram') && names.includes('Home')) {
      nav.navigate('Home', { screen: 'Notifications' });
      return;
    }
    nav = nav.getParent?.();
  }
}

/** Space a floating header covers, so scroll content can start below it. */
export function useGlassHeaderPad() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.top, 8) + GAP_TOP + PILL_H + 12;
}

function GhostIcon({ name, onPress, label, badge }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? 'rgba(245,242,232,0.14)' : 'transparent',
      })}
    >
      <MaterialIcons name={name} size={21} color={CREAM} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 9,
            right: 10,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: CORAL,
            borderWidth: 1.5,
            borderColor: '#1B4250',
          }}
        />
      ) : null}
    </Pressable>
  );
}

function Glass() {
  if (Platform.OS === 'web') {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: GLASS,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          },
        ]}
      />
    );
  }
  return (
    <BlurView
      pointerEvents="none"
      intensity={Platform.OS === 'ios' ? 48 : 32}
      tint="dark"
      style={[StyleSheet.absoluteFill, { backgroundColor: GLASS }]}
    />
  );
}

const PILL_SHADOW =
  Platform.OS === 'web'
    ? { boxShadow: '0 10px 24px rgba(17,55,68,0.22)' }
    : {
        shadowColor: '#113744',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 10,
      };

function ProfileFace({ photo, onPress, size = 36 }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Profile">
      {photo ? (
        <Image
          source={photo}
          style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: CREAM }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: 'rgba(245,242,232,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="person" size={20} color={CREAM} />
        </View>
      )}
    </Pressable>
  );
}

function BrandMark() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ILLogoMark size={32} />
      <Text
        numberOfLines={1}
        style={{
          marginLeft: 10,
          color: CREAM,
          fontFamily: IL_FONTS.display,
          fontSize: 16,
          lineHeight: 20,
          flexShrink: 0,
          includeFontPadding: false,
        }}
      >
        {'Iron\u00A0Lady'}
      </Text>
    </View>
  );
}

function HeaderActions({ onSearch, onNotifications, onProfile, photo, showSearch, showProfile }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showSearch ? <GhostIcon name="search" onPress={onSearch} label="Search" /> : null}
      <GhostIcon name="notifications-none" onPress={onNotifications} label="Notifications" badge />
      {showProfile ? (
        <View style={{ marginLeft: 6 }}>
          <ProfileFace photo={photo} onPress={onProfile} />
        </View>
      ) : null}
    </View>
  );
}

/**
 * Top header as a floating glass pill: logo + wordmark, search, bell, profile.
 * `floating` lays it over the page so content scrolls underneath it; pair it with
 * `useGlassHeaderPad()` as the scroll content's top padding.
 * Pass `scrollY` to melt: full pill → face chip → gone. Used only where the
 * caller opts in (LEP registered home).
 */
export default function GlassHeader({
  onSearch,
  onNotifications,
  onProfile,
  photo,
  showSearch = true,
  showProfile = true,
  floating = false,
  insetTop = true,
  scrollY,
  inert = false,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const bell = onNotifications || (() => openNotifications(navigation));
  const top = insetTop ? Math.max(insets.top, 8) : 8;
  const melting = !!scrollY;
  const [barW, setBarW] = useState(0);

  const pillW =
    melting && barW > 0
      ? scrollY.interpolate({ inputRange: [0, 48], outputRange: [barW, 52], extrapolate: 'clamp' })
      : '100%';
  const pillH = melting
    ? scrollY.interpolate({ inputRange: [0, 48], outputRange: [PILL_H, 36], extrapolate: 'clamp' })
    : PILL_H;
  const pillR = melting
    ? scrollY.interpolate({ inputRange: [0, 48], outputRange: [PILL_H / 2, 18], extrapolate: 'clamp' })
    : PILL_H / 2;
  const chromeOp = melting
    ? scrollY.interpolate({ inputRange: [0, 28], outputRange: [1, 0], extrapolate: 'clamp' })
    : 1;
  const wrapOp = melting
    ? scrollY.interpolate({ inputRange: [56, 118], outputRange: [1, 0], extrapolate: 'clamp' })
    : 1;
  const wrapY = melting
    ? scrollY.interpolate({ inputRange: [56, 118], outputRange: [0, -18], extrapolate: 'clamp' })
    : 0;

  const Pill = melting ? Animated.View : View;
  const Wrap = melting ? Animated.View : View;

  return (
    <Wrap
      pointerEvents={inert ? 'none' : 'box-none'}
      style={[
        { paddingTop: top + GAP_TOP, paddingHorizontal: SIDE, paddingBottom: floating ? 0 : 10 },
        floating && { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 30, elevation: 30 },
        melting && { opacity: wrapOp, transform: [{ translateY: wrapY }] },
      ]}
    >
      {floating ? (
        // Keeps the clock and battery readable while content scrolls past the pill.
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(245,242,232,0.96)', 'rgba(245,242,232,0.7)', 'rgba(245,242,232,0)']}
          locations={[0, 0.55, 1]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: top + GAP_TOP + PILL_H / 2 }}
        />
      ) : null}
      <View
        onLayout={(e) => {
          if (!melting) return;
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - barW) > 1) setBarW(w);
        }}
      >
      <Pill
        style={[
          {
            height: melting ? pillH : PILL_H,
            borderRadius: melting ? pillR : PILL_H / 2,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: GLASS_EDGE,
            alignSelf: melting ? 'flex-end' : 'stretch',
            ...PILL_SHADOW,
          },
          melting ? { width: pillW } : null,
        ]}
      >
        <Glass />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12,
            paddingRight: 8,
          }}
        >
          {melting ? (
            <>
              <Animated.View
                pointerEvents="box-none"
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 52,
                  top: 0,
                  bottom: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: chromeOp,
                }}
              >
                <BrandMark />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {showSearch ? <GhostIcon name="search" onPress={onSearch} label="Search" /> : null}
                  <GhostIcon name="notifications-none" onPress={bell} label="Notifications" badge />
                </View>
              </Animated.View>
              {showProfile ? (
                <View style={{ marginLeft: 'auto' }}>
                  <ProfileFace photo={photo} onPress={onProfile} />
                </View>
              ) : null}
            </>
          ) : (
            <>
              <BrandMark />
              <HeaderActions
                onSearch={onSearch}
                onNotifications={bell}
                onProfile={onProfile}
                photo={photo}
                showSearch={showSearch}
                showProfile={showProfile}
              />
            </>
          )}
        </View>
      </Pill>
      </View>
    </Wrap>
  );
}

/**
 * Inner-screen header in the same glass: back button, title + subline, optional right slot.
 * Anything placed in `right` sits on dark glass, so use light colours there.
 */
export function GlassBackBar({ title, sub, onBack, right }) {
  return (
    <View style={{ paddingHorizontal: SIDE, paddingTop: GAP_TOP, paddingBottom: 10 }}>
      <View
        style={{
          height: PILL_H,
          borderRadius: PILL_H / 2,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: GLASS_EDGE,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0 10px 24px rgba(17,55,68,0.22)' }
            : {
                shadowColor: '#113744',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.22,
                shadowRadius: 14,
                elevation: 10,
              }),
        }}
      >
        <Glass />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 12 }}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={4}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(245,242,232,0.24)' : 'rgba(245,242,232,0.12)',
            })}
          >
            <MaterialIcons name="arrow-back" size={20} color={CREAM} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
            <ILText role="label" color={CREAM} numberOfLines={1} style={{ fontSize: 15, lineHeight: 19 }}>
              {title}
            </ILText>
            {sub ? (
              <ILText
                role="bodySm"
                color="rgba(245,242,232,0.65)"
                numberOfLines={1}
                style={{ fontSize: 12, lineHeight: 16, marginTop: 1 }}
              >
                {sub}
              </ILText>
            ) : null}
          </View>
          {right || null}
        </View>
      </View>
    </View>
  );
}
