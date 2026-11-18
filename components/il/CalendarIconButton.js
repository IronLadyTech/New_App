import React from 'react';
import { Linking, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from './Press';
import { armyEventCalendarUrl } from '../../utils/armyEventCalendar';

/** Round calendar icon on an event row: saves that event to her phone calendar. */
export default function CalendarIconButton({ event, color = '#E52A2A', size = 40 }) {
  const add = () => {
    const url = armyEventCalendarUrl(event);
    if (url) Linking.openURL(url).catch(() => {});
  };
  return (
    <Pressable
      onPress={add}
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
