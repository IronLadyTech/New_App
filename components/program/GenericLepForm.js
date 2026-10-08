import React, { useMemo } from 'react';
import { View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import Pressable from '../il/Press';
import { Field } from './FormBits';

const SECTION_TINTS = [G.mutedFill, G.pink, '#E3EEF0', '#F5F0E8'];

function SectionCard({ title, hint, tint, children, index }) {
  return (
    <View
      style={{
        marginTop: index ? 14 : 0,
        borderRadius: 16,
        backgroundColor: tint || SECTION_TINTS[index % SECTION_TINTS.length],
        padding: 14,
      }}
    >
      {title ? (
        <ILText
          role="label"
          color={G.ink}
          style={{ fontFamily: IL_FONTS.semibold, fontSize: 15, marginBottom: hint ? 4 : 8 }}
        >
          {title}
        </ILText>
      ) : null}
      {hint ? (
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, lineHeight: 18, marginBottom: 8 }}>
          {hint}
        </ILText>
      ) : null}
      {children}
    </View>
  );
}

function ChoicePick({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: on ? G.dark : G.white,
              borderWidth: on ? 0 : 1,
              borderColor: G.line,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <ILText role="label" color={on ? '#FFFFFF' : G.meta} style={{ fontSize: 12 }}>
              {opt}
            </ILText>
          </Pressable>
        );
      })}
    </View>
  );
}

function TableField({ field, rows, onChange }) {
  const printed = field.rowLabels?.length;
  const rowName = (row, i) => (printed ? row.label : `${field.rowNoun || 'Row'} ${i + 1}`);

  const update = (rowIndex, key, value) =>
    onChange(rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)));

  const totals =
    field.totals && field.columns?.some((c) => c.type === 'choice')
      ? field.columns
          .filter((c) => c.type === 'choice')
          .flatMap((col) =>
            (col.options || []).map((opt) => ({
              label: opt,
              count: rows.filter((r) => r[col.key] === opt).length,
            }))
          )
      : null;

  return (
    <View style={{ marginTop: 12 }}>
      {field.label ? (
        <ILText role="label" color={G.ink} style={{ fontSize: 14, marginBottom: 4 }}>
          {field.label}
        </ILText>
      ) : null}
      {field.hint ? (
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, lineHeight: 18, marginBottom: 8 }}>
          {field.hint}
        </ILText>
      ) : null}
      {rows.map((row, rowIndex) => (
        <View
          key={`${field.key}-${rowIndex}`}
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 14,
            backgroundColor: G.white,
            borderWidth: 1,
            borderColor: G.line,
          }}
        >
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            {rowName(row, rowIndex)}
          </ILText>
          {field.columns.map((col) =>
            col.type === 'choice' ? (
              <View key={col.key} style={{ marginTop: 10 }}>
                <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
                  {col.label}
                </ILText>
                <ChoicePick
                  options={col.options}
                  value={row[col.key] || ''}
                  onChange={(v) => update(rowIndex, col.key, v)}
                />
              </View>
            ) : (
              <Field
                key={col.key}
                label={col.label}
                value={row[col.key] || ''}
                onChangeText={(v) => update(rowIndex, col.key, v)}
                minHeight={52}
              />
            )
          )}
        </View>
      ))}
      {totals ? (
        <ILText role="bodySm" color={G.body} style={{ marginTop: 12, fontSize: 13 }}>
          Total — {totals.map((t) => `${t.label}: ${t.count}`).join(' · ')}
        </ILText>
      ) : null}
    </View>
  );
}

export default function GenericLepForm({ definition, form, setForm }) {
  const groups = useMemo(() => {
    const fields = (definition.fields || []).filter((f) => !f.legacy);
    const seen = new Set();
    return fields.reduce((acc, field) => {
      const section = field.section || 'Details';
      if (!seen.has(section)) {
        seen.add(section);
        acc.push({
          section,
          fields: fields.filter((f) => (f.section || 'Details') === section),
        });
      }
      return acc;
    }, []);
  }, [definition.fields]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <View style={{ marginTop: 18 }}>
      {definition.sheetTitle ? (
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginBottom: 6 }]}>
          {definition.sheetTitle}
        </ILText>
      ) : null}
      {definition.sheetHint ? (
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, lineHeight: 18, marginBottom: 8 }}>
          {definition.sheetHint}
        </ILText>
      ) : null}
      {groups.map((group, gi) => (
        <SectionCard key={group.section} title={group.section} index={gi}>
          {group.fields.map((field) => {
            if (field.type === 'table') {
              return (
                <TableField
                  key={field.key}
                  field={field}
                  rows={form[field.key] || []}
                  onChange={(rows) => setField(field.key, rows)}
                />
              );
            }
            if (field.type === 'textarea' || field.type === 'text' || !field.type) {
              return (
                <Field
                  key={field.key}
                  label={field.label}
                  value={form[field.key] || ''}
                  onChangeText={(v) => setField(field.key, v)}
                  placeholder={field.hint}
                  minHeight={field.type === 'text' ? 44 : 64}
                />
              );
            }
            return null;
          })}
        </SectionCard>
      ))}
    </View>
  );
}
