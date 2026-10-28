import React, { useState } from 'react';
import { View } from 'react-native';
import Pressable from './Press';
import ILText from './ILText';
import { G } from '../../constants/guestTheme';

function Chip({ label, selected, onPress, muted }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginRight: 8,
        marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? G.dark : G.line,
        backgroundColor: muted ? 'transparent' : selected ? G.dark : G.white,
      }}
    >
      <ILText role="label" color={selected ? '#FFFFFF' : G.ink} style={{ fontSize: 12 }}>
        {label}
      </ILText>
    </Pressable>
  );
}

/** City / industry pickers or a single reflection MCQ under IL Guide whispers. */
export default function ILGuideWhisperExtras({ interactive, mcq, cityOptions = [], industryOptions = [] }) {
  const [picked, setPicked] = useState(null);

  if (interactive === 'mcq' && mcq?.options?.length) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {mcq.options.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            selected={picked === opt}
            onPress={() => setPicked(opt)}
          />
        ))}
        {picked ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12, width: '100%' }}>
            Noted — small moves compound.
          </ILText>
        ) : null}
      </View>
    );
  }

  if (interactive === 'city' && cityOptions.length) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {cityOptions.map((city, i) => (
          <View
            key={city}
            style={{
              marginRight: 8,
              marginTop: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: i === 0 ? G.mutedFill : G.white,
              borderWidth: 1,
              borderColor: G.line,
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
              {city}
            </ILText>
          </View>
        ))}
      </View>
    );
  }

  if (interactive === 'industry' && industryOptions.length) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {industryOptions.map((item, i) => (
          <View
            key={item}
            style={{
              marginRight: 8,
              marginTop: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: G.line,
              backgroundColor: i === industryOptions.length - 1 ? 'transparent' : G.white,
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 12 }}>
              {item}
            </ILText>
          </View>
        ))}
      </View>
    );
  }

  return null;
}
