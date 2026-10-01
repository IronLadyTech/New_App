import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IL_BRAND } from '../constants/ironLadyBrand';

/**
 * Top bar — Iron Lady logo + search, notifications, profile (payment mockup).
 */
export default function IronLadyHeader({
  onSearch,
  onNotifications,
  onProfile,
  photoUrl,
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
      <View className="flex-row items-center">
        <View
          style={{ backgroundColor: IL_BRAND.red }}
          className="mr-2.5 h-9 w-9 items-center justify-center rounded-md"
        >
          <Text
            style={{ color: IL_BRAND.white, fontSize: 7, fontWeight: '800', lineHeight: 9 }}
          >
            IRON{'\n'}LADY
          </Text>
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
          onPress={onSearch}
          style={{ borderColor: IL_BRAND.divider }}
          className="h-10 w-10 items-center justify-center rounded-full border bg-white"
          accessibilityLabel="Search"
        >
          <Ionicons name="search-outline" size={20} color={IL_BRAND.forest} />
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
