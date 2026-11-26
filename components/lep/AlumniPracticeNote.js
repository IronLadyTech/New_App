import React, { useEffect, useState } from 'react';
import Reanimated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { ALUMNI_PRACTICE_BANNER } from '../../utils/lepAlumniTaskCopy';

const SHOW_MS = 2000;

/** "You have graduated. This practice is optional." — shows for 2 seconds, then fades away. */
export default function AlumniPracticeNote() {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShown(false), SHOW_MS);
    return () => clearTimeout(t);
  }, []);
  if (!shown) return null;
  return (
    <Reanimated.View exiting={FadeOut.duration(350)} layout={LinearTransition}>
      <WhiteCard style={{ marginTop: 12, borderRadius: 16, padding: 14, backgroundColor: G.pink }}>
        <ILText role="bodySm" color={G.body} style={{ fontSize: 14, lineHeight: 20 }}>
          {ALUMNI_PRACTICE_BANNER}
        </ILText>
      </WhiteCard>
    </Reanimated.View>
  );
}
