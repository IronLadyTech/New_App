import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';
import { subscribeToBatches } from '../../services/cms';
import { cms100bmBatchToCard } from '../../utils/cms100bmBatchDisplay';
import { formatDateIST } from '../../utils/lepBatchSchedule';
import { lock100bmBatchChoice } from '../../utils/lock100bmBatch';
import { needs100bmCohortConfirm } from '../../utils/programAccess';
import { CONFIRM_100BM_COHORT_INTRO } from '../../utils/learnerBatchDisplay';

const PAGE = '#F7F6E4';
const INK = '#113744';
const BODY = '#4A463D';
const LINE = '#EAE8DC';
const CTA = '#ED1D24';

export default function Confirm100bmCohortScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile, user, patchProfile } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && !needs100bmCohortConfirm(profile)) {
      navigation.goBack?.();
    }
  }, [profile, navigation]);

  useEffect(() => {
    return subscribeToBatches(
      (rows) => {
        const today = formatDateIST(new Date());
        const open = rows
          .filter(
            (b) =>
              String(b.program || '').toUpperCase() === '100BM' &&
              b.openForEnrollment !== false
          )
          .map(cms100bmBatchToCard)
          .filter(Boolean)
          .filter((b) => String(b.startDate).slice(0, 10) >= today)
          .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
        setBatches(open);
        if (open.length && !selected) setSelected(open[0].id);
      },
      () => {}
    );
  }, []);

  const picked = useMemo(
    () => batches.find((b) => b.id === selected) || batches[0] || null,
    [batches, selected]
  );

  const confirm = async () => {
    if (!picked || saving) return;
    setSaving(true);
    try {
      await lock100bmBatchChoice({ user, profile, patchProfile, picked });
      navigation.getParent()?.navigate('Home');
    } catch (err) {
      Alert.alert('Could not confirm', err?.message || 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Math.max(insets.top, 12) + 12,
          paddingBottom: Math.max(insets.bottom, 16) + 28,
        }}
      >
        <ILText role="title" color={INK} style={{ fontSize: 22, marginBottom: 8 }}>
          Confirm your 100BM cohort
        </ILText>
        <ILText role="body" color={BODY} style={{ marginBottom: 20, lineHeight: 22 }}>
          {CONFIRM_100BM_COHORT_INTRO}
        </ILText>

        {batches.length === 0 ? (
          <ILText role="bodySm" color={BODY} style={{ marginBottom: 16 }}>
            Open cohorts are loading. If none appear, contact support — your payment is already
            recorded.
          </ILText>
        ) : (
          batches.map((b) => {
            const on = b.id === (selected || picked?.id);
            return (
              <Pressable
                key={b.id}
                onPress={() => setSelected(b.id)}
                style={{
                  borderWidth: 1,
                  borderColor: on ? CTA : LINE,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  backgroundColor: on ? 'rgba(237,29,36,0.06)' : '#FFF',
                }}
              >
                <ILText role="label" color={INK}>{b.title}</ILText>
                <ILText role="bodySm" color={BODY} style={{ marginTop: 4 }}>
                  {b.subtitle}
                </ILText>
              </Pressable>
            );
          })
        )}

        <Pressable
          onPress={confirm}
          disabled={!picked || saving}
          style={{
            marginTop: 12,
            backgroundColor: !picked || saving ? '#ccc' : CTA,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ILText role="label" color="#FFFFFF">Confirm cohort</ILText>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
