import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { GuestBackBar } from '../guest/GuestBits';
import PracticeVideo from '../../components/program/PracticeVideo';
import PracticeAudioRecorder from '../../components/program/PracticeAudioRecorder';
import { Page, WhiteCard } from '../lep/LepBits';
import { useAuth } from '../../context/AuthContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { PRACTICE, practiceKey } from '../../constants/practice';
import { isLepEnrolled } from '../../utils/lepState';
import { getPracticeVideoUrl } from '../../utils/resolveVideoUrl';

const TAG = { lep: 'LEP', '100bm': '100BM', mbw: 'MBW' };

export default function PracticeScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const demo = useCourseDemo();
  const p = PRACTICE[params.practiceId];
  const programId = p?.programId || params.programId;
  const practiceId = params.practiceId;
  const lepEnrolled = programId === 'lep' ? isLepEnrolled(profile) : true;
  const videoUri = p?.videoUrl ? getPracticeVideoUrl(practiceId, lepEnrolled) || p.videoUrl : null;
  const pKey = practiceId ? practiceKey(practiceId) : '';
  const done = p ? !!params.seededDone || demo.isDone(programId, pKey) : false;
  const saved = p ? demo.getSubmission(programId, pKey) : null;
  const [ticks, setTicks] = useState({});
  const [note, setNote] = useState(saved?.data?.note || '');
  const [recordingUri, setRecordingUri] = useState(saved?.data?.audioUri || null);

  if (!p) {
    return (
      <Page>
        <View style={{ paddingTop: Math.max(insets.top, 8) }}>
          <GuestBackBar title="Practice" onBack={() => navigation.goBack()} />
        </View>
        <ILText role="body" color={G.meta} align="center" style={{ marginTop: 40 }}>
          This practice is not available.
        </ILText>
      </Page>
    );
  }

  const stepsDone = p.steps.filter((_, i) => ticks[i] || done).length;
  const audioUri = recordingUri || saved?.data?.audioUri || null;
  const canFinish = (p.noteRequired ? !!note.trim() : true) && (!p.audioRecord || !!audioUri);
  const finish = () => {
    if (!canFinish) return;
    const data = {};
    if (p.audioRecord && audioUri) data.audioUri = audioUri;
    if (p.note && note.trim()) data.note = note.trim();
    if (Object.keys(data).length) {
      demo.saveSubmission(programId, pKey, data);
      return;
    }
    demo.markDone(programId, pKey);
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar title="Today’s practice" sub={`${TAG[programId] || ''} · ${p.kind}`} onBack={() => navigation.goBack()} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) }}
        >
          <View style={{ marginTop: 6, backgroundColor: G.dark, borderRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <ILText role="eyebrow" color={G.pink} style={[af, { fontSize: 10 }]}>
                  {p.kind}
                </ILText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="schedule" size={14} color={G.pink} />
                <ILText role="label" color="#FFFFFF" style={{ marginLeft: 4, fontSize: 12 }}>
                  {p.minutes} min
                </ILText>
              </View>
            </View>
            <ILText
              role="display"
              color="#FFFFFF"
              style={{ marginTop: 14, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
            >
              {p.title}
            </ILText>
            <ILText role="body" color="rgba(255,255,255,0.75)" style={{ marginTop: 10, fontSize: 14, lineHeight: 21 }}>
              {p.why}
            </ILText>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              {p.steps.map((_, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    marginRight: i < p.steps.length - 1 ? 6 : 0,
                    backgroundColor: ticks[i] || done ? G.cta : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </View>
            <ILText role="bodySm" color="rgba(255,255,255,0.6)" style={{ marginTop: 8, fontSize: 12 }}>
              {stepsDone} of {p.steps.length} steps
            </ILText>
          </View>

          {videoUri ? (
            <View style={{ marginTop: 20 }}>
              <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
                {p.videoLabel || 'Watch first'}
              </ILText>
              <PracticeVideo uri={videoUri} poster={p.thumb} height={210} />
            </View>
          ) : null}

          <ILText role="title" color={G.ink} style={{ marginTop: 24, fontFamily: IL_FONTS.display, fontSize: 22 }}>
            How to do it
          </ILText>
          <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
            {p.steps.map((step, i) => {
              const on = ticks[i] || done;
              return (
                <Pressable
                  key={step}
                  onPress={() => !done && setTicks((t) => ({ ...t, [i]: !t[i] }))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!on }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderBottomWidth: i === p.steps.length - 1 ? 0 : 1,
                    borderBottomColor: G.line,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: on ? G.dark : G.pink,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on ? (
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    ) : (
                      <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                        {i + 1}
                      </ILText>
                    )}
                  </View>
                  <ILText role="body" color={on ? G.meta : G.ink} style={{ flex: 1, marginLeft: 12, fontSize: 14, lineHeight: 20 }}>
                    {step}
                  </ILText>
                </Pressable>
              );
            })}
          </WhiteCard>

          {p.audioRecord ? (
            <>
              <ILText role="title" color={G.ink} style={{ marginTop: 24, fontFamily: IL_FONTS.display, fontSize: 22 }}>
                {p.audioLabel || 'Record your pitch'}
              </ILText>
              <PracticeAudioRecorder uri={audioUri} onUriChange={setRecordingUri} disabled={done} />
            </>
          ) : null}

          {p.note && !done ? (
            <>
              <ILText role="label" color={G.ink} style={{ marginTop: 22 }}>
                {p.note}
              </ILText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={p.noteRequired ? 'One sentence — make it scary' : 'Optional · one line'}
                placeholderTextColor={G.meta}
                multiline
                style={{
                  marginTop: 8,
                  minHeight: 72,
                  backgroundColor: G.white,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: G.line,
                  padding: 14,
                  fontSize: 15,
                  color: G.ink,
                  textAlignVertical: 'top',
                }}
              />
            </>
          ) : null}

          {done ? (
            <View style={{ marginTop: 22, backgroundColor: G.cta, borderRadius: 24, padding: 20, alignItems: 'center' }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="check" size={28} color={G.cta} />
              </View>
              <ILText role="title" color="#FFFFFF" style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: 22 }}>
                Done for today
              </ILText>
              <ILText role="bodySm" color="rgba(255,255,255,0.85)" style={{ marginTop: 4, fontSize: 13 }}>
                Ticked on your Today’s practice list.
              </ILText>
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                style={{
                  marginTop: 16,
                  alignSelf: 'stretch',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <ILText role="label" color={G.cta}>
                  ← Back to Home
                </ILText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={finish}
              disabled={!canFinish}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canFinish }}
              style={{
                marginTop: 22,
                backgroundColor: canFinish ? G.cta : G.dash,
                borderRadius: 999,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: canFinish ? 1 : 0.7,
              }}
            >
              <MaterialIcons name="check" size={18} color="#FFFFFF" />
              <ILText role="label" color="#FFFFFF" style={{ marginLeft: 6 }}>
                Mark as done
              </ILText>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}
