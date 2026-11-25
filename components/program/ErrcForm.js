import React from 'react';
import { Platform, TextInput, View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import ILLogoMark from '../il/ILLogoMark';
import { G, af } from '../../constants/guestTheme';
import { ERRC_HANDBOOK_ROW_COUNT } from '../../constants/lepFormTemplates';

const HANDBOOK_FIELDS = [
  { key: 'task', label: 'Tasks', flex: 5, header: ['Tasks'], minHeight: 40 },
  { key: 'avgTime', label: 'Average time taken (mins)', flex: 2, header: ['Time', '(mins)'], minHeight: 32 },
  {
    key: 'initialErrc',
    label: 'Initial Identification E/R/R/C',
    flex: 2,
    header: ['E/R/R/C'],
    minHeight: 32,
  },
  {
    key: 'endStatus',
    label: 'End of the week status',
    flex: 2,
    header: ['Status'],
    minHeight: 32,
  },
];

function SheetInput({ value, onChangeText, label, minHeight = 36, center = false, onFocus }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      multiline
      textAlignVertical="top"
      textAlign={center ? 'center' : 'left'}
      accessibilityLabel={label}
      placeholderTextColor="#B8B4A8"
      style={{
        width: '100%',
        minHeight,
        paddingHorizontal: 6,
        paddingVertical: 6,
        fontFamily: IL_FONTS.regular,
        fontSize: 13,
        lineHeight: 18,
        color: G.ink,
        backgroundColor: 'transparent',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none', cursor: 'text' } : null),
      }}
    />
  );
}

function SheetHeader() {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <ILLogoMark size={48} />
      </View>
      <View
        style={{
          alignSelf: 'center',
          borderBottomWidth: 2,
          borderBottomColor: G.ink,
          paddingBottom: 2,
          marginBottom: 12,
        }}
      >
        <ILText
          role="title"
          color={G.ink}
          style={{ fontFamily: IL_FONTS.semibold, fontSize: 20, textAlign: 'center' }}
        >
          ERRC Handbook
        </ILText>
      </View>
      <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 15 }}>
        Week1:
      </ILText>
    </View>
  );
}

/** Week 1 handbook table (full width). */
function HandbookTable({ rows, setCell, onInputFocus }) {
  return (
    <View style={{ borderWidth: 1, borderColor: G.ink }}>
      <View style={{ flexDirection: 'row', backgroundColor: G.dark }}>
        {HANDBOOK_FIELDS.map((col) => (
          <View
            key={col.key}
            style={{
              flex: col.flex,
              borderRightWidth: 1,
              borderRightColor: 'rgba(255,255,255,0.2)',
              padding: 6,
              justifyContent: 'center',
              minHeight: 44,
            }}
          >
            {col.header.map((line) => (
              <ILText
                key={line}
                role="label"
                color="#fff"
                style={{ fontSize: 10, lineHeight: 13, textAlign: 'center', fontFamily: IL_FONTS.semibold }}
              >
                {line}
              </ILText>
            ))}
          </View>
        ))}
      </View>
      {rows.slice(0, ERRC_HANDBOOK_ROW_COUNT).map((row, i) => (
        <View key={`ht-${i}`} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: G.ink }}>
          {HANDBOOK_FIELDS.map((col) => (
            <View
              key={col.key}
              style={{
                flex: col.flex,
                borderRightWidth: 1,
                borderRightColor: G.line,
                backgroundColor: col.key === 'task' ? G.mutedFill : G.white,
                minHeight: col.minHeight,
              }}
            >
              <SheetInput
                value={row[col.key] || ''}
                onChangeText={(v) => setCell(i, col.key, v)}
                onFocus={onInputFocus}
                label={`Row ${i + 1} ${col.label}`}
                minHeight={col.minHeight}
                center={col.key !== 'task'}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ErrcForm({ form, setForm, onInputFocus }) {
  const rows = form.rows || [];

  const setCell = (rowIndex, key, value) => {
    setForm((prev) => {
      const next = [...(prev.rows || [])];
      next[rowIndex] = { ...next[rowIndex], [key]: value };
      return { ...prev, week: prev.week || 1, rows: next };
    });
  };

  return (
    <View
      style={{
        marginTop: 18,
        backgroundColor: G.white,
        borderWidth: 1,
        borderColor: G.line,
        borderRadius: 12,
        padding: 14,
        ...(Platform.OS === 'web' ? { maxWidth: 720, alignSelf: 'center', width: '100%' } : null),
      }}
    >
      <SheetHeader />

      <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
        Complete your Week 1 ERRC handbook table below — fill the rows you are working on before
        submitting.
      </ILText>

      <HandbookTable rows={rows} setCell={setCell} onInputFocus={onInputFocus} />
    </View>
  );
}