import React from 'react';
import { Text, View } from 'react-native';

export default function WelcomeBanner({ name, role }) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View className="overflow-hidden rounded-2xl bg-brand-700 p-5">
      <Text className="text-sm font-medium text-brand-100">{greeting}</Text>
      <Text className="mt-1 text-2xl font-bold text-white">
        {name || 'Learner'}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-brand-100">
        {role === 'teacher' || role === 'admin'
          ? 'Manage courses and support your learners today.'
          : 'Pick up where you left off and keep building momentum.'}
      </Text>
      <View className="mt-3 self-start rounded-full bg-white/15 px-3 py-1">
        <Text className="text-xs font-semibold uppercase tracking-wide text-white">
          {role || 'student'}
        </Text>
      </View>
    </View>
  );
}
