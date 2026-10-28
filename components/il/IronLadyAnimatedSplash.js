import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { markLaunchRevealed } from '../../utils/launchReveal';

/**
 * Launch — "The Iron Block". The logo builds itself from its own geometry:
 *
 * The black mark in the logo is a square extruded diagonally (measured from
 * assets/splash-icon.png, 1024px: front face x 400–870, y 134–604; extrusion −256, +256).
 *
 *   0.30 s  a black square — the front face — drops onto the red        (tick)
 *   0.65 s  it extrudes into the 3D block, staying centred as it grows   (low grind)
 *   1.25 s  IRON stamps in, with weight and a slight shake               (iron thud)
 *   1.45 s  LADY stamps in                                                (deeper thud)
 *   2.20 s  push: the camera dives into the block's black face; the app rises out of that dark
 *
 * The native splash is plain red (app.json), so frame one matches it. Waits on `ready`
 * before the push. Tap skips. Reduced motion: the finished logo, then a fade.
 * Sound (assets/sounds, built by scripts/build_launch_sound.py) follows the same times.
 */

const RED = '#ED1D24';
const CANVAS = 1024; // logo source size — every coordinate below is in these pixels
const FRONT = { x: 400, y: 134, size: 470 };
const EXTRUDE = { dx: -256, dy: 256 };
const IRON = { src: require('../../assets/il/launch-iron.png'), x: 396, y: 150, w: 452, h: 222 };
const LADY = { src: require('../../assets/il/launch-lady.png'), x: 396, y: 392, w: 452, h: 220 };
/** Where the camera dives in: deep in the block's black side, clear of the letters. */
const DIVE = { x: 262, y: 700 };

const SQUARE_AT = 300;
const EXTRUDE_AT = 650;
const EXTRUDE_MS = 500;
const IRON_AT = 1250;
const LADY_AT = 1450;
/** Intro length before the push may start (it also waits for `ready`). */
export const SPLASH_INTRO_MS = 2200;
const OUTRO_MS = 750;
/** Kept for callers that budget the whole splash. */
export const SPLASH_ANIMATION_MS = SPLASH_INTRO_MS + OUTRO_MS;

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

/** Sounds: optional, never blocking — a phone on silent stays silent. */
function useLaunchSound(enabled) {
  const players = useRef({});
  useEffect(() => {
    if (!enabled) return undefined;
    try {
      const audio = require('expo-audio');
      audio
        .setAudioModeAsync?.({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false })
        ?.catch?.(() => {});
      players.current.intro = audio.createAudioPlayer(require('../../assets/sounds/launch-intro.wav'));
      players.current.push = audio.createAudioPlayer(require('../../assets/sounds/launch-push.wav'));
      players.current.intro.play();
    } catch {
      // No audio (web autoplay rules, Expo Go…) — the animation runs the same.
    }
    const held = players.current;
    // Freed a little after the splash, so the push sound is not cut off when it unmounts.
    return () =>
      setTimeout(() => {
        Object.values(held).forEach((p) => {
          try {
            p?.remove?.();
          } catch {
            /* already gone */
          }
        });
      }, 1500);
  }, [enabled]);
  return useRef({
    push: (skipped) => {
      try {
        if (skipped) players.current.intro?.pause?.();
        players.current.push?.play?.();
      } catch {
        /* no audio */
      }
    },
  }).current;
}

export default function IronLadyAnimatedSplash({ onFinish, ready = true }) {
  const { width: W, height: H } = useWindowDimensions();
  const reduced = useReducedMotion();
  const size = Math.min(W * 0.62, 260); // on-screen size of the 1024px logo canvas
  const k = size / CANVAS;
  const sound = useLaunchSound(!reduced);

  const appear = useSharedValue(0);
  const extrude = useSharedValue(0);
  const iron = useSharedValue(0);
  const lady = useSharedValue(0);
  const shake = useSharedValue(0);
  const dive = useSharedValue(0);
  const rootOpacity = useSharedValue(1);

  const [introDone, setIntroDone] = useState(false);
  const started = useRef(Date.now());
  const outroStarted = useRef(false);

  useLayoutEffect(() => {
    // Frame one is plain red, like the native splash — hiding it now shows no change.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (reduced) {
      appear.value = 1;
      extrude.value = 1;
      iron.value = 1;
      lady.value = 1;
      const t = setTimeout(() => setIntroDone(true), 700);
      return () => clearTimeout(t);
    }
    const land = Easing.in(Easing.quad);
    appear.value = withDelay(SQUARE_AT, withTiming(1, { duration: 230, easing: land }));
    extrude.value = withDelay(EXTRUDE_AT, withTiming(1, { duration: EXTRUDE_MS, easing: Easing.inOut(Easing.cubic) }));
    iron.value = withDelay(IRON_AT - 140, withTiming(1, { duration: 140, easing: land }));
    lady.value = withDelay(LADY_AT - 140, withTiming(1, { duration: 140, easing: land }));
    // A felt impact on each stamp: a quick decaying shake.
    const hit = (strength) =>
      withSequence(
        withTiming(strength, { duration: 40 }),
        withTiming(-strength * 0.6, { duration: 50 }),
        withTiming(strength * 0.3, { duration: 50 }),
        withTiming(0, { duration: 70 })
      );
    shake.value = withDelay(IRON_AT, withSequence(hit(4), withDelay(LADY_AT - IRON_AT - 210, hit(6))));
    const t = setTimeout(() => setIntroDone(true), SPLASH_INTRO_MS);
    return () => clearTimeout(t);
  }, [reduced]);

  const finish = useCallback(() => onFinish?.(), [onFinish]);

  const startOutro = useCallback(() => {
    if (outroStarted.current) return;
    outroStarted.current = true;
    if (reduced) {
      markLaunchRevealed();
      rootOpacity.value = withTiming(0, { duration: 300 }, (done) => done && runOnJS(finish)());
      return;
    }
    // Skipped early: land the block instantly so the dive starts from the finished logo.
    const skipped = Date.now() - started.current < SPLASH_INTRO_MS - 100;
    appear.value = 1;
    extrude.value = 1;
    iron.value = 1;
    lady.value = 1;
    sound.push(skipped);
    // Dive until black fills the screen (~65%), hold that dark for a beat, then the app rises out of it.
    dive.value = withTiming(1, { duration: Math.round(OUTRO_MS * 0.7), easing: Easing.in(Easing.quad) });
    rootOpacity.value = withDelay(
      Math.round(OUTRO_MS * 0.74),
      withTiming(0, { duration: Math.round(OUTRO_MS * 0.26) + 220, easing: Easing.out(Easing.quad) }, (done) => done && runOnJS(finish)())
    );
    setTimeout(markLaunchRevealed, Math.round(OUTRO_MS * 0.68));
  }, [reduced, finish, sound]);

  useEffect(() => {
    if (introDone && ready) startOutro();
  }, [introDone, ready, startOutro]);

  // The black mark: front square ∪ its copy pushed by `extrude` — a hexagon at every step.
  const blockProps = useAnimatedProps(() => {
    const e = extrude.value;
    const ox = EXTRUDE.dx * e;
    const oy = EXTRUDE.dy * e;
    const { x, y, size: s } = FRONT;
    return {
      points: `${x},${y} ${x + s},${y} ${x + s},${y + s} ${x + s + ox},${y + s + oy} ${x + ox},${y + s + oy} ${x + ox},${y + oy}`,
    };
  });

  const stageStyle = useAnimatedStyle(() => {
    // Keep the growing shape centred: shift by half the extrusion still to come.
    const shiftX = (EXTRUDE.dx / 2) * (1 - extrude.value) * k;
    const shiftY = (EXTRUDE.dy / 2) * (1 - extrude.value) * k;
    // Dive: zoom towards DIVE while moving it to the screen centre.
    const d = dive.value;
    const zoom = 1 + d * d * 70;
    const toCentre = Math.min(1, d * 3);
    const dxp = (DIVE.x - CANVAS / 2) * k;
    const dyp = (DIVE.y - CANVAS / 2) * k;
    return {
      opacity: appear.value > 0 ? 1 : 0,
      transform: [
        { translateX: shiftX + shake.value - dxp * toCentre * zoom },
        { translateY: shiftY + shake.value * 0.6 - dyp * toCentre * zoom },
        { scale: zoom * (1.5 - 0.5 * appear.value) }, // the square drops in from slightly above
      ],
    };
  });

  const ironStyle = useAnimatedStyle(() => ({
    opacity: iron.value > 0 ? Math.min(1, iron.value * 1.6) : 0,
    transform: [{ scale: 1.9 - 0.9 * iron.value }],
  }));
  const ladyStyle = useAnimatedStyle(() => ({
    opacity: lady.value > 0 ? Math.min(1, lady.value * 1.6) : 0,
    transform: [{ scale: 1.9 - 0.9 * lady.value }],
  }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));

  const box = (b) => ({ position: 'absolute', left: b.x * k, top: b.y * k, width: b.w * k, height: b.h * k });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => ready && startOutro()}
        accessibilityRole="button"
        accessibilityLabel="Iron Lady. Tap to continue"
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[{ position: 'absolute', width: size, height: size, left: (W - size) / 2, top: (H - size) / 2 }, stageStyle]}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
              <AnimatedPolygon animatedProps={blockProps} fill="#000000" />
            </Svg>
            <Animated.Image source={IRON.src} resizeMode="stretch" style={[box(IRON), ironStyle]} />
            <Animated.Image source={LADY.src} resizeMode="stretch" style={[box(LADY), ladyStyle]} />
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: RED,
    zIndex: 100,
    elevation: 100,
  },
});
