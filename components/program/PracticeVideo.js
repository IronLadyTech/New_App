import React, { useMemo, useState } from 'react';
import { Image, Modal, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '../il/Press';
import { useVideoLandscape } from '../../hooks/useVideoOrientation';
import {
  toPlayerSource,
  youtubeEmbedHtml,
  youtubeIdFromUri,
  YOUTUBE_EMBED_ORIGIN,
} from '../../utils/videoSource';

function NativeVideo({ source, height, fill }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
  });

  return (
    <VideoView
      style={
        fill
          ? { flex: 1, width: '100%', backgroundColor: 'transparent' }
          : { width: '100%', height, backgroundColor: 'transparent' }
      }
      player={player}
      allowsFullscreen
      contentFit="contain"
      nativeControls
    />
  );
}

function YoutubeEmbed({ uri, height, fill }) {
  const id = youtubeIdFromUri(uri);
  const html = useMemo(() => (id ? youtubeEmbedHtml(id) : null), [id]);
  if (!id || !html) return null;

  return (
    <WebView
      source={{ html, baseUrl: YOUTUBE_EMBED_ORIGIN }}
      style={
        fill
          ? { flex: 1, width: '100%', backgroundColor: 'transparent' }
          : { width: '100%', height, backgroundColor: 'transparent' }
      }
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
    />
  );
}

function PlayOverlay({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Play video"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(201, 74, 56, 0.92)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

function VideoFrame({ uri, height, fill, poster, started, onStart }) {
  const youtubeId = youtubeIdFromUri(uri);
  const showPoster = !!poster;
  const showYoutubeGate = youtubeId && !started;

  return (
    <View
      style={
        fill
          ? { flex: 1, width: '100%', backgroundColor: '#000', overflow: 'hidden' }
          : { width: '100%', height, backgroundColor: '#000', overflow: 'hidden' }
      }
    >
      {showPoster ? (
        <Image
          source={poster}
          style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : null}
      {showYoutubeGate ? <PlayOverlay onPress={onStart} /> : null}
      {!showYoutubeGate ? (
        youtubeId ? (
          <YoutubeEmbed uri={uri} height={height} fill={fill} />
        ) : (
          <NativeVideo source={toPlayerSource(uri)} height={height} fill={fill} />
        )
      ) : null}
    </View>
  );
}

function RotateButton({ onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Rotate to landscape"
      hitSlop={10}
      style={[
        {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(0,0,0,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <MaterialIcons name="screen-rotation" size={20} color="#FFFFFF" />
    </Pressable>
  );
}

export default function PracticeVideo({ uri, height = 200, poster }) {
  const [landscape, setLandscape] = useState(false);
  const [started, setStarted] = useState(!youtubeIdFromUri(uri));
  const insets = useSafeAreaInsets();
  useVideoLandscape(landscape);

  if (!uri) return null;

  const closeLandscape = () => setLandscape(false);
  const beginPlayback = () => setStarted(true);

  return (
    <>
      {!landscape ? (
        <View
          style={{
            marginTop: 12,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <VideoFrame
            uri={uri}
            height={height}
            poster={poster}
            started={started}
            onStart={beginPlayback}
          />
          <RotateButton
            onPress={() => {
              beginPlayback();
              setLandscape(true);
            }}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 4 }}
          />
        </View>
      ) : null}

      <Modal
        visible={landscape}
        animationType="fade"
        supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        onRequestClose={closeLandscape}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#000',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 8 }}>
            <Pressable
              onPress={closeLandscape}
              accessibilityRole="button"
              accessibilityLabel="Exit landscape"
              hitSlop={10}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.14)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <VideoFrame uri={uri} fill poster={poster} started={started} onStart={beginPlayback} />
          </View>
        </View>
      </Modal>
    </>
  );
}
