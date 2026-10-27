import React, { useCallback, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { RedCta } from '../../screens/lep/LepBits';
import { resolveAlumniMonthlyChallenge } from '../../constants/lepAlumniChallenges';
import { useAuth } from '../../context/AuthContext';
import { saveWelcomeProfileFields } from '../../services/functions';
import { updateUserProfile } from '../../services/firestore';
import { welcomeSaveFeedback } from '../../utils/participantSyncMessage';
import { alumniChapterProfilePatch, readAlumniGeoChapter } from '../../utils/lepAlumniChapter';
import LepAlumniChapterModal from './LepAlumniChapterModal';

export default function AlumniMonthlyChallengeCard({ onOpenTask, onDark }) {
  const { user, profile, patchProfile } = useAuth();
  const challenge = useMemo(() => resolveAlumniMonthlyChallenge(), []);
  const savedChapter = readAlumniGeoChapter(profile);
  const [chapterModal, setChapterModal] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);

  const ink = onDark ? '#FFFFFF' : G.ink;
  const meta = onDark ? 'rgba(255,255,255,0.6)' : G.meta;

  const openTask = useCallback(
    (taskId) => {
      onOpenTask?.(taskId);
    },
    [onOpenTask]
  );

  const onContinue = () => {
    if (!readAlumniGeoChapter(profile)) {
      setChapterModal(true);
      return;
    }
    openTask(challenge.taskId);
  };

  const confirmChapter = async (chapter) => {
    const patch = alumniChapterProfilePatch(profile, chapter);
    if (!patch) return;
    setSavingChapter(true);
    patchProfile?.(patch);
    if (user?.uid && user.uid !== 'preview') {
      await updateUserProfile(user.uid, patch).catch(() => {});
    }
    try {
      const result = await saveWelcomeProfileFields({ chapters: patch.chapters });
      const feedback = welcomeSaveFeedback(result);
      if (feedback.message && (feedback.isError || !feedback.zohoSynced)) {
        Alert.alert(feedback.isError ? 'Could not save chapter' : 'Chapter saved', feedback.message);
      }
      if (result?.zohoLeadId) {
        patchProfile?.({
          zohoLeadId: result.zohoLeadId,
          zohoLead: { ...(patch.zohoLead || {}), id: result.zohoLeadId },
        });
      }
    } catch (err) {
      const feedback = welcomeSaveFeedback(null, err);
      Alert.alert('Could not save chapter', feedback.message);
      setSavingChapter(false);
      return;
    }
    setSavingChapter(false);
    setChapterModal(false);
    openTask(challenge.taskId);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ILText role="eyebrow" color={onDark ? G.pink : G.cta} style={[af, { fontSize: 10 }]}>
          Monthly challenge · Alumni
        </ILText>
        <ILText role="bodySm" color={meta} style={{ fontSize: 12 }}>
          Day {challenge.dayIndex} of 7
        </ILText>
      </View>
      <ILText
        role="title"
        color={ink}
        style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
      >
        {challenge.title}
      </ILText>
      <ILText role="bodySm" color={meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
        {challenge.blurb}
      </ILText>
      {savedChapter ? (
        <ILText role="bodySm" color={meta} style={{ marginTop: 8, fontSize: 12 }}>
          Your chapter · {savedChapter === 'East Zone( Kolkata)' ? 'East Zone (Kolkata)' : savedChapter}
        </ILText>
      ) : null}

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              marginRight: i < 7 ? 4 : 0,
              borderRadius: 2,
              backgroundColor: i <= challenge.dayIndex
                ? G.cta
                : onDark
                  ? 'rgba(255,255,255,0.16)'
                  : 'rgba(0,0,0,0.08)',
            }}
          />
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <RedCta label="Open practice →" onPress={onContinue} />
      </View>

      <LepAlumniChapterModal
        visible={chapterModal}
        saving={savingChapter}
        onClose={() => !savingChapter && setChapterModal(false)}
        onConfirm={confirmChapter}
      />
    </View>
  );
}
