import React from 'react';
import { View } from 'react-native';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';

export default function LepAssignmentBriefCard({ title, items }) {
  if (!items?.length) return null;
  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 18, padding: 16, backgroundColor: G.white }}>
      <ILText role="label" color={G.ink} style={{ fontSize: 17, lineHeight: 24 }}>
        {title}
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
        Complete every item below, then upload your work.
      </ILText>
      {items.map((line, idx) => (
        <View key={idx} style={{ flexDirection: 'row', marginTop: idx === 0 ? 14 : 12, alignItems: 'flex-start' }}>
          <ILText role="label" color={G.cta} style={{ width: 22, fontSize: 15, lineHeight: 21 }}>
            {idx + 1}.
          </ILText>
          <ILText role="body" color={G.ink} style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>
            {line}
          </ILText>
        </View>
      ))}
    </WhiteCard>
  );
}