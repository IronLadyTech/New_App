import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import GlassHeader from '../../components/il/GlassHeader';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { FACE } from './lepData';

export { Page, WhiteCard, SectionHead, StatNum, SerifTitle, PillRow } from '../guest/GuestBits';
export { GuestBackBar } from '../guest/GuestBits';

export function LepHeader({ photoUrl, onSearch, onNotifications, onProfile, floating = false }) {
  return (
    <GlassHeader
      onSearch={onSearch}
      onNotifications={onNotifications}
      onProfile={onProfile}
      photo={photoUrl ? { uri: photoUrl } : FACE}
      floating={floating}
    />
  );
}

export function DarkHero({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: G.dark,
          borderRadius: 28,
          padding: 20,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CoverThumb({ source, height, play, time, radius = 0 }) {
  return (
    <View
      style={{
        height: height === '100%' || height == null ? undefined : height,
        flex: height === '100%' || height == null ? 1 : undefined,
        width: '100%',
        borderRadius: radius,
        overflow: 'hidden',
        backgroundColor: G.dark,
      }}
    >
      <Image source={source} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
      {play ? (
        <View
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: G.cta,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
        </View>
      ) : null}
      {time ? (
        <View
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            backgroundColor: 'rgba(17,55,68,0.88)',
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 3,
          }}
        >
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 8 }]}>
            {time}
          </ILText>
        </View>
      ) : null}
    </View>
  );
}

export function SoftChip({ children, onDark, icon }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: onDark ? 'rgba(255,255,255,0.10)' : G.mutedFill,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      {icon ? <MaterialIcons name={icon} size={12} color={onDark ? G.pink : G.cta} style={{ marginRight: 6 }} /> : null}
      <ILText role="eyebrow" color={onDark ? G.pink : G.cta} style={[af, { fontSize: 10, letterSpacing: 0.8 }]}>
        {children}
      </ILText>
    </View>
  );
}

export function RedCta({ label, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: G.cta,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        opacity: pressed ? 0.92 : 1,
      })}
    >
      {icon ? <MaterialIcons name={icon} size={16} color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
      <ILText role="label" color="#FFFFFF">
        {label}
      </ILText>
    </Pressable>
  );
}

export function GuideFace({ size = 40 }) {
  const badge = Math.round(size * 0.42);
  return (
    <View style={{ width: size, height: size }}>
      <Image source={FACE} style={{ width: size, height: size, borderRadius: size / 2 }} />
      <View
        style={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: badge,
          height: badge,
          borderRadius: badge / 2,
          backgroundColor: G.pink,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: G.white,
        }}
      >
        <MaterialIcons name="auto-awesome" size={Math.max(8, badge - 8)} color={G.cta} />
      </View>
    </View>
  );
}

export function WhisperCard({ quote, onPress, onDismiss }) {
  return (
    <View style={{ backgroundColor: G.white, borderRadius: 22, padding: 16, flexDirection: 'row' }}>
      <GuideFace size={44} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="label" color={G.ink} style={[af, { fontSize: 13 }]}>
          IL Guide’s Whisper
          <ILText role="bodySm" color={G.meta}>
            {'  '}· Cohort Guide
          </ILText>
        </ILText>
        <ILText role="body" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          “{quote}”
        </ILText>
        {onPress ? (
          <Pressable onPress={onPress} style={{ marginTop: 10 }}>
            <ILText role="label" color={G.cta} style={[af, { fontSize: 13 }]}>
              Open →
            </ILText>
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <MaterialIcons name="close" size={16} color={G.meta} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function CheckRow({ item, last, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        paddingVertical: 14,
        borderTopWidth: last ? 0 : 0,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: G.line,
        alignItems: 'flex-start',
      }}
    >
      <MaterialIcons
        name={item.done ? 'check-circle' : 'radio-button-unchecked'}
        size={22}
        color={item.done ? G.ink : '#C8C4B6'}
      />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ILText role="label" color={G.ink} style={[af, { fontSize: 14, lineHeight: 20 }]}>
          {item.title}
        </ILText>
        {item.meta ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
            {item.meta}
          </ILText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function FilterBar({ items, value, onChange, dark }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: dark ? undefined : G.mutedFill,
        borderRadius: 999,
        padding: 4,
      }}
    >
      {items.map((item) => {
        const on = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={{
              flex: 1,
              minHeight: 36,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? G.dark : 'transparent',
            }}
          >
            <ILText role="label" color={on ? '#FFFFFF' : G.meta} style={[af, { fontSize: 13 }]}>
              {item}
            </ILText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function UnderlineTabs({ items, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: G.line }}>
      {items.map((item) => {
        const on = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingBottom: 10,
              borderBottomWidth: on ? 2 : 0,
              borderBottomColor: G.cta,
            }}
          >
            <ILText role="label" color={on ? G.ink : G.meta}>
              {item}
            </ILText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressDark({ kicker, title, percent, foot, right }) {
  return (
    <View style={{ backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
          {kicker}
        </ILText>
        <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
          {right || `${percent}%`}
        </ILText>
      </View>
      <ILText
        role="display"
        color="#FFFFFF"
        style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
      >
        {title}
      </ILText>
      <View
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.16)',
          marginTop: 14,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: `${percent}%`, height: 4, backgroundColor: G.cta, borderRadius: 2 }} />
      </View>
      {foot ? (
        <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: 12, fontSize: 13 }}>
          {foot}
        </ILText>
      ) : null}
    </View>
  );
}

export function LinkRow({ label, onPress, color = G.cta }) {
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <ILText role="label" color={color} style={[af, { fontSize: 13 }]}>
        {label}
      </ILText>
    </Pressable>
  );
}

export function Seal({ icon = 'verified' }) {
  return (
    <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 128,
          height: 128,
          borderRadius: 28,
          backgroundColor: 'rgba(237,29,36,0.28)',
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 22,
          backgroundColor: G.cta,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '45deg' }],
        }}
      >
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <MaterialIcons name={icon} size={34} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
}
