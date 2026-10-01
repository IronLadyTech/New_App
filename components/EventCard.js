import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { formatEventWhen } from '../utils/eventVisibility';

const TYPE_LABELS = {
  general: 'Event',
  session: 'Session',
  workshop: 'Workshop',
  webinar: 'Webinar',
  deadline: 'Deadline',
};

export default function EventCard({ event }) {
  const when = formatEventWhen(event);
  const typeLabel = TYPE_LABELS[event?.type] || 'Event';
  const hasLink = Boolean(event?.linkUrl || event?.meetingUrl);

  const openLink = () => {
    const url = event.linkUrl || event.meetingUrl;
    if (url) Linking.openURL(url);
  };

  return (
    <View className="mb-3 rounded-2xl border border-ink-100 bg-white p-4">
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {typeLabel}
            {event.batchName ? ` · ${event.batchName}` : ''}
          </Text>
          <Text className="mt-1 font-semibold text-ink-900">{event.title}</Text>
        </View>
        {when ? (
          <View className="rounded-lg bg-ink-50 px-2 py-1">
            <Text className="text-xs font-medium text-ink-600">{when}</Text>
          </View>
        ) : null}
      </View>

      {event.description ? (
        <Text className="text-sm leading-5 text-ink-600">{event.description}</Text>
      ) : null}

      {hasLink ? (
        <TouchableOpacity
          onPress={openLink}
          className="mt-3 flex-row items-center self-start"
          activeOpacity={0.7}
        >
          <Ionicons name="link-outline" size={16} color={COLORS.brand} />
          <Text className="ml-1 text-sm font-medium text-brand-700">
            Open link
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
