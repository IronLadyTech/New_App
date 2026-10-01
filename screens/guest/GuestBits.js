import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GlassBackBar } from '../../components/il/GlassHeader';

export function Page({ children }) {
  return <View style={{ flex: 1, backgroundColor: G.page }}>{children}</View>;
}

export function RedOrb({ size = 144 }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        right: -40,
        top: -40,
        backgroundColor: 'rgba(237,29,36,0.25)',
      }}
    />
  );
}

export function DarkCard({ children, style }) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          backgroundColor: G.dark,
          padding: 20,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <RedOrb />
      {children}
    </View>
  );
}

export function Kicker({ children, onDark }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: onDark ? 'rgba(255,255,255,0.10)' : 'rgba(237,29,36,0.10)',
      }}
    >
      <ILText
        role="eyebrow"
        color={onDark ? '#FFFFFF' : G.cta}
        style={[af, { fontSize: 10, lineHeight: 13, letterSpacing: 1.2 }]}
      >
        {children}
      </ILText>
    </View>
  );
}

export function SectionHead({ title, accent }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <ILText
        role="title"
        color={G.ink}
        style={{ fontFamily: IL_FONTS.display, fontSize: 19, lineHeight: 24, letterSpacing: -0.3, flex: 1 }}
      >
        {title}
      </ILText>
      {accent ? (
        <ILText role="label" color={G.cta} style={[af, { fontSize: 11, lineHeight: 14, marginLeft: 8 }]}>
          {accent}
        </ILText>
      ) : null}
    </View>
  );
}

export function WhiteCard({ children, style, dashed, onPress }) {
  const inner = (
    <View
      style={[
        {
          backgroundColor: dashed ? 'rgba(247,246,228,0.60)' : G.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: dashed ? G.dash : G.line,
          borderStyle: dashed ? 'dashed' : 'solid',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {inner}
    </Pressable>
  );
}

export function FindCta({ kicker, title, body, onPress }) {
  return (
    <View
      style={{
        marginTop: 24,
        borderRadius: 24,
        backgroundColor: G.pink,
        padding: 20,
      }}
    >
      {kicker ? (
        <ILText
          role="eyebrow"
          color={G.cta}
          style={[af, { fontSize: 10, lineHeight: 13, letterSpacing: 1.4 }]}
        >
          {kicker}
        </ILText>
      ) : null}
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: kicker ? 8 : 0, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
      >
        {title}
      </ILText>
      <ILText
        role="bodySm"
        color={G.cta}
        style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}
      >
        {body}
      </ILText>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Find my registration"
        style={({ pressed }) => ({
          marginTop: 16,
          width: '100%',
          paddingVertical: 14,
          borderRadius: 999,
          backgroundColor: G.dark,
          alignItems: 'center',
          opacity: pressed ? 0.92 : 1,
        })}
      >
        <ILText role="label" color="#FFFFFF" style={{ fontSize: 14, lineHeight: 18 }}>
          Find my registration
        </ILText>
      </Pressable>
    </View>
  );
}

export function PillRow({ items, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {items.map((item) => {
        const active = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange?.(item)}
            style={{
              marginRight: 8,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: active ? G.cta : G.white,
              borderWidth: 1,
              borderColor: active ? G.cta : G.line,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ILText
                role="label"
                color={active ? '#FFFFFF' : G.ink}
                style={[af, { fontSize: 12, lineHeight: 16 }]}
              >
                {item}
              </ILText>
              {active ? (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: '#FFFFFF',
                    marginLeft: 6,
                  }}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ActionLabel({ children }) {
  return (
    <ILText role="label" color={G.cta} style={[af, { fontSize: 11, lineHeight: 14 }]}>
      {children}
    </ILText>
  );
}

export const fillAbs = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };

const tabular = { fontVariant: ['tabular-nums'] };

/** Big proof figures — Playfair 600, lining/tabular, as in the approval mockups. */
export function StatNum({ children, color = G.ink, size = 26, style }) {
  return (
    <ILText
      role="display"
      color={color}
      style={[
        tabular,
        {
          fontFamily: IL_FONTS.display,
          fontSize: size,
          lineHeight: size + 4,
          letterSpacing: -0.5,
        },
        style,
      ]}
    >
      {children}
    </ILText>
  );
}

/** Principle / step indices (01, 02) — Playfair 600 roman, as in the MC grid. */
export function StepNum({ children, color = G.cta, size = 20, style }) {
  return (
    <ILText
      role="display"
      color={color}
      style={[
        tabular,
        {
          fontFamily: IL_FONTS.display,
          fontSize: size,
          lineHeight: size + 4,
          letterSpacing: -0.3,
        },
        style,
      ]}
    >
      {children}
    </ILText>
  );
}

/** Q1–Q4 — Playfair 600 italic. */
export function QuarterNum({ children, color = G.ink, size = 24, style }) {
  return (
    <ILText
      role="display"
      color={color}
      style={[
        tabular,
        {
          fontFamily: IL_FONTS.displayItalic,
          fontSize: size,
          lineHeight: size + 4,
          letterSpacing: -0.4,
        },
        style,
      ]}
    >
      {children}
    </ILText>
  );
}

export function SerifTitle({ children, color = G.ink, size = 16, style }) {
  return (
    <ILText
      role="title"
      color={color}
      style={[
        {
          fontFamily: IL_FONTS.display,
          fontSize: size,
          lineHeight: size + 5,
          letterSpacing: -0.2,
        },
        style,
      ]}
    >
      {children}
    </ILText>
  );
}

export function WorthTrack({ value = 0.42 }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={{ height: 18, justifyContent: 'center', marginTop: 12 }}>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: '#E4E0D4' }}>
        <View
          style={{
            width: `${pct}%`,
            height: 4,
            borderRadius: 2,
            backgroundColor: G.cta,
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          left: `${pct}%`,
          marginLeft: -9,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: G.cta,
        }}
      />
    </View>
  );
}

export function PinkDisc({ name, size = 36 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: G.pink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={name} size={Math.round(size * 0.45)} color={G.cta} />
    </View>
  );
}

export function PlayDisc({ size = 48 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: G.cta,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name="play-arrow" size={Math.round(size * 0.58)} color="#FFFFFF" />
    </View>
  );
}

export function PillBtn({ label, onPress, tone = 'red', style }) {
  const bg = tone === 'red' ? G.cta : tone === 'dark' ? G.dark : tone === 'white' ? '#FFFFFF' : 'transparent';
  const color = tone === 'white' || tone === 'ghost' ? (tone === 'ghost' ? '#FFFFFF' : G.ink) : '#FFFFFF';
  const border = tone === 'ghost' ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' } : tone === 'outline' ? { borderWidth: 1, borderColor: G.cta, backgroundColor: 'transparent' } : null;
  const textColor = tone === 'outline' ? G.cta : color;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 999,
          backgroundColor: tone === 'outline' ? 'transparent' : bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: pressed ? 0.9 : 1,
        },
        border,
        style,
      ]}
    >
      <ILText role="label" color={textColor} style={{ fontSize: 14 }}>
        {label}
      </ILText>
    </Pressable>
  );
}

export function GuestBackBar(props) {
  return <GlassBackBar {...props} />;
}

/** MBW hero: thin ring, red arc Q1→Q2, Q nodes, Playfair “1 year”. */
export function YearRing({ size = 216 }) {
  const node = 30;
  const stroke = 2.5;
  const c = size / 2;
  const r = (size - node) / 2 - 2;
  const start = { x: c, y: c - r };
  const end = { x: c + r, y: c };
  const arc = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  const nodes = [
    { label: 'Q1', deg: -90, on: true },
    { label: 'Q2', deg: 0, on: false },
    { label: 'Q3', deg: 90, on: false },
    { label: 'Q4', deg: 180, on: false },
  ];

  return (
    <View style={{ width: size, height: size, marginTop: 22, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={stroke}
          fill="none"
        />
        <Path
          d={arc}
          stroke={G.cta}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      {nodes.map((n) => {
        const rad = (n.deg * Math.PI) / 180;
        const x = c + r * Math.cos(rad);
        const y = c + r * Math.sin(rad);
        return (
          <View
            key={n.label}
            style={{
              position: 'absolute',
              left: x - node / 2,
              top: y - node / 2,
              width: node,
              height: node,
              borderRadius: node / 2,
              backgroundColor: n.on ? G.cta : G.dark,
              borderWidth: n.on ? 0 : 2,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ILText
              role="label"
              color="#FFFFFF"
              style={[
                af,
                {
                  fontFamily: IL_FONTS.display,
                  fontSize: 9,
                  lineHeight: 11,
                  letterSpacing: 0.2,
                },
              ]}
            >
              {n.label}
            </ILText>
          </View>
        );
      })}
      <View style={{ alignItems: 'center', marginTop: 2 }}>
        <ILText
          role="display"
          color="#FFFFFF"
          style={{
            fontFamily: IL_FONTS.display,
            fontSize: 28,
            lineHeight: 32,
            letterSpacing: -0.6,
          }}
        >
          1 year
        </ILText>
        <ILText
          role="bodySm"
          color="rgba(255,255,255,0.62)"
          style={{ marginTop: 4, fontSize: 11, lineHeight: 14 }}
        >
          4 sessions · in person
        </ILText>
      </View>
    </View>
  );
}
