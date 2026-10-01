import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import ILHeader from '../../components/il/ILHeader';
import ILText from '../../components/il/ILText';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { PROGRAM_FILTERS, useProgramNav } from '../../context/ProgramNavContext';

export function firstName(profile) {
  const raw = profile?.displayName || profile?.name || profile?.email || '';
  const bit = String(raw).trim().split(/[\s@]/)[0];
  return bit || 'there';
}

export function ProgramPage({ children }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: IL_BRAND.cream }}>
      <StatusBar style="dark" />
      <ILHeader
        photoUrl={profile?.photoURL}
        onProfile={() => navigation.navigate('Profile')}
        onNotifications={() => navigation.navigate('Engage')}
        onSearch={() => navigation.navigate('Learn')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
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
  const { program, setProgram } = useProgramNav();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#EFEADF',
        borderRadius: 999,
        padding: 4,
        marginTop: 16,
      }}
    >
      {PROGRAM_FILTERS.map((item) => {
        const on = program === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => setProgram(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              minHeight: 36,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? IL_BRAND.forest : 'transparent',
            }}
          >
            <ILText role="label" color={on ? IL_BRAND.white : IL_BRAND.muted} style={{ fontSize: 13 }}>
              {item.label}
            </ILText>
          </Pressable>
        );
      })}
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

export function SectionLabel({ title, sub, action, onAction, eyebrow }) {
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

export function CheckRow({ title, detail, done, tag, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 }}
    >
      <MaterialIcons
        name={done ? 'check-circle' : 'radio-button-unchecked'}
        size={22}
        color={done ? IL_BRAND.paidGreen : IL_BRAND.dim}
      />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <ILText role="label">{title}</ILText>
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
      <MaterialIcons name="chevron-right" size={22} color={IL_BRAND.dim} />
    </Pressable>
  );
}

export function Whisper({ body, action, onAction }) {
  return (
    <SoftCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <ILText role="label">IL Guide’s Whisper</ILText>
          <ILText role="bodySm" color={IL_BRAND.dim}>
            Cohort Guide
          </ILText>
        </View>
        <MaterialIcons name="close" size={18} color={IL_BRAND.dim} />
      </View>
      <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10, marginTop: 10 }}>
        Curated with Rajesh
      </ILText>
      <ILText role="bodySm" color={IL_BRAND.ink} style={{ marginTop: 8 }}>
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
    <View style={{ marginTop: 12 }}>
      <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10, marginBottom: 8 }}>
        {kicker}
      </ILText>
    <Pressable onPress={onPress} accessibilityRole="button">
      <View style={{ backgroundColor: IL_BRAND.forest, borderRadius: 22, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: IL_BRAND.red,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 9 }}>
              C-suite · must watch
            </ILText>
          </View>
          <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
            Live session
          </ILText>
        </View>
        <View
          style={{
            marginTop: 18,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
        </View>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 16 }}>
          Winning Ways for Women
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.mutedOnDark}>
          Indra Nooyi · former CEO, PepsiCo
        </ILText>
        <View
          style={{
            marginTop: 14,
            backgroundColor: IL_BRAND.red,
            borderRadius: 999,
            alignSelf: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <ILText role="label" color="#FFFFFF">
            Watch now
          </ILText>
        </View>
      </View>
    </Pressable>
      <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 8 }}>
        Counts toward today’s practice once you finish it
      </ILText>
    </View>
  );
}

export function PeopleRow({ extra, onLight }) {
  const faces = [
    ['A', '#C94A38'],
    ['P', '#C9A24B'],
    ['R', '#1A6B4A'],
    ['S', '#5B6272'],
  ];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: onLight ? 0 : 14 }}>
      {faces.map(([letter, color], index) => (
        <View
          key={letter}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            marginLeft: index ? -8 : 0,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: onLight ? IL_BRAND.white : IL_BRAND.forest,
          }}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
            {letter}
          </ILText>
        </View>
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

export function PrepTask({ title, detail, action, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: IL_BRAND.line,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <ILText role="label">{title}</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          {detail}
        </ILText>
      </View>
      <ILText role="label" color={IL_BRAND.red}>
        {action}
      </ILText>
    </Pressable>
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
