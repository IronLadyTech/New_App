/** Small form kit for the web admin. Plain RN so it renders through react-native-web. */
import React from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import Pressable from '../../components/il/Press';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';

export const A = {
  page: '#F6F4EF',
  card: '#FFFFFF',
  line: '#E6E1D7',
  ink: IL_BRAND.ink,
  muted: IL_BRAND.muted,
  navy: IL_BRAND.navy,
  red: '#ED1D24',
  danger: '#C41E21',
  ok: '#1A6B4A',
  chip: '#F1EEE7',
};

export function T({ size = 14, weight = 'regular', color = A.ink, style, children, ...rest }) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: IL_FONTS[weight] || IL_FONTS.regular, fontSize: size, color, lineHeight: size * 1.45 }, style]}
    >
      {children}
    </Text>
  );
}

export function H({ children, style }) {
  return (
    <Text style={[{ fontFamily: IL_FONTS.display, fontSize: 26, color: A.ink, letterSpacing: -0.4 }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }) {
  return (
    <View
      style={[
        { backgroundColor: A.card, borderRadius: 14, borderWidth: 1, borderColor: A.line, padding: 18 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Btn({ label, onPress, kind = 'primary', disabled, loading, small, style }) {
  const bg = { primary: A.red, dark: A.navy, ghost: 'transparent', danger: 'transparent' }[kind];
  const fg = { primary: '#fff', dark: '#fff', ghost: A.ink, danger: A.danger }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: 8,
          paddingHorizontal: small ? 10 : 16,
          paddingVertical: small ? 6 : 10,
          borderWidth: kind === 'ghost' || kind === 'danger' ? 1 : 0,
          borderColor: kind === 'danger' ? '#F2C4C4' : A.line,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} style={{ marginRight: 8 }} /> : null}
      <T size={small ? 12 : 14} weight="semibold" color={fg}>
        {label}
      </T>
    </Pressable>
  );
}

export function Field({ label, hint, children, style }) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label ? (
        <T size={12} weight="semibold" color={A.muted} style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </T>
      ) : null}
      {children}
      {hint ? (
        <T size={12} color={A.muted} style={{ marginTop: 4 }}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

export function Input({ value, onChangeText, placeholder, multiline, rows = 4, editable = true, style, ...rest }) {
  return (
    <TextInput
      {...rest}
      value={value == null ? '' : String(value)}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#A3A7B1"
      multiline={multiline}
      numberOfLines={multiline ? rows : 1}
      editable={editable}
      style={[
        {
          borderWidth: 1,
          borderColor: A.line,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 9,
          fontFamily: IL_FONTS.regular,
          fontSize: 14,
          color: A.ink,
          backgroundColor: editable ? '#fff' : A.chip,
          minHeight: multiline ? rows * 22 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          outlineStyle: 'none',
        },
        style,
      ]}
    />
  );
}

/** Native <select> on web — compact and accessible. */
export function Select({ value, onChange, options, disabled }) {
  return React.createElement(
    'select',
    {
      value: value ?? '',
      disabled,
      onChange: (e) => onChange(e.target.value),
      style: {
        border: `1px solid ${A.line}`,
        borderRadius: 8,
        padding: '9px 10px',
        fontFamily: IL_FONTS.regular,
        fontSize: 14,
        color: A.ink,
        background: disabled ? A.chip : '#fff',
        width: '100%',
      },
    },
    options.map((o) =>
      React.createElement('option', { key: o.value, value: o.value }, o.label)
    )
  );
}

export function Toggle({ value, onChange, label, disabled }) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: !!value, disabled }}
      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 18, marginBottom: 8, opacity: disabled ? 0.6 : 1 }}
    >
      <View
        style={{
          width: 34,
          height: 20,
          borderRadius: 10,
          backgroundColor: value ? A.ok : '#CFCBC2',
          padding: 2,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' }} />
      </View>
      {label ? (
        <T size={14} style={{ marginLeft: 8 }}>
          {label}
        </T>
      ) : null}
    </Pressable>
  );
}

export function Chip({ label, tone = 'neutral', onPress }) {
  const tones = {
    neutral: [A.chip, A.ink],
    red: ['#FCE8E8', A.danger],
    green: ['#E3F1EA', A.ok],
    navy: ['#E2ECEF', A.navy],
  };
  const [bg, fg] = tones[tone] || tones.neutral;
  const body = (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginRight: 6, marginBottom: 4 }}>
      <T size={12} weight="semibold" color={fg}>
        {label}
      </T>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export function Row({ children, style, gap = 12 }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap }, style]}>{children}</View>;
}

export function Col({ children, flex = 1, min = 200 }) {
  return <View style={{ flex, minWidth: min }}>{children}</View>;
}

export function Notice({ tone = 'neutral', children }) {
  const bg = tone === 'error' ? '#FCE8E8' : tone === 'ok' ? '#E3F1EA' : '#EEF3F5';
  const fg = tone === 'error' ? A.danger : tone === 'ok' ? A.ok : A.navy;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 8, padding: 12, marginBottom: 14 }}>
      <T size={13} color={fg}>
        {children}
      </T>
    </View>
  );
}
