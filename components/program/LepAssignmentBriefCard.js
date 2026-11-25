import React from 'react';
import { View } from 'react-native';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';

/** One line; `**words**` show in bold. */
function Rich({ text, style, color = G.ink }) {
  const parts = String(text || '').split('**');
  return (
    <ILText role="body" color={color} style={style}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <ILText key={i} role="body" color={G.ink} style={[style, { fontWeight: '700' }]}>
            {p}
          </ILText>
        ) : (
          p
        )
      )}
    </ILText>
  );
}

/**
 * Items are plain strings, or { text, points: [] } for a heading with sub-points.
 * Optional intro (under the title) and note (highlighted at the end).
 */
export default function LepAssignmentBriefCard({ title, items, intro, note }) {
  if (!items?.length) return null;
  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 18, padding: 16, backgroundColor: G.white }}>
      <ILText role="label" color={G.ink} style={{ fontSize: 17, lineHeight: 24 }}>
        {title}
      </ILText>
      <Rich
        text={intro || 'Complete every item below, then upload your work.'}
        color={G.meta}
        style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}
      />
      {items.map((item, idx) => {
        const line = typeof item === 'string' ? item : item.text;
        const points = typeof item === 'string' ? null : item.points;
        return (
          <View key={idx} style={{ marginTop: idx === 0 ? 14 : 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <ILText role="label" color={G.cta} style={{ width: 22, fontSize: 15, lineHeight: 21 }}>
                {idx + 1}.
              </ILText>
              <Rich text={line} style={{ flex: 1, fontSize: 14, lineHeight: 21 }} />
            </View>
            {points?.map((p, j) => (
              <View key={j} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, paddingLeft: 22 }}>
                <ILText role="label" color={G.cta} style={{ width: 16, fontSize: 14, lineHeight: 20 }}>
                  ✓
                </ILText>
                <Rich text={p} style={{ flex: 1, fontSize: 14, lineHeight: 20 }} />
              </View>
            ))}
          </View>
        );
      })}
      {note ? (
        <View style={{ marginTop: 16, borderRadius: 12, padding: 12, backgroundColor: G.pink }}>
          <Rich text={note} style={{ fontSize: 14, lineHeight: 20 }} />
        </View>
      ) : null}
    </WhiteCard>
  );
}
