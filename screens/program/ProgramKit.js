import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { useProgramNav } from '../../context/ProgramNavContext';
import { GuideFace, LepHeader, ProgramFilter } from '../lep/LepBits';
import { COVER, HERO } from '../lep/lepData';
import { useGlassHeaderPad } from '../../components/il/GlassHeader';

const PINK_TILE = '#FDECEC';

export function firstName(profile) {
  const raw = profile?.displayName || profile?.name || profile?.email || '';
  const bit = String(raw).trim().split(/[\s@]/)[0];
  return bit || 'there';
}

export function ProgramPage({ children }) {
  const insets = useSafeAreaInsets();
  const headerPad = useGlassHeaderPad();
  const { profile } = useAuth();
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: IL_BRAND.cream }}>
      <StatusBar style="dark" />
      <LepHeader
        floating
        photoUrl={profile?.photoURL}
        onProfile={() => navigation.navigate('Profile')}
        onSearch={() => navigation.navigate('Learn')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
        paddingTop: headerPad + 4,
          paddingHorizontal: IL_SPACE.page,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function FilterPills() {
  return (
    <View style={{ marginTop: 16 }}>
      <ProgramFilter />
    </View>
  );
}

export function SectionTabs() {
  const { section, setSection } = useProgramNav();
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: IL_BRAND.line,
      }}
    >
      {['Journey', 'Sessions', 'Cohort'].map((item) => {
        const on = section === item;
        return (
          <Pressable
            key={item}
            onPress={() => setSection(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingBottom: 10,
              minHeight: 36,
              borderBottomWidth: on ? 2 : 0,
              borderBottomColor: IL_BRAND.red,
            }}
          >
            <ILText role="label" color={on ? IL_BRAND.ink : IL_BRAND.muted}>
              {item}
            </ILText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DarkPanel({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: IL_BRAND.forest,
          borderRadius: 24,
          padding: 18,
          marginTop: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SoftCard({ children, style, onPress }) {
  const inner = (
    <View
      style={[
        {
          backgroundColor: IL_BRAND.white,
          borderRadius: 22,
          padding: 16,
          marginTop: 12,
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

export function SectionLabel({ title, sub, action, onAction, eyebrow, badge }) {
  return (
    <View
      style={{
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        {eyebrow ? (
          <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10, marginBottom: 4 }}>
            {eyebrow}
          </ILText>
        ) : null}
        <ILText role="title">{title}</ILText>
        {sub ? (
          <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 2 }}>
            {sub}
          </ILText>
        ) : null}
      </View>
      {badge ? (
        <View
          style={{
            backgroundColor: PINK_TILE,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            alignSelf: 'center',
          }}
        >
          <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }} numberOfLines={1}>
            {badge}
          </ILText>
        </View>
      ) : null}
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 13 }}>
            {action}
          </ILText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PhaseRow({ kicker, title, detail, note, state, onPress, last }) {
  const now = state === 'now';
  const done = state === 'done';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: IL_BRAND.line,
        backgroundColor: now ? '#FDECEC' : 'transparent',
      }}
    >
      <MaterialIcons
        name={done ? 'check-circle' : now ? 'play-circle-filled' : 'radio-button-unchecked'}
        size={22}
        color={done ? IL_BRAND.paidGreen : now ? IL_BRAND.red : IL_BRAND.dim}
      />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ILText role="eyebrow" color={now ? IL_BRAND.red : IL_BRAND.dim} style={{ fontSize: 10 }}>
          {kicker}
        </ILText>
        <ILText role="label" style={{ marginTop: 2 }}>
          {title}
        </ILText>
        {detail ? (
          <ILText role="bodySm" color={IL_BRAND.muted}>
            {detail}
          </ILText>
        ) : null}
        {note ? (
          <ILText role="bodySm" color={IL_BRAND.dim} style={{ marginTop: 4 }}>
            {note}
          </ILText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function CheckRow({ title, detail, done, tag, onPress, last = true }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ checked: !!done }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: IL_BRAND.line,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: done ? 0 : 1.5,
          borderColor: '#C8C4B6',
          backgroundColor: done ? IL_BRAND.forest : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? <MaterialIcons name="check" size={15} color="#FFFFFF" /> : null}
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <ILText
            role="label"
            color={done ? IL_BRAND.muted : IL_BRAND.ink}
            style={done ? { textDecorationLine: 'line-through' } : null}
          >
            {title}
          </ILText>
          {tag ? (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: tag === '100BM' ? '#FDECEC' : '#E7F0EA',
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <ILText
                role="eyebrow"
                color={tag === '100BM' ? IL_BRAND.red : IL_BRAND.paidGreen}
                style={{ fontSize: 9 }}
              >
                {tag}
              </ILText>
            </View>
          ) : null}
        </View>
        {detail ? (
          <ILText role="bodySm" color={IL_BRAND.muted}>
            {detail}
          </ILText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function Pill({ label, done, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: done ? '#FDECEC' : '#F3EFE8',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <ILText role="label" color={done ? IL_BRAND.red : IL_BRAND.ink} style={{ fontSize: 13 }}>
        {done ? '✓  ' : ''}
        {label}
      </ILText>
    </Pressable>
  );
}

export function DateBadge({ month, day }) {
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: IL_BRAND.red,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 9 }}>
        {month}
      </ILText>
      <ILText role="label" color="#FFFFFF" style={{ fontSize: 16, marginTop: -2 }}>
        {day}
      </ILText>
    </View>
  );
}

export function SessionRow({ badge, title, detail, action, onAction, mutedBadge }) {
  return (
    <Pressable
      onPress={onAction}
      disabled={!onAction}
      accessibilityRole={onAction ? 'button' : undefined}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
    >
      {typeof badge === 'string' ? (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: mutedBadge ? '#F3EFE8' : IL_BRAND.red,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ILText
            role="label"
            color={mutedBadge ? IL_BRAND.ink : '#FFFFFF'}
            style={{ fontSize: 12, textAlign: 'center' }}
          >
            {badge}
          </ILText>
        </View>
      ) : (
        badge
      )}
      <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
        <ILText role="label">{title}</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          {detail}
        </ILText>
      </View>
      {action ? (
        <View>
          <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 13 }}>
            {action}
          </ILText>
        </View>
      ) : null}
    </Pressable>
  );
}

export function LinkRow({ icon, title, sub, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        marginTop: 12,
        backgroundColor: IL_BRAND.white,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: IL_BRAND.forest,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="label">{title}</ILText>
        {sub ? (
          <ILText role="bodySm" color={IL_BRAND.muted}>
            {sub}
          </ILText>
        ) : null}
      </View>
      <MaterialIcons name="arrow-forward" size={20} color={IL_BRAND.red} />
    </Pressable>
  );
}

export function Whisper({ body, action, onAction }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <SoftCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <GuideFace size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ILText role="label">IL Guide’s Whisper</ILText>
          <ILText role="bodySm" color={IL_BRAND.dim}>
            Cohort Guide
          </ILText>
        </View>
        <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityLabel="Dismiss whisper">
          <MaterialIcons name="close" size={18} color={IL_BRAND.dim} />
        </Pressable>
      </View>
      <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10, marginTop: 12 }}>
        Curated with Rajesh
      </ILText>
      <ILText role="body" color={IL_BRAND.ink} style={{ marginTop: 6 }}>
        {body}
      </ILText>
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={{ marginTop: 10 }}>
          <ILText role="label" color={IL_BRAND.red}>
            {action}
          </ILText>
        </Pressable>
      ) : null}
    </SoftCard>
  );
}

export function VideoCard({ onPress, kicker = 'This week’s must-watch' }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ marginTop: 12 }}>
      <LinearGradient
        colors={['#1F3A4A', IL_BRAND.forest]}
        style={{ borderRadius: 24, padding: 16, overflow: 'hidden' }}
      >
        <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
          {kicker}
        </ILText>
        <View style={{ marginTop: 12, aspectRatio: 16 / 10, borderRadius: 16, overflow: 'hidden' }}>
          <Image source={HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              backgroundColor: IL_BRAND.red,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 9 }}>
              C-suite · must watch
            </ILText>
          </View>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: IL_BRAND.red,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="play-arrow" size={30} color="#FFFFFF" />
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              backgroundColor: 'rgba(17,55,68,0.85)',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <ILText role="bodySm" color="#FFFFFF" style={{ fontSize: 11, lineHeight: 14 }}>
              Live session
            </ILText>
          </View>
        </View>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 14 }}>
          Winning Ways for Women
        </ILText>
        <ILText role="bodySm" color="#FFFFFF" style={{ marginTop: 2 }}>
          Indra Nooyi · former CEO, PepsiCo
        </ILText>
        <View
          style={{
            marginTop: 14,
            backgroundColor: IL_BRAND.red,
            borderRadius: 999,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Watch now
          </ILText>
          <MaterialIcons name="play-arrow" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </View>
        <ILText
          role="bodySm"
          color={IL_BRAND.mutedOnDark}
          align="center"
          style={{ marginTop: 10, fontSize: 12 }}
        >
          Counts toward today’s practice once you finish it
        </ILText>
      </LinearGradient>
    </Pressable>
  );
}

export function PeopleRow({ extra, onLight }) {
  const faces = [COVER.priyanka, COVER.kamini, COVER.suma, COVER.rekha];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: onLight ? 0 : 14 }}>
      {faces.map((src, index) => (
        <Image
          key={index}
          source={src}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            marginLeft: index ? -8 : 0,
            backgroundColor: '#E8E2D6',
            borderWidth: 2,
            borderColor: onLight ? IL_BRAND.white : IL_BRAND.forest,
          }}
        />
      ))}
      <View
        style={{
          marginLeft: -8,
          height: 32,
          borderRadius: 16,
          paddingHorizontal: 8,
          backgroundColor: onLight ? '#F3EFE8' : 'rgba(255,255,255,0.16)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ILText role="label" color={onLight ? IL_BRAND.ink : '#FFFFFF'} style={{ fontSize: 12 }}>
          +{extra}
        </ILText>
      </View>
    </View>
  );
}

export function GlanceGrid({ kicker, cells }) {
  return (
    <SoftCard>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="menu-book" size={14} color={IL_BRAND.red} />
        <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10, marginLeft: 6 }}>
          {kicker}
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
        {cells.map(([label, value]) => (
          <View
            key={label}
            style={{
              width: '48%',
              flexGrow: 1,
              backgroundColor: '#F6F2EA',
              borderRadius: 14,
              padding: 12,
            }}
          >
            <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10 }}>
              {label}
            </ILText>
            <ILText role="label" style={{ marginTop: 4 }}>
              {value}
            </ILText>
          </View>
        ))}
      </View>
    </SoftCard>
  );
}

export function StreakRow({ streak, note }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FDECEC',
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <MaterialIcons name="local-fire-department" size={14} color={IL_BRAND.red} />
        <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 12, marginLeft: 4 }}>
          {streak}
        </ILText>
      </View>
      <ILText role="bodySm" color={IL_BRAND.muted} style={{ flex: 1, textAlign: 'right', marginLeft: 8 }}>
        {note}
      </ILText>
    </View>
  );
}

export function PrepTask({ title, detail, action, onPress, icon, done }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        padding: 14,
        backgroundColor: IL_BRAND.white,
        borderRadius: 20,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: done ? IL_BRAND.forest : PINK_TILE,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <MaterialIcons name={done ? 'check' : icon} size={20} color={done ? '#FFFFFF' : IL_BRAND.red} />
        </View>
      ) : null}
      <View style={{ flex: 1, paddingRight: 12 }}>
        <ILText role="label">{title}</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          {detail}
        </ILText>
      </View>
      <ILText role="label" color={done ? IL_BRAND.paidGreen : IL_BRAND.red}>
        {done ? 'Done' : action}
      </ILText>
    </Pressable>
  );
}

const TAG_TONE = {
  LEP: ['#E7F0EA', IL_BRAND.paidGreen],
  '100BM': [PINK_TILE, IL_BRAND.red],
  MBW: ['#E6EEF2', IL_BRAND.forest],
};

/** Due this week: one row per deliverable, program tag + task kind, due day on the right (urgent = pink pill). */
export function DueWeek({ items, sub = 'This week', onSchedule }) {
  return (
    <>
      <SectionLabel title="Due this week" sub={sub} action={onSchedule ? 'See schedule' : null} onAction={onSchedule} />
      <SoftCard style={{ paddingVertical: 2, paddingHorizontal: 14 }}>
        {items.map((item, i) => {
          const [tagBg, tagFg] = TAG_TONE[item.tag] || TAG_TONE.LEP;
          return (
            <Pressable
              key={item.title}
              onPress={item.onPress}
              disabled={!item.onPress}
              accessibilityRole={item.onPress ? 'button' : undefined}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: IL_BRAND.line,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: PINK_TILE,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name={item.icon} size={19} color={IL_BRAND.red} />
              </View>
              <View style={{ flex: 1, marginLeft: 12, paddingRight: 8 }}>
                <ILText role="label">{item.title}</ILText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                  <View style={{ backgroundColor: tagBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 6 }}>
                    <ILText role="eyebrow" color={tagFg} style={{ fontSize: 9, letterSpacing: 0.4 }}>
                      {item.tag}
                    </ILText>
                  </View>
                  <ILText role="bodySm" color={IL_BRAND.muted} style={{ flexShrink: 1 }}>
                    {item.kind}
                  </ILText>
                </View>
              </View>
              {item.urgent ? (
                <View style={{ backgroundColor: PINK_TILE, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 12 }}>
                    {item.due}
                  </ILText>
                </View>
              ) : (
                <ILText role="bodySm" color={IL_BRAND.ink} style={{ fontSize: 12 }}>
                  {item.due}
                </ILText>
              )}
            </Pressable>
          );
        })}
      </SoftCard>
    </>
  );
}

export function BarButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        marginTop: 14,
        backgroundColor: IL_BRAND.forest,
        borderRadius: 999,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ILText role="label" color="#FFFFFF">
        {label}
      </ILText>
    </Pressable>
  );
}
