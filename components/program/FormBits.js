import React from 'react';
import { Platform, TextInput, View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import Pressable from '../il/Press';
import { G, af } from '../../constants/guestTheme';

export function SectionTitle({ children, first }) {
  return (
    <ILText
      role="label"
      color={G.ink}
      style={{
        marginTop: first ? 4 : 20,
        marginBottom: 10,
        fontFamily: IL_FONTS.semibold,
        fontSize: 15,
      }}
    >
      {children}
    </ILText>
  );
}

export function PlainInput({ value, onChangeText, placeholder, minHeight = 72, style, onFocus }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      placeholder={placeholder || 'Write here'}
      placeholderTextColor="#B8B4A8"
      multiline
      textAlignVertical="top"
      style={[
        {
          marginTop: 8,
          minHeight,
          fontFamily: IL_FONTS.regular,
          fontSize: 15,
          lineHeight: 22,
          color: G.ink,
          borderWidth: 1,
          borderColor: G.line,
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: G.white,
          ...(Platform.OS === 'web' ? { outlineStyle: 'none', cursor: 'text' } : null),
        },
        style,
      ]}
    />
  );
}

export function Field({ label, value, onChangeText, placeholder, minHeight = 56, onFocus }) {
  return (
    <View style={{ marginTop: 12 }}>
      <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
        {label}
      </ILText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder || 'Write here'}
        placeholderTextColor="#B8B4A8"
        multiline
        textAlignVertical="top"
        editable
        style={{
          marginTop: 6,
          minHeight,
          fontFamily: IL_FONTS.regular,
          fontSize: 15,
          lineHeight: 22,
          color: G.ink,
          borderWidth: 1,
          borderColor: G.line,
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: G.white,
          ...(Platform.OS === 'web' ? { outlineStyle: 'none', cursor: 'text' } : null),
        }}
      />
    </View>
  );
}

export function YesNoPick({ value, onChange, label }) {
  return (
    <View style={{ marginTop: 8 }}>
      {label ? (
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12, marginBottom: 6 }}>
          {label}
        </ILText>
      ) : null}
      <View style={{ flexDirection: 'row' }}>
        {['Yes', 'No'].map((opt, i) => {
          const on = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 999,
                backgroundColor: on ? G.dark : G.mutedFill,
                marginRight: i === 0 ? 8 : 0,
              }}
            >
              <ILText role="label" color={on ? '#FFFFFF' : G.meta} style={{ fontSize: 13 }}>
                {opt}
              </ILText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
