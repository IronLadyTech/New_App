import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILLogoMark from './ILLogoMark';
import ILText from './ILText';
import { G, af } from '../../constants/guestTheme';

function CircleIcon({ name, onPress, label, badge }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: G.white,
        borderWidth: 1,
        borderColor: G.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={name} size={16} color={G.ink} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: G.cta,
          }}
        />
      ) : null}
    </Pressable>
  );
}

export default function GuestHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: G.page,
        paddingTop: Math.max(insets.top, 8),
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(17,55,68,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ILLogoMark size={32} />
        <ILText
          role="wordmark"
          color={G.ink}
          style={[
            af,
            {
              marginLeft: 10,
              fontFamily: IL_FONTS.display,
              fontSize: 14,
              lineHeight: 16,
              letterSpacing: -0.2,
            },
          ]}
        >
          Iron Lady
        </ILText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ marginRight: 8 }}>
          <CircleIcon name="search" onPress={() => {}} label="Search" />
        </View>
        <View>
          <CircleIcon
            name="notifications-none"
            onPress={() => {}}
            label="Notifications"
            badge
          />
        </View>
      </View>
    </View>
  );
}
