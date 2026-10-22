/**
 * Pickers for the learner's city, field of work, B-HAG and income — used on the
 * first-login welcome screen and in Profile. Built for one thumb: big tap targets,
 * one tap to choose, search where the list is long.
 */
import React, { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';
import {
  FIELDS_OF_WORK,
  INDIAN_CITIES,
  POPULAR_CITIES,
  SALARY_RANGES,
  bhagStarters,
} from '../../constants/learnerProfileOptions';

const CTA = '#ED1D24';
const SOFT = '#F4F1E8';
const LINE = 'rgba(16,44,50,0.12)';
const MUTED = 'rgba(16,44,50,0.55)';

function Chip({ label, active, onPress, icon }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? CTA : IL_BRAND.white,
        borderWidth: 1,
        borderColor: active ? CTA : LINE,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {icon ? <MaterialIcons name={icon} size={14} color={active ? '#fff' : IL_BRAND.forest} style={{ marginRight: 5 }} /> : null}
      <ILText role="bodySm" color={active ? '#fff' : IL_BRAND.ink} style={{ fontSize: 13, fontFamily: IL_FONTS.semibold }}>
        {label}
      </ILText>
    </Pressable>
  );
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z]/g, '');
}

/** Search box + popular chips + matching cities. Any typed city can be used too. */
export function CityPicker({ value, onPick }) {
  const [q, setQ] = useState('');
  const matches = useMemo(() => {
    const n = norm(q);
    if (!n) return [];
    const starts = INDIAN_CITIES.filter((c) => norm(c).startsWith(n));
    const has = INDIAN_CITIES.filter((c) => !norm(c).startsWith(n) && norm(c).includes(n));
    return [...starts, ...has].slice(0, 8);
  }, [q]);
  const exact = matches.some((c) => norm(c) === norm(q));

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: IL_BRAND.white,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: LINE,
          paddingHorizontal: 12,
        }}
      >
        <MaterialIcons name="search" size={20} color={MUTED} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search your city"
          placeholderTextColor="rgba(16,44,50,0.45)"
          autoFocus
          autoCorrect={false}
          style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: IL_BRAND.ink }}
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={8} accessibilityLabel="Clear search">
            <MaterialIcons name="close" size={18} color={MUTED} />
          </Pressable>
        ) : null}
      </View>

      {q ? (
        <View style={{ marginTop: 8, backgroundColor: IL_BRAND.white, borderRadius: 14, borderWidth: 1, borderColor: LINE, overflow: 'hidden' }}>
          {matches.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => onPick(c)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: LINE }}
            >
              <MaterialIcons name="place" size={16} color={c === value ? CTA : MUTED} />
              <ILText role="body" color={IL_BRAND.ink} style={{ marginLeft: 10, fontSize: 15, flex: 1 }}>{c}</ILText>
              {c === value ? <MaterialIcons name="check" size={18} color={CTA} /> : null}
            </Pressable>
          ))}
          {!exact && q.trim().length > 1 ? (
            <Pressable
              onPress={() => onPick(q.trim().replace(/\b\w/g, (m) => m.toUpperCase()))}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: matches.length ? 1 : 0, borderTopColor: LINE, backgroundColor: SOFT }}
            >
              <MaterialIcons name="add-location-alt" size={16} color={CTA} />
              <ILText role="body" color={IL_BRAND.ink} style={{ marginLeft: 10, fontSize: 15 }}>
                Use “{q.trim()}”
              </ILText>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <ILText role="eyebrow" color={MUTED} style={{ fontSize: 10, marginBottom: 8 }}>POPULAR</ILText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {POPULAR_CITIES.map((c) => (
              <Chip key={c} label={c} active={c === value} onPress={() => onPick(c)} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/** 20 tiles with icons — exactly the Zoho list. One tap chooses. */
export function FieldOfWorkPicker({ value, onPick }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
      {FIELDS_OF_WORK.map((f) => {
        const active = f.value === value;
        return (
          <View key={f.value} style={{ width: '50%', padding: 4 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onPick(f.value)}
              style={{
                minHeight: 64,
                borderRadius: 14,
                padding: 10,
                backgroundColor: active ? 'rgba(237,29,36,0.08)' : IL_BRAND.white,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? CTA : LINE,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: active ? CTA : SOFT, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name={f.icon} size={17} color={active ? '#fff' : IL_BRAND.forest} />
              </View>
              <ILText role="bodySm" color={IL_BRAND.ink} style={{ marginLeft: 8, flex: 1, fontSize: 13, lineHeight: 17, fontFamily: active ? IL_FONTS.semibold : IL_FONTS.regular }} numberOfLines={2}>
                {f.value}
              </ILText>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const BHAG_PREFIX = 'In the next 3 months, I will ';

/** Guided B-HAG: starts the sentence for her, offers starters for her field, she finishes it. */
export function BhagComposer({ value, onChange, field }) {
  const text = value || '';
  const starters = bhagStarters(field);
  const useStarter = (s) => onChange(`${BHAG_PREFIX}${s}`);
  return (
    <View>
      <TextInput
        value={text}
        onChangeText={onChange}
        placeholder={`${BHAG_PREFIX}…`}
        placeholderTextColor="rgba(16,44,50,0.45)"
        multiline
        autoFocus={!text}
        textAlignVertical="top"
        style={{
          minHeight: 96,
          backgroundColor: IL_BRAND.white,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: LINE,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          lineHeight: 22,
          color: IL_BRAND.ink,
        }}
      />
      <ILText role="bodySm" color={MUTED} style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}>
        Make it big, specific and yours — a role, a number or a milestone you can see in 3 months.
      </ILText>
      {!text.trim() || text.trim() === BHAG_PREFIX.trim() ? (
        <View style={{ marginTop: 10 }}>
          <ILText role="eyebrow" color={MUTED} style={{ fontSize: 10, marginBottom: 8 }}>NEED A START? TAP ONE, THEN MAKE IT YOURS</ILText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {starters.map((s) => (
              <Chip key={s} label={s} icon="auto-awesome" onPress={() => useStarter(s)} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Annual income — one tap. Optional, and only for her profile and Zoho. */
export function SalaryPicker({ value, onPick }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {SALARY_RANGES.map((r) => (
          <Chip key={r} label={r} active={r === value} onPress={() => onPick(r)} />
        ))}
      </View>
      <ILText role="bodySm" color={MUTED} style={{ marginTop: 4, fontSize: 12 }}>
        Private — only the Iron Lady team sees this. It helps us match you with the right peers.
      </ILText>
    </View>
  );
}
