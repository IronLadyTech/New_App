import React from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import { ilShadow } from './ilShadow';
import ILText from './ILText';

export default function ILButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  arrow = true,
  style,
}) {
  const primary = variant === 'primary';
  const ghost = variant === 'ghost';
  const dark = variant === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        {
          minHeight: IL_SPACE.tap + 8,
          borderRadius: IL_SPACE.pill,
          paddingHorizontal: 22,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || loading ? 0.55 : pressed ? 0.92 : 1,
          backgroundColor: primary
            ? IL_BRAND.red
            : dark
              ? IL_BRAND.forest
              : 'transparent',
          borderWidth: ghost ? 1 : 0,
          borderColor: ghost ? 'rgba(255,255,255,0.28)' : 'transparent',
        },
        primary ? ilShadow(1) : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={IL_BRAND.white} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ILText
            role="button"
            color={primary || dark || ghost ? IL_BRAND.white : IL_BRAND.ink}
          >
            {label}
          </ILText>
          {arrow ? (
            <MaterialIcons
              name="arrow-forward"
              size={18}
              color={IL_BRAND.white}
              style={{ marginLeft: 8, marginTop: Platform.OS === 'ios' ? 1 : 0 }}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
