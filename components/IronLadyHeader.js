import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ILLogoMark from './il/ILLogoMark';
import { IL_BRAND } from '../constants/ironLadyBrand';
import { openMemberSchedule } from './il/GlassHeader';

/**
 * Top bar — Iron Lady logo + batch calendar, notifications, profile.
 */
export default function IronLadyHeader({
  onCalendar,
  onSearch,
  onNotifications,
  onProfile,
  photoUrl,
}) {
  const navigation = useNavigation();
  const openCalendar = onCalendar || onSearch || (() => openMemberSchedule(navigation));

  return (
    <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
      <View className="flex-row items-center">
        <View className="mr-2.5">
          <ILLogoMark size={36} />
        </View>
        <Text
          style={{ color: IL_BRAND.forest, fontSize: 22, fontWeight: '600' }}
          className="tracking-tight"
        >
          Iron Lady
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={openCalendar}
          style={{ borderColor: IL_BRAND.divider }}
          className="h-10 w-10 items-center justify-center rounded-full border bg-white"
          accessibilityLabel="Batch calendar"
        >
          <Ionicons name="calendar-outline" size={20} color={IL_BRAND.forest} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNotifications}
          style={{ borderColor: IL_BRAND.divider }}
          className="h-10 w-10 items-center justify-center rounded-full border bg-white"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={20} color={IL_BRAND.forest} />
          <View
            style={{ backgroundColor: IL_BRAND.red }}
            className="absolute right-2 top-2 h-2 w-2 rounded-full"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfile} accessibilityLabel="Profile">
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} className="h-10 w-10 rounded-full" />
          ) : (
            <View
              style={{ backgroundColor: IL_BRAND.forest }}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <Ionicons name="person" size={18} color={IL_BRAND.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
