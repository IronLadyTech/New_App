import React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

/**
 * Top header as a floating glass pill: logo + wordmark, search, bell, profile.
 * `floating` lays it over the page so content scrolls underneath it; pair it with
 * `useGlassHeaderPad()` as the scroll content's top padding.
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
}) {
  const insets = useSafeAreaInsets();
  const top = insetTop ? Math.max(insets.top, 8) : 8;

  return (
    <View
      pointerEvents="box-none"
      style={[
        { paddingTop: top + GAP_TOP, paddingHorizontal: SIDE, paddingBottom: floating ? 0 : 10 },
        floating && { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 30, elevation: 30 },
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ILLogoMark size={32} />
            <ILText
              role="wordmark"
              color={CREAM}
              style={{ marginLeft: 10, fontFamily: IL_FONTS.display, fontSize: 15, lineHeight: 18 }}
            >
              Iron Lady
            </ILText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showSearch ? <GhostIcon name="search" onPress={onSearch} label="Search" /> : null}
            <GhostIcon
              name="notifications-none"
              onPress={onNotifications}
              label="Notifications"
              badge
            />
            {showProfile ? (
            <Pressable
              onPress={onProfile}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              style={{ marginLeft: 6 }}
            >
              {photo ? (
                <Image
                  source={photo}
                  style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: CREAM }}
                />
              ) : (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(245,242,232,0.16)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="person" size={20} color={CREAM} />
                </View>
              )}
            </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
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
