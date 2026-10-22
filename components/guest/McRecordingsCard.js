import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { MC_RECORDINGS } from '../../constants/masterclassRecordings';
import { getGuestIdentity, trackGuest } from '../../services/appGuest';
import { WhiteCard } from '../../screens/guest/GuestBits';

/**
 * Masterclass Day 1 / Day 2 recordings — only for guests whose Zoho Lead status is
 * MC Enrolled or MC Completed. They play inside the app.
 */
export default function McRecordingsCard({ onWatch }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    getGuestIdentity().then(({ tier }) => setShow(tier === 'mc'));
  }, []);
  if (!show) return null;

  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="ondemand-video" size={18} color={G.cta} />
        <ILText role="eyebrow" color={G.cta} style={{ marginLeft: 8, fontSize: 11 }}>
          YOUR MASTERCLASS RECORDINGS
        </ILText>
      </View>
      {MC_RECORDINGS.map((r) => (
        <Pressable
          key={r.id}
          accessibilityRole="button"
          onPress={() => {
            trackGuest('recording');
            onWatch?.({ videoUrl: r.videoUrl, title: r.title });
          }}
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: G.pink,
            borderRadius: 16,
            padding: 12,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: G.cta, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold }}>
              Day {r.day} recording
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              Plays here in the app
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={G.meta} />
        </Pressable>
      ))}
    </WhiteCard>
  );
}
