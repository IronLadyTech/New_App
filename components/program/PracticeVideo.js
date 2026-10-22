import React, { useMemo, useState } from 'react';
import { Image, Modal, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '../il/Press';
import { useVideoLandscape } from '../../hooks/useVideoOrientation';
import { useVideoProgressTracking } from '../../hooks/useVideoProgressTracking';
import {
  allowYoutubeEmbedRequest,
  toPlayerSource,
  youtubeEmbedHtml,
  youtubeIdFromUri,
  YOUTUBE_EMBED_ORIGIN,
} from '../../utils/videoSource';

/** Largest 16:9 rectangle that fits the available stage. */
function fit16x9(maxW, maxH) {
  if (!maxW || !maxH) return { width: 0, height: 0 };
  const widthFromHeight = maxH * (16 / 9);
  if (widthFromHeight <= maxW) {
    return { width: widthFromHeight, height: maxH };
  }
  return { width: maxW, height: maxW * (9 / 16) };
}

function NativeVideo({ source, width, height, trackKey }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
  });
  useVideoProgressTracking(player, trackKey);

  return (
    <VideoView
      style={{ width, height, backgroundColor: '#000' }}
      player={player}
      allowsFullscreen
      contentFit="contain"
      nativeControls
    />
  );
}

function YoutubeEmbed({ uri, width, height }) {
  const id = youtubeIdFromUri(uri);
  const html = useMemo(
    () => (id && width > 0 && height > 0 ? youtubeEmbedHtml(id, { width, height }) : null),
    [id, width, height],
  );
  if (!html) return null;

  return (
    <WebView
      key={`${width}x${height}`}
      source={{ html, baseUrl: YOUTUBE_EMBED_ORIGIN }}
      style={{ width, height, backgroundColor: '#000' }}
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      scalesPageToFit={false}
      setBuiltInZoomControls={false}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      scrollEnabled={false}
      // Learners never leave for YouTube: logo, title and suggestion taps are dropped.
      setSupportMultipleWindows={false}
      onShouldStartLoadWithRequest={allowYoutubeEmbedRequest}
      onOpenWindow={() => {}}
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

function VideoFrame({ uri, fill, poster, started, onStart, trackKey }) {
  const youtubeId = youtubeIdFromUri(uri);
  const showPoster = !!poster;
  const showYoutubeGate = youtubeId && !started;
  const [box, setBox] = useState({ width: 0, height: 0 });

  return (
    <View
      onLayout={(e) => {
        const { width, height: measured } = e.nativeEvent.layout;
        const nextW = Math.round(width);
        const nextH = Math.round(measured);
        setBox((prev) => (
          Math.abs(prev.width - nextW) < 2 && Math.abs(prev.height - nextH) < 2
            ? prev
            : { width: nextW, height: nextH }
        ));
      }}
      style={
        fill
          ? { flex: 1, width: '100%', backgroundColor: '#000', overflow: 'hidden' }
          : { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', overflow: 'hidden' }
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
      {!showYoutubeGate && box.width > 0 && box.height > 0 ? (
        youtubeId ? (
          <YoutubeEmbed uri={uri} width={box.width} height={box.height} />
        ) : (
          <NativeVideo source={toPlayerSource(uri)} width={box.width} height={box.height} trackKey={trackKey} />
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

/** trackKey names the video on the CX dashboard (task / practice / asset id); falls back to the uri. */
export default function PracticeVideo({ uri, poster, trackKey = uri }) {
  const [landscape, setLandscape] = useState(false);
  const [started, setStarted] = useState(!youtubeIdFromUri(uri));
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const insets = useSafeAreaInsets();
  useVideoLandscape(landscape);
  const frame = fit16x9(stage.width, stage.height);

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
            poster={poster}
            started={started}
            onStart={beginPlayback}
            trackKey={trackKey}
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
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            }}
            onLayout={(e) => {
              const { width, height: measured } = e.nativeEvent.layout;
              const nextW = Math.max(0, Math.round(width - insets.left - insets.right));
              const nextH = Math.max(0, Math.round(measured - insets.top - insets.bottom));
              setStage((prev) => (prev.width === nextW && prev.height === nextH ? prev : { width: nextW, height: nextH }));
            }}
          >
            {frame.width > 0 && frame.height > 0 ? (
              <View style={{ width: frame.width, height: frame.height }}>
                <VideoFrame uri={uri} fill poster={poster} started={started} onStart={beginPlayback} trackKey={trackKey} />
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={closeLandscape}
            accessibilityRole="button"
            accessibilityLabel="Exit landscape"
            hitSlop={10}
            style={{
              position: 'absolute',
              top: insets.top + 8,
              right: insets.right + 8,
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
      </Modal>
    </>
  );
}
