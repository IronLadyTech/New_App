import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { MC_RECORDINGS } from '../../constants/masterclassRecordings';
import { GUEST_KINDS } from '../../constants/cms';
import { useGuestCms } from '../../hooks/useGuestCms';

/** Built-in recordings, shaped like CMS rows — used until CX adds their own. */
const DEFAULT_ROWS = MC_RECORDINGS.map((r) => ({
  id: r.id,
  title: `Day ${r.day} recording`,
  url: r.videoUrl,
  body: 'Plays here in the app',
}));
import { getGuestIdentity, trackGuest } from '../../services/appGuest';
import { WhiteCard } from '../../screens/guest/GuestBits';

/**
 * Masterclass Day 1 / Day 2 recordings — only for guests whose Zoho Lead status is
 * MC Enrolled or MC Completed. They play inside the app.
 */
export default function McRecordingsCard({ onWatch }) {
  const [show, setShow] = useState(false);
  // CMS → Guest app → Masterclass recordings; the built-in two until CX adds theirs.
  const recordings = useGuestCms(GUEST_KINDS.MC_RECORDING, DEFAULT_ROWS);
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
      {recordings.map((r) => (
        <Pressable
          key={r.id}
          accessibilityRole="button"
          onPress={() => {
            trackGuest('recording');
            onWatch?.({ videoUrl: r.url, title: r.title });
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
              {r.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              {r.body || 'Plays here in the app'}
            </ILText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={G.meta} />
        </Pressable>
      ))}
    </WhiteCard>
  );
}
