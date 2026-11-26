import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from './Press';
import ILText from './ILText';
import { G } from '../../constants/guestTheme';
import { RedCta } from '../../screens/lep/LepBits';
import { addToCalendar, calendarKeyFromUrl, isCalendarAdded, useCalendarAdded } from '../../utils/calendarAdd';

const GREEN = '#1B7A4A';
const GREEN_BG = '#E8F6EE';

/** Small green "In your calendar" — what an add button becomes once used. Tap to add again. */
export function InCalendarChip({ url, align = 'center', style }) {
  return (
    <Pressable
      onPress={() => addToCalendar(url)}
      accessibilityRole="button"
      accessibilityLabel="In your calendar. Tap to add it again"
      hitSlop={8}
      style={[{ alignSelf: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }, style]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: GREEN_BG,
        }}
      >
        <MaterialIcons name="check-circle" size={16} color={GREEN} />
        <ILText role="label" color={GREEN} style={{ marginLeft: 6, fontSize: 12 }}>
          In your calendar
        </ILText>
      </View>
    </Pressable>
  );
}

/**
 * Next session on Home: "Add to calendar" until it is in her calendar; then a green tick for it
 * and the button moves on to the next session she has not added yet.
 */
export function SessionCalendarAdd({ url, later = [], onFail }) {
  const added = useCalendarAdded(url);
  const add = (u) =>
    addToCalendar(u).then((ok) => {
      if (!ok && onFail) onFail();
    });
  if (!url || !added) {
    return (
      <View style={{ marginTop: 16 }}>
        <RedCta label="Add to calendar" icon="event" onPress={() => (url ? add(url) : onFail && onFail())} />
      </View>
    );
  }
  const next = later.find((s) => !isCalendarAdded(calendarKeyFromUrl(s.calendarUrl)));
  return (
    <View style={{ marginTop: 14 }}>
      <InCalendarChip url={url} align="left" />
      {next ? (
        <View style={{ marginTop: 12 }}>
          <RedCta label={`Add next: ${next.title}`} icon="event" onPress={() => add(next.calendarUrl)} />
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12, textAlign: 'center' }}>
            {next.when}
          </ILText>
        </View>
      ) : later.length ? (
        <ILText role="bodySm" color={GREEN} style={{ marginTop: 8, fontSize: 13 }}>
          All your coming sessions are in your calendar.
        </ILText>
      ) : null}
    </View>
  );
}

/**
 * "Add to calendar" that remembers: before — the usual button (red, dark or outline);
 * after — the small green chip.
 */
export default function AddToCalendarButton({ url, label = 'Add to calendar', variant = 'red', align, disabled, style }) {
  const added = useCalendarAdded(url);
  if (!url) return null;
  if (added) return <InCalendarChip url={url} align={align} style={style} />;
  if (variant === 'red') {
    return (
      <View style={style}>
        <RedCta label={label} icon="event" onPress={disabled ? undefined : () => addToCalendar(url)} />
      </View>
    );
  }
  const dark = variant === 'dark';
  return (
    <Pressable
      onPress={() => addToCalendar(url)}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        {
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: dark ? 14 : 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dark ? G.dark : G.white,
          borderWidth: dark ? 0 : 1,
          borderColor: G.dash,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      <MaterialIcons name="event" size={16} color={dark ? '#FFFFFF' : G.ink} style={{ marginRight: 6 }} />
      <ILText role="label" color={dark ? '#FFFFFF' : G.ink} style={{ fontSize: 13 }}>
        {label}
      </ILText>
    </Pressable>
  );
}
