import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from './Press';
import { armyEventCalendarUrl } from '../../utils/armyEventCalendar';
import { addToCalendar, openAddedEvent, useCalendarAdded } from '../../utils/calendarAdd';

/**
 * Round calendar icon on an event row: saves that event to her phone calendar. Once added it
 * turns into a smaller green tick.
 */
export default function CalendarIconButton({ event, color = '#E52A2A', size = 40 }) {
  const url = armyEventCalendarUrl(event);
  const added = useCalendarAdded(url);
  if (added) {
    const s = Math.round(size * 0.72);
    return (
      <Pressable
        onPress={() => openAddedEvent(url)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`${event?.title || 'This event'} is in your calendar`}
        style={{ width: size, alignItems: 'center' }}
      >
        <View
          style={{
            width: s,
            height: s,
            borderRadius: s / 2,
            backgroundColor: '#E8F6EE',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="event-available" size={Math.round(s * 0.55)} color="#1B7A4A" />
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={() => addToCalendar(url)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Add ${event?.title || 'this event'} to calendar`}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="event" size={Math.round(size * 0.48)} color={color} />
      </View>
    </Pressable>
  );
}
