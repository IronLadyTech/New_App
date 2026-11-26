import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';

/** "31 mins" / "4:15" / "24 min" → whole minutes (at least 1), or null. */
export function episodeMinutes(time) {
  const t = String(time || '').trim();
  const clock = /^(\d+):(\d{2})$/.exec(t);
  if (clock) return Math.max(1, Math.round(Number(clock[1]) + Number(clock[2]) / 60));
  const mins = /(\d+)\s*m/i.exec(t);
  return mins ? Math.max(1, Number(mins[1])) : null;
}

/** "31-minute case study"; just "Case study" when the length is unknown. */
export function episodeMeta(time, kind) {
  const n = episodeMinutes(time);
  return n ? `${n}-minute ${kind}` : kind.charAt(0).toUpperCase() + kind.slice(1);
}

/**
 * The strip under a video thumbnail. The thumbnail already shows the title, guest and role, so
 * this adds only what it cannot: who it is for (serif) and how long / what kind (sans), with one
 * play button.
 */
export default function EpisodeFoot({ lead, meta, size = 'md' }) {
  const big = size === 'lg';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: big ? 16 : 14, paddingVertical: big ? 14 : 12 }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        {lead ? (
          <ILText
            role="title"
            color={G.ink}
            numberOfLines={2}
            style={{ fontFamily: IL_FONTS.display, fontSize: big ? 19 : 16, lineHeight: big ? 25 : 21 }}
          >
            {lead}
          </ILText>
        ) : null}
        {meta ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: lead ? 3 : 0, fontSize: 13 }}>
            {meta}
          </ILText>
        ) : null}
      </View>
      <View
        style={{
          width: big ? 44 : 38,
          height: big ? 44 : 38,
          borderRadius: 22,
          backgroundColor: G.dark,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="play-arrow" size={big ? 26 : 22} color="#FFFFFF" />
      </View>
    </View>
  );
}
