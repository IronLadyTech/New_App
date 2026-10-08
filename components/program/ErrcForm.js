import React from 'react';
import { Platform, TextInput, View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import ILLogoMark from '../il/ILLogoMark';
import { G, af } from '../../constants/guestTheme';
import {
  ERRC_COLUMNS,
  ERRC_HANDBOOK_ROW_COUNT,
} from '../../constants/lepFormTemplates';

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

function SheetInput({ value, onChangeText, label, minHeight = 36, center = false }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
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

function PartitionTitle({ children }) {
  return (
    <ILText
      role="label"
      color={G.ink}
      style={{
        fontFamily: IL_FONTS.semibold,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      {children}
    </ILText>
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

/** Partition 1 — horizontal handbook table (full width, no sideways scroll). */
function HandbookTable({ rows, setCell }) {
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

/** Partition 2 — vertical row-by-row (previous layout). */
function HandbookRows({ rows, setCell }) {
  return (
    <View>
      {rows.slice(0, ERRC_HANDBOOK_ROW_COUNT).map((row, i) => (
        <View
          key={`hr-${i}`}
          style={{
            marginBottom: 14,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: G.line,
          }}
        >
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginBottom: 8 }]}>
            Row {i + 1}
          </ILText>
          {HANDBOOK_FIELDS.map((field) => (
            <View key={field.key} style={{ marginBottom: 10 }}>
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 12, lineHeight: 16 }}>
                {field.label}
              </ILText>
              <View
                style={{
                  marginTop: 4,
                  borderWidth: 1,
                  borderColor: G.line,
                  borderRadius: 8,
                  backgroundColor: G.white,
                  paddingHorizontal: 4,
                }}
              >
                <SheetInput
                  value={row[field.key] || ''}
                  onChangeText={(v) => setCell(i, field.key, v)}
                  label={`Row ${i + 1} ${field.label}`}
                  minHeight={field.minHeight}
                />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Partition 3 — classic ERRC grid (7 activities × Eliminate / Reduce / Raise / Create). */
function ActivityGrid({ activities, setActivityCell }) {
  const cols = ERRC_COLUMNS.map((label) => ({ key: label, label, flex: 2 }));

  return (
    <View style={{ borderWidth: 1, borderColor: G.ink }}>
      <View style={{ flexDirection: 'row', backgroundColor: G.dark }}>
        <View style={{ flex: 4, padding: 8, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' }}>
          <ILText role="label" color="#fff" style={{ fontSize: 11, fontFamily: IL_FONTS.semibold }}>
            Tasks
          </ILText>
        </View>
        {cols.map((col) => (
          <View
            key={col.key}
            style={{
              flex: col.flex,
              padding: 6,
              borderRightWidth: 1,
              borderRightColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
            }}
          >
            <ILText
              role="label"
              color="#fff"
              style={{ fontSize: 10, textAlign: 'center', fontFamily: IL_FONTS.semibold }}
            >
              {col.label}
            </ILText>
          </View>
        ))}
      </View>
      {activities.map((row, i) => (
        <View key={row.activity} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: G.ink }}>
          <View
            style={{
              flex: 4,
              padding: 8,
              backgroundColor: G.mutedFill,
              borderRightWidth: 1,
              borderRightColor: G.line,
              justifyContent: 'center',
            }}
          >
            <ILText role="bodySm" color={G.ink} style={{ fontSize: 12, lineHeight: 16, fontFamily: IL_FONTS.semibold }}>
              {row.activity}
            </ILText>
          </View>
          {cols.map((col) => (
            <View
              key={col.key}
              style={{
                flex: col.flex,
                borderRightWidth: 1,
                borderRightColor: G.line,
                backgroundColor: G.white,
                minHeight: 52,
              }}
            >
              <SheetInput
                value={row[col.key] || ''}
                onChangeText={(v) => setActivityCell(i, col.key, v)}
                label={`${row.activity} — ${col.label}`}
                minHeight={48}
                center
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ErrcForm({ form, setForm }) {
  const rows = form.rows || [];
  const activities = form.activities || [];

  const setCell = (rowIndex, key, value) => {
    setForm((prev) => {
      const next = [...(prev.rows || [])];
      next[rowIndex] = { ...next[rowIndex], [key]: value };
      return { ...prev, week: prev.week || 1, rows: next };
    });
  };

  const setActivityCell = (rowIndex, key, value) => {
    setForm((prev) => {
      const next = [...(prev.activities || [])];
      next[rowIndex] = { ...next[rowIndex], [key]: value };
      return { ...prev, activities: next };
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
        Sections 1 and 2 are the same Week 1 handbook — edit in the table or row by row. Section 3
        is the ERRC activity grid. Complete any one section to submit.
      </ILText>

      {/* Partition 1 — horizontal table */}
      <View
        style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: G.line,
        }}
      >
        <PartitionTitle>1 · Table view (horizontal)</PartitionTitle>
        <HandbookTable rows={rows} setCell={setCell} />
      </View>

      {/* Partition 2 — vertical rows */}
      <View
        style={{
          marginBottom: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: G.line,
        }}
      >
        <PartitionTitle>2 · Row by row (vertical)</PartitionTitle>
        <HandbookRows rows={rows} setCell={setCell} />
      </View>

      {/* Partition 3 — classic ERRC activity grid */}
      <View>
        <PartitionTitle>3 · ERRC activities (Eliminate · Reduce · Raise · Create)</PartitionTitle>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12, lineHeight: 17, marginBottom: 10 }}>
          For each activity, write what you will Eliminate, Reduce, Raise and Create.
        </ILText>
        <ActivityGrid activities={activities} setActivityCell={setActivityCell} />
      </View>
    </View>
  );
}
