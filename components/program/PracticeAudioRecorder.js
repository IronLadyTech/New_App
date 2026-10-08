import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PracticeAudioRecorder({ uri, onUriChange, disabled }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const player = useAudioPlayer(uri || null);
  const [durationSec, setDurationSec] = useState(0);

  useEffect(() => {
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone', 'Allow microphone access to record your pitch.');
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  const start = async () => {
    if (disabled) return;
    onUriChange(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async () => {
    const elapsed = Math.max(1, Math.round(recorderState.durationMillis / 1000));
    await recorder.stop();
    if (recorder.uri) {
      setDurationSec(elapsed);
      onUriChange(recorder.uri);
    }
  };

  const play = () => {
    if (!uri) return;
    player.seekTo(0);
    player.play();
  };

  const recording = recorderState.isRecording;
  const secs = Math.round(recorderState.durationMillis / 1000);

  return (
    <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 20, alignItems: 'center' }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: recording ? G.cta : uri ? G.dark : G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="mic" size={32} color={recording || uri ? '#FFFFFF' : G.cta} />
      </View>

      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 14, fontFamily: IL_FONTS.display, fontSize: 20, textAlign: 'center' }}
      >
        {recording ? 'Recording…' : uri ? 'Pitch recorded' : 'Tap to record'}
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, textAlign: 'center' }}>
        {recording
          ? `${fmt(secs)} · aim for 30 seconds`
          : uri
            ? `${fmt(durationSec)} · tap Play to listen back`
            : 'Name, proof, purpose — under 30 seconds'}
      </ILText>

      {disabled ? (
        uri ? (
          <Pressable
            onPress={play}
            accessibilityRole="button"
            style={{
              marginTop: 18,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: G.dark,
              borderRadius: 999,
              paddingVertical: 12,
              paddingHorizontal: 22,
            }}
          >
            <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
            <ILText role="label" color="#FFFFFF" style={{ marginLeft: 6 }}>
              Play recording
            </ILText>
          </Pressable>
        ) : null
      ) : recording ? (
        <Pressable
          onPress={stop}
          accessibilityRole="button"
          style={{
            marginTop: 18,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingVertical: 12,
            paddingHorizontal: 22,
          }}
        >
          <MaterialIcons name="stop" size={20} color="#FFFFFF" />
          <ILText role="label" color="#FFFFFF" style={{ marginLeft: 6 }}>
            Stop
          </ILText>
        </Pressable>
      ) : (
        <View style={{ flexDirection: 'row', marginTop: 18, gap: 10 }}>
          <Pressable
            onPress={start}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: G.cta,
              borderRadius: 999,
              paddingVertical: 12,
              paddingHorizontal: 22,
            }}
          >
            <MaterialIcons name="fiber-manual-record" size={18} color="#FFFFFF" />
            <ILText role="label" color="#FFFFFF" style={{ marginLeft: 6 }}>
              {uri ? 'Re-record' : 'Record'}
            </ILText>
          </Pressable>
          {uri ? (
            <Pressable
              onPress={play}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: G.dark,
                borderRadius: 999,
                paddingVertical: 12,
                paddingHorizontal: 22,
              }}
            >
              <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
              <ILText role="label" color="#FFFFFF" style={{ marginLeft: 6 }}>
                Play
              </ILText>
            </Pressable>
          ) : null}
        </View>
      )}
    </WhiteCard>
  );
}
