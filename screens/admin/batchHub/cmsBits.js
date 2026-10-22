/** Small shared pieces for the batch tabs: audience picker, pills, date-time field. */
import React from 'react';
import { View } from 'react-native';
import Pressable from '../../../components/il/Press';
import { A, T } from '../adminUi';

export const AUDIENCES = [
  { value: 'all', label: 'All learners' },
  { value: 'register', label: 'Part paid' },
  { value: 'paid', label: 'Full paid' },
  { value: 'late', label: 'Late joiners' },
];

export function audienceLabel(value) {
  return AUDIENCES.find((a) => a.value === value)?.label || 'All learners';
}

/** Does an item for `audience` show when CX is looking at `viewing` ('all' shows everything)? */
export function audienceMatches(audience, viewing) {
  if (!viewing || viewing === 'all' || !audience || audience === 'all') return true;
  if (viewing === 'late') return audience === 'late' || audience === 'paid';
  return audience === viewing;
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'flex-start', backgroundColor: '#FBFAF4', borderWidth: 1, borderColor: A.line, borderRadius: 999, padding: 3 }}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onChange(o.value)}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: value === o.value ? A.ink : 'transparent' }}>
            <T size={13} weight={value === o.value ? 'semibold' : 'regular'} color={value === o.value ? '#fff' : A.ink}>
              {o.label}
            </T>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function AudiencePicker({ value, onChange }) {
  return <Segmented options={AUDIENCES} value={value} onChange={onChange} />;
}

export function Pill({ label, tone = 'neutral' }) {
  const [bg, fg] = {
    ok: ['#E3F4EA', A.ok],
    warn: ['#FFF3DC', '#9A5B00'],
    miss: ['#FDECEC', A.red],
    lock: ['#EEF0F3', '#8A8F98'],
    neutral: ['#EEF3F8', A.navy],
    muted: ['#F1F0EA', A.muted],
  }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginRight: 6, marginTop: 6 }}>
      <T size={11} weight="semibold" color={fg}>{label}</T>
    </View>
  );
}

export function FieldLabel({ children }) {
  return (
    <T size={11} weight="bold" color={A.muted} style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>
      {children}
    </T>
  );
}

/** Web date or date-time picker; value in the browser's local time (staff are in India). */
export function DateInput({ value, onChange, withTime = false }) {
  if (typeof document === 'undefined') return null;
  return React.createElement('input', {
    type: withTime ? 'datetime-local' : 'date',
    value: value || '',
    onChange: (e) => onChange(e.target.value),
    style: { width: '100%', padding: 9, borderRadius: 8, border: `1px solid ${A.line}`, fontSize: 14, background: '#fff' },
  });
}

/** A dashed "add" box that holds a form. */
export function AddBox({ title, children }) {
  return (
    <View style={{ backgroundColor: '#FFFEF8', borderWidth: 1, borderStyle: 'dashed', borderColor: '#C9C4AE', borderRadius: 14, padding: 14, marginBottom: 14 }}>
      <T size={15} weight="bold" style={{ marginBottom: 10 }}>{title}</T>
      {children}
    </View>
  );
}

/** ISO time → the browser's local "YYYY-MM-DDTHH:mm" for a datetime-local field. */
export function toLocalInput(iso) {
  const d = new Date(iso || '');
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** India-time label for an ISO string: "Mon 2 Nov · 11:00 AM". */
export function istLabel(iso) {
  const ms = Date.parse(iso || '');
  if (!Number.isFinite(ms)) return '';
  const d = new Date(ms);
  const day = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  return `${day} · ${time.toUpperCase()}`;
}
