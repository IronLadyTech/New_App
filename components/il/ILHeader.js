import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import ILLogoMark from './ILLogoMark';
import ILText from './ILText';

function CircleIcon({ name, onPress, label, badge }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: IL_BRAND.white,
        borderWidth: 1,
        borderColor: IL_BRAND.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={name} size={20} color={IL_BRAND.forest} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: IL_BRAND.red,
          }}
        />
      ) : null}
    </Pressable>
  );
}

export default function ILHeader({
  onSearch,
  onNotifications,
  onProfile,
  photoUrl,
  insetTop = true,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: IL_BRAND.cream,
        paddingTop: insetTop ? Math.max(insets.top, 8) : 8,
        paddingHorizontal: IL_SPACE.page,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: IL_SPACE.header + (insetTop ? insets.top : 0),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ILLogoMark size={36} />
        <ILText role="wordmark" color={IL_BRAND.forest} style={{ marginLeft: 10 }}>
          Iron Lady
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ marginRight: 8 }}>
          <CircleIcon name="search" onPress={onSearch} label="Search" />
        </View>
        <View style={{ marginRight: 8 }}>
          <CircleIcon
            name="notifications-none"
            onPress={onNotifications}
            label="Notifications"
            badge
          />
        </View>
        <Pressable onPress={onProfile} accessibilityRole="button" accessibilityLabel="Profile">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: IL_BRAND.forest,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="person" size={20} color={IL_BRAND.white} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
