/**
 * OtpDeck — Iron Lady OTP verification ("deck" animation)
 *
 * Flow: type → each digit deals into its tile + a light runs round the tile edge
 *       → on the last digit the tiles fan into a hand of cards
 *       → they flip face-down and stack into one deck
 *       → the deck becomes a seal (running edge + spinning ticks) while we verify
 *       → success: green seal + tick, "Verified", Continue button
 *       → failure: seal shakes, cards deal back out empty, error message
 *
 * Deps:  react-native-reanimated (v3+), react-native-svg
 * Fonts: Gemunu Libre + Fira Sans (Iron Lady brand). With Expo:
 *        npx expo install @expo-google-fonts/gemunu-libre @expo-google-fonts/fira-sans expo-font
 *        and load GemunuLibre_700Bold, FiraSans_400Regular, FiraSans_600SemiBold in your root layout.
 */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Image,
  ImageSourcePropType,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path, Rect } from 'react-native-svg';

/* ───────────────────────── Theme (Iron Lady brand) ─────────────────────────
   red #ED1D24 · black #000 · white #FFF · cream #F7F6E4 · teal #113744 · stone #EAE8DC
   Neutrals carry the screen, black carries the text, red is the only accent.
   Green / dark-red are functional status colours only. */
export type OtpTheme = {
  bg: string; panel: string; border: string;
  text: string; muted: string; dim: string; grip: string;
  tile: string; tileBorder: string; tileFilledBorder: string; digit: string;
  back: string; backLine: string;
  accent: string; accentGlow: string;
  seal: string; sealLine: string; tick: string;
  ok: string; okSoft: string; bad: string;
  cta: string; ctaText: string;
};

export const OTP_THEMES: Record<'ivory' | 'noir' | 'teal', OtpTheme> = {
  ivory: {
    bg: '#F7F6E4', panel: '#FFFFFF', border: '#EAE8DC',
    text: '#000000', muted: '#5D5F5C', dim: '#9A9A92', grip: '#EAE8DC',
    tile: '#FFFFFF', tileBorder: '#EAE8DC', tileFilledBorder: '#000000', digit: '#000000',
    back: '#000000', backLine: 'rgba(237,29,36,0.9)',
    accent: '#ED1D24', accentGlow: 'rgba(237,29,36,0.18)',
    seal: '#FFFFFF', sealLine: '#EAE8DC', tick: '#BDB9A8',
    ok: '#1E8A57', okSoft: 'rgba(30,138,87,0.12)', bad: '#C8161D',
    cta: '#ED1D24', ctaText: '#FFFFFF',
  },
  noir: {
    bg: '#000000', panel: '#0F0F0F', border: '#1F1F1F',
    text: '#FFFFFF', muted: '#9B9B95', dim: '#5C5C58', grip: '#262626',
    tile: '#171717', tileBorder: '#262626', tileFilledBorder: '#F7F6E4', digit: '#F7F6E4',
    back: '#ED1D24', backLine: 'rgba(255,255,255,0.4)',
    accent: '#ED1D24', accentGlow: 'rgba(237,29,36,0.35)',
    seal: '#141414', sealLine: '#2A2A2A', tick: '#4A4A46',
    ok: '#3FCB86', okSoft: 'rgba(63,203,134,0.14)', bad: '#FF4B52',
    cta: '#ED1D24', ctaText: '#FFFFFF',
  },
  teal: {
    bg: '#0A222B', panel: '#113744', border: 'rgba(247,246,228,0.10)',
    text: '#F7F6E4', muted: '#A9BCBF', dim: '#6A8A90', grip: 'rgba(247,246,228,0.16)',
    tile: '#0C2C37', tileBorder: 'rgba(247,246,228,0.12)', tileFilledBorder: '#F7F6E4', digit: '#F7F6E4',
    back: '#F7F6E4', backLine: 'rgba(237,29,36,0.85)',
    accent: '#ED1D24', accentGlow: 'rgba(237,29,36,0.35)',
    seal: '#0C2C37', sealLine: 'rgba(247,246,228,0.18)', tick: 'rgba(247,246,228,0.35)',
    ok: '#5ED39A', okSoft: 'rgba(94,211,154,0.14)', bad: '#FF5A60',
    cta: '#ED1D24', ctaText: '#FFFFFF',
  },
};

export type OtpFonts = { heading: string; body: string; bodyBold: string };
const DEFAULT_FONTS: OtpFonts = {
  heading: 'GemunuLibre_700Bold',
  body: 'FiraSans_400Regular',
  bodyBold: 'FiraSans_600SemiBold',
};

/* ───────────────────────── Geometry ───────────────────────── */
const SLOT_W = 58;
const SLOT_H = 66;
const GAP = 10;
const RADIUS = 14;
const CHECK_LEN = 21;

const SPRING = { damping: 13, stiffness: 170, mass: 0.9 };
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/* ───────────────────────── Slot (one card) ───────────────────────── */
type SlotHandle = {
  deal: () => void;
  fan: (dx: number, deg: number, delay: number) => void;
  stack: (dx: number, deg: number, delay: number) => void;
  hide: () => void;
  reset: (fromDx: number, fromDeg: number, delay: number) => void;
  enter: (delay: number) => void;
};

type SlotProps = {
  digit?: string;
  active: boolean;
  filled: boolean;
  theme: OtpTheme;
  font: string;
  slotW: number;
  slotH: number;
};

const Slot = forwardRef<SlotHandle, SlotProps>(({ digit, active, filled, theme, font, slotW, slotH }, ref) => {
  const pivot = slotH * 3.2 - slotH / 2;
  const perim = 2 * (slotW + slotH) - 8 * RADIUS + 2 * Math.PI * RADIUS;
  const x = useSharedValue(0);
  const rot = useSharedValue(0);
  const lift = useSharedValue(0);
  const faceDown = useSharedValue(0);
  const alpha = useSharedValue(1);
  const dealIn = useSharedValue(1);
  const spark = useSharedValue(0);
  const blink = useSharedValue(1);

  const playDeal = useCallback(() => {
    dealIn.value = 0;
    dealIn.value = withSpring(1, { damping: 11, stiffness: 190 });
    lift.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 270, easing: EASE }),
    );
    spark.value = 0;
    spark.value = withTiming(1, { duration: 920, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  }, [dealIn, lift, spark]);

  useEffect(() => {
    if (active) {
      blink.value = withRepeat(withSequence(withTiming(1, { duration: 450 }), withTiming(0, { duration: 450 })), -1);
    } else {
      cancelAnimation(blink);
      blink.value = 0;
    }
  }, [active, blink]);

  useLayoutEffect(() => {
    if (digit) playDeal();
    else {
      dealIn.value = 1;
      spark.value = 0;
      lift.value = 0;
    }
  }, [digit, playDeal, dealIn, spark, lift]);

  useImperativeHandle(ref, () => ({
    deal: playDeal,
    fan(dx, deg, delay) {
      x.value = withDelay(delay, withSpring(dx, SPRING));
      rot.value = withDelay(delay, withSpring(deg, SPRING));
    },
    stack(dx, deg, delay) {
      faceDown.value = withDelay(delay, withTiming(1, { duration: 220 }));
      x.value = withDelay(delay, withTiming(dx, { duration: 460, easing: EASE }));
      rot.value = withDelay(delay, withTiming(deg, { duration: 460, easing: EASE }));
    },
    hide() {
      alpha.value = withTiming(0, { duration: 200 });
    },
    reset(fromDx, fromDeg, delay) {
      x.value = fromDx;
      rot.value = fromDeg;
      faceDown.value = 0;
      alpha.value = 0;
      x.value = withDelay(delay, withSpring(0, SPRING));
      rot.value = withDelay(delay, withSpring(0, SPRING));
      alpha.value = withDelay(delay, withTiming(1, { duration: 300 }));
    },
    enter(delay) {
      alpha.value = 0;
      rot.value = -6;
      lift.value = -3.5; // start 18px lower
      alpha.value = withDelay(delay, withTiming(1, { duration: 400 }));
      rot.value = withDelay(delay, withSpring(0, SPRING));
      lift.value = withDelay(delay, withSpring(0, SPRING));
    },
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [
      { translateX: x.value },
      { translateY: pivot },
      { rotate: `${rot.value}deg` },
      { translateY: -pivot },
      { translateY: -5 * lift.value },
      { rotate: `${-3 * lift.value}deg` },
    ],
  }));
  const digitStyle = useAnimatedStyle(() => ({
    opacity: digit ? interpolate(dealIn.value, [0, 0.6, 1], [0, 1, 1]) : 0,
    transform: [
      { translateY: (1 - dealIn.value) * 26 },
      { rotate: `${(1 - dealIn.value) * -14}deg` },
      { scale: 0.7 + 0.3 * dealIn.value },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({ opacity: faceDown.value }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: blink.value }));
  const sparkProps = useAnimatedProps(() => ({
    strokeDashoffset: -spark.value * perim,
    strokeOpacity: interpolate(spark.value, [0, 0.02, 0.88, 1], [0, 1, 1, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.slot,
        {
          width: slotW,
          height: slotH,
          backgroundColor: theme.tile,
          borderColor: active ? theme.accent : filled ? theme.tileFilledBorder : theme.tileBorder,
        },
        active && { shadowColor: theme.accent, shadowOpacity: 0.45, shadowRadius: 10, elevation: 6 },
        cardStyle,
      ]}
    >
      {active && <View pointerEvents="none" style={[styles.glow, { borderColor: theme.accentGlow }]} />}
      {active && <Animated.View style={[styles.caret, { backgroundColor: theme.accent }, caretStyle]} />}
      <Animated.Text style={[styles.digit, { color: theme.digit, fontFamily: font, fontSize: Math.round(slotW * 0.58), lineHeight: Math.round(slotH * 0.62) }, digitStyle]}>
        {digit || ''}
      </Animated.Text>
      <Svg pointerEvents="none" width={slotW + 8} height={slotH + 8} style={styles.spark}>
        <AnimatedRect
          x={4} y={4} width={slotW} height={slotH} rx={RADIUS}
          fill="none" stroke={theme.accent} strokeWidth={4.2} strokeLinecap="round"
          strokeDasharray={`${perim * 0.42} ${perim * 0.58}`}
          animatedProps={sparkProps}
        />
      </Svg>
      <Animated.View pointerEvents="none" style={[styles.back, { backgroundColor: theme.back }, backStyle]}>
        <View style={[styles.backInner, { borderColor: theme.backLine }]} />
      </Animated.View>
    </Animated.View>
  );
});

/* ───────────────────────── Seal ───────────────────────── */
export type SealState = 'hidden' | 'checking' | 'ok' | 'bad';

export function OtpSeal({
  state,
  theme,
  slotW = SLOT_W,
  slotH = SLOT_H,
}: {
  state: SealState;
  theme: OtpTheme;
  slotW?: number;
  slotH?: number;
}) {
  const alpha = useSharedValue(0);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const spin = useSharedValue(0);
  const run = useSharedValue(0);
  const ticks = useSharedValue(0);
  const check = useSharedValue(0);

  useEffect(() => {
    if (state === 'hidden') {
      [spin, run, scale].forEach(v => cancelAnimation(v));
      alpha.value = 0; ticks.value = 0; check.value = 0; scale.value = 1; shake.value = 0;
      return;
    }
    if (state === 'checking') {
      alpha.value = 1;
      ticks.value = withTiming(1, { duration: 220 });
      spin.value = 0;
      spin.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1);
      run.value = 0;
      run.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1);
      scale.value = withRepeat(withSequence(withTiming(1.06, { duration: 450 }), withTiming(1, { duration: 450 })), -1);
    }
    if (state === 'ok') {
      cancelAnimation(run);
      scale.value = withSequence(withTiming(0.92, { duration: 120 }), withSpring(1.12, SPRING), withSpring(1, SPRING));
      check.value = withDelay(80, withTiming(1, { duration: 280, easing: EASE }));
    }
    if (state === 'bad') {
      scale.value = withTiming(1, { duration: 120 });
      shake.value = withSequence(
        withTiming(-9, { duration: 60 }), withTiming(8, { duration: 80 }), withTiming(-6, { duration: 80 }),
        withTiming(4, { duration: 80 }), withTiming(0, { duration: 80 }),
      );
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const perim = 2 * (slotW + slotH) - 8 * RADIUS + 2 * Math.PI * RADIUS;
  const tickSize = Math.round(Math.max(slotW, slotH) * 2.15);
  const tickCx = tickSize / 2;
  const tickR = tickSize * 0.38;
  const tickR2a = tickSize * 0.425;
  const tickR2b = tickSize * 0.45;

  const wrap = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));
  const tickStyle = useAnimatedStyle(() => ({ opacity: ticks.value, transform: [{ rotate: `${spin.value}deg` }] }));
  const runProps = useAnimatedProps(() => ({ strokeDashoffset: -run.value * perim }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: (1 - check.value) * CHECK_LEN }));

  const tone = state === 'ok' ? theme.ok : state === 'bad' ? theme.bad : null;
  const tickLines = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const r2 = i % 2 ? tickR2a : tickR2b;
        return {
          x1: tickCx + Math.cos(a) * tickR,
          y1: tickCx + Math.sin(a) * tickR,
          x2: tickCx + Math.cos(a) * r2,
          y2: tickCx + Math.sin(a) * r2,
        };
      }),
    [tickCx, tickR, tickR2a, tickR2b],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.seal,
        {
          width: slotW + 2,
          height: slotH + 2,
          marginLeft: -(slotW + 2) / 2,
          marginTop: -(slotH + 2) / 2 + 16,
        },
        wrap,
      ]}
    >
      <Animated.View
        style={[
          styles.ticks,
          {
            width: tickSize,
            height: tickSize,
            left: (slotW + 2) / 2 - tickSize / 2,
            top: (slotH + 2) / 2 - tickSize / 2,
          },
          tickStyle,
        ]}
      >
        <Svg width={tickSize} height={tickSize}>
          {tickLines.map((l, i) => (
            <Line key={i} {...l} stroke={tone ?? theme.tick} strokeWidth={1.8} strokeLinecap="round" />
          ))}
        </Svg>
      </Animated.View>
      <Svg width={slotW + 2} height={slotH + 2}>
        <Rect
          x={1} y={1} width={slotW} height={slotH} rx={RADIUS - 1}
          fill={state === 'ok' ? theme.ok : theme.seal}
          stroke={tone ?? theme.sealLine} strokeWidth={1.5}
        />
        {state !== 'ok' && (
          <AnimatedRect
            x={1} y={1} width={slotW} height={slotH} rx={RADIUS - 1}
            fill="none" stroke={tone ?? theme.accent} strokeWidth={2.8} strokeLinecap="round"
            strokeDasharray={[perim * 0.22, perim * 0.78]} animatedProps={runProps}
          />
        )}
      </Svg>
      <Svg width={28} height={28} viewBox="0 0 24 24" style={styles.check}>
        <AnimatedPath
          d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" strokeWidth={2.8}
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray={[CHECK_LEN, CHECK_LEN]}
          animatedProps={checkProps}
        />
      </Svg>
    </Animated.View>
  );
}

/* ───────────────────────── OtpDeck ───────────────────────── */
export type OtpDeckProps = {
  /** Number of digits (default 4). */
  length?: number;
  /** Masked phone shown in the subtitle, e.g. "+91 98 ••• 892". */
  phone: string;
  /** Return true if the code is valid. Called when the last digit is typed (or Enter). */
  onVerify: (code: string) => Promise<boolean>;
  /** Called when the user taps Continue after success. */
  onContinue: () => void;
  /** Called when the user taps Resend. */
  onResend?: () => void | Promise<void>;
  theme?: 'ivory' | 'noir' | 'teal' | OtpTheme;
  fonts?: Partial<OtpFonts>;
  logo?: ImageSourcePropType;
  resendSeconds?: number;
  /** Stage + resend only — host screen keeps its own title and chrome. */
  embedded?: boolean;
};

export default function OtpDeck({
  length = 4,
  phone,
  onVerify,
  onContinue,
  onResend,
  theme: themeProp = 'ivory',
  fonts: fontsProp,
  logo,
  resendSeconds = 30,
  embedded = false,
}: OtpDeckProps) {
  const { width: winW } = useWindowDimensions();
  const theme = typeof themeProp === 'string' ? OTP_THEMES[themeProp] : themeProp;
  const fonts = { ...DEFAULT_FONTS, ...fontsProp };
  const gap = length >= 6 ? 6 : GAP;
  const [rowMax, setRowMax] = useState(Math.max(280, winW - 40));
  const slotW = Math.min(64, Math.max(44, Math.floor((rowMax - gap * (length - 1)) / length)));
  const slotH = Math.round(slotW * 1.22);
  const sealW = Math.round(slotW * 1.4);
  const sealH = Math.round(slotH * 1.36);

  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seal, setSeal] = useState<SealState>('hidden');
  const [title, setTitle] = useState('Enter your code');
  const [sub, setSub] = useState<'enter' | 'checking' | 'ok'>('enter');
  const [titleColor, setTitleColor] = useState<string | undefined>();
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRef = useRef<TextInput>(null);
  const slotRefs = useRef<(SlotHandle | null)[]>([]);
  const busyRef = useRef(false);

  const head = useSharedValue(1);
  const resendAlpha = useSharedValue(1);
  const doneAlpha = useSharedValue(0);

  const offsets = useMemo(
    () => Array.from({ length }, (_, i) => ((length - 1) / 2 - i) * (slotW + gap)),
    [length, slotW, gap],
  );
  const angles = useMemo(
    () => Array.from({ length }, (_, i) => (length === 1 ? 0 : -16 + (32 / (length - 1)) * i)),
    [length],
  );
  const stackRot = useMemo(() => Array.from({ length }, (_, i) => [-4, 3, -2, 0, 2, -1][i % 6]), [length]);

  /* entrance */
  useEffect(() => {
    slotRefs.current.forEach((s, i) => s?.enter(150 + i * 70));
    const t = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(t);
  }, []);

  /* resend countdown */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const swapText = useCallback(
    async (t: string, s: typeof sub, color?: string) => {
      head.value = withTiming(0, { duration: 200 });
      await sleep(220);
      setTitle(t); setSub(s); setTitleColor(color);
      head.value = withTiming(1, { duration: 250 });
    },
    [head],
  );

  const resetDeck = useCallback(
    (fromStack: boolean) => {
      setCode('');
      slotRefs.current.forEach((s, i) =>
        s?.reset(fromStack ? offsets[i] : 0, fromStack ? stackRot[i] : 0, i * 60),
      );
      busyRef.current = false;
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    },
    [offsets, stackRot],
  );

  const verify = useCallback(
    async (value: string) => {
      if (busyRef.current || value.length < length) return;
      busyRef.current = true;
      setBusy(true);
      setError(false);
      Keyboard.dismiss();

      const result = onVerify(value).catch(() => false); // start the request now

      // 1. four pivots, one point in space — a hand of cards
      slotRefs.current.forEach((s, i) => s?.fan(offsets[i] * 0.74, angles[i], i * 45));
      await sleep(560 + length * 45 + 260);

      // 2. gather into one deck, face down
      resendAlpha.value = withTiming(0.35, { duration: 300 });
      slotRefs.current.forEach((s, i) => s?.stack(offsets[i], stackRot[i], (length - 1 - i) * 35));
      await sleep(460 + length * 35);
      swapText('Checking your code', 'checking');

      // 3. the deck becomes the seal
      setSeal('checking');
      slotRefs.current.forEach(s => s?.hide());
      const [ok] = await Promise.all([result, sleep(650)]);

      // 4. verdict
      if (ok) {
        setSeal('ok');
        setVerified(true);
        swapText('Verified', 'ok', theme.ok);
        resendAlpha.value = withTiming(0, { duration: 250 });
        doneAlpha.value = withDelay(300, withTiming(1, { duration: 420, easing: EASE }));
      } else {
        setSeal('bad');
        if (Platform.OS !== 'web') Vibration.vibrate([0, 50, 40, 50]);
        await sleep(700);
        setSeal('hidden');
        swapText('Enter your code', 'enter');
        setError(true);
        resendAlpha.value = withTiming(1, { duration: 300 });
        resetDeck(true);
      }
    },
    [length, onVerify, offsets, angles, stackRot, swapText, theme.ok, resendAlpha, doneAlpha, resetDeck],
  );

  const onChange = (raw: string) => {
    if (busyRef.current) return;
    const next = raw.replace(/\D/g, '').slice(0, length);
    setError(false);
    setCode(next);
    if (next.length === length) setTimeout(() => verify(next), 420);
  };

  const continuedRef = useRef(false);
  useEffect(() => {
    if (!embedded || !verified || continuedRef.current) return;
    const t = setTimeout(() => {
      continuedRef.current = true;
      onContinue();
    }, 1100);
    return () => clearTimeout(t);
  }, [embedded, verified, onContinue]);

  const handleResend = async () => {
    if (countdown > 0 || busy) return;
    if (!embedded) setCountdown(resendSeconds);
    await onResend?.();
    if (embedded) resetDeck(false);
  };

  const headStyle = useAnimatedStyle(() => ({
    opacity: head.value,
    transform: [{ translateY: (1 - head.value) * -4 }],
  }));
  const resendStyle = useAnimatedStyle(() => ({ opacity: resendAlpha.value }));
  const doneStyle = useAnimatedStyle(() => ({
    opacity: doneAlpha.value,
    transform: [{ translateY: (1 - doneAlpha.value) * 10 }],
  }));

  const subText =
    sub === 'checking' ? 'One moment — we’re confirming it.'
    : sub === 'ok' ? 'Setting up your session…'
    : null;

  const stageH = Math.max(176, slotH + 108);

  const stage = (
    <View
      style={{ width: '100%' }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 40 && Math.abs(w - rowMax) > 1) setRowMax(w);
      }}
    >
      <View style={[styles.stage, { height: stageH }]}>
        <Pressable style={[styles.row, { gap }]} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length }, (_, i) => (
            <Slot
              key={i}
              ref={r => { slotRefs.current[i] = r; }}
              digit={code[i]}
              filled={i < code.length}
              active={!busy && focused && i === code.length}
              theme={theme}
              font={fonts.heading}
              slotW={slotW}
              slotH={slotH}
            />
          ))}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => verify(code)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={length}
            caretHidden
            editable={!busy}
            style={styles.hiddenInput}
            accessibilityLabel="One-time code"
          />
        </Pressable>
        <OtpSeal state={seal} theme={theme} slotW={sealW} slotH={sealH} />
      </View>
    </View>
  );

  const foot = (
    <View style={[styles.foot, embedded && styles.footEmbedded]}>
      {error && (
        <Text style={[styles.err, { color: theme.bad, fontFamily: fonts.bodyBold }]}>
          That code didn’t match — try again
        </Text>
      )}
      {!verified && (
        <Animated.View style={[styles.resend, resendStyle]}>
          {embedded ? (
            <Pressable
              onPress={handleResend}
              disabled={countdown > 0 || busy}
              hitSlop={8}
              style={styles.resendEmbedded}
            >
              <MaterialIcons name="refresh" size={16} color={theme.accent} />
              <Text style={{ color: theme.accent, fontFamily: fonts.bodyBold, fontSize: 14, marginLeft: 6 }}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </Text>
            </Pressable>
          ) : (
            <>
              <Text style={{ color: theme.muted, fontFamily: fonts.body, fontSize: 12.5 }}>Didn’t get a code? </Text>
              <Pressable onPress={handleResend} disabled={countdown > 0 || busy} hitSlop={8}>
                <Text style={{ color: countdown > 0 ? theme.dim : theme.accent, fontFamily: fonts.bodyBold, fontSize: 12.5 }}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      )}
      {verified && (
        <Animated.View
          style={[
            embedded
              ? { alignItems: 'center', marginTop: 6, paddingBottom: 4 }
              : styles.done,
            doneStyle,
          ]}
        >
          {embedded ? (
            <Text
              style={{
                color: theme.ok,
                fontFamily: fonts.heading,
                fontSize: 28,
                lineHeight: 34,
                letterSpacing: 0.6,
                marginTop: 10,
                textAlign: 'center',
              }}
            >
              Verified
            </Text>
          ) : (
            <>
              <View style={[styles.pill, { backgroundColor: theme.okSoft }]}>
                <View style={[styles.pillDot, { backgroundColor: theme.ok }]} />
                <Text style={[styles.pillText, { color: theme.ok, fontFamily: fonts.bodyBold }]}>VERIFIED</Text>
              </View>
              <Pressable
                onPress={onContinue}
                style={({ pressed }) => [styles.cta, { backgroundColor: theme.cta, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              >
                <Text style={[styles.ctaText, { color: theme.ctaText, fontFamily: fonts.heading }]}>CONTINUE</Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embedded}>
        {stage}
        {foot}
      </View>
    );
  }

  return (
    <View style={[styles.panel, { backgroundColor: theme.panel, borderColor: theme.border }]}>
      <View style={[styles.grip, { backgroundColor: theme.grip }]} />
      {logo && <Image source={logo} style={styles.logo} resizeMode="contain" />}

      <Animated.View style={headStyle}>
        <Text style={[styles.title, { color: titleColor ?? theme.text, fontFamily: fonts.heading }]}>
          {title.toUpperCase()}
        </Text>
        <Text style={[styles.sub, { color: theme.muted, fontFamily: fonts.body }]}>
          {subText ?? (
            <>
              We texted a {length}-digit code to{' '}
              <Text style={{ color: theme.text, fontFamily: fonts.bodyBold }}>{phone}</Text>
            </>
          )}
        </Text>
      </Animated.View>

      {stage}
      {foot}
    </View>
  );
}

/* ───────────────────────── Styles ───────────────────────── */
const styles = StyleSheet.create({
  panel: {
    width: '100%', maxWidth: 340, alignSelf: 'center',
    borderRadius: 22, borderWidth: 1, paddingTop: 14, paddingHorizontal: 22, paddingBottom: 26,
    alignItems: 'center',
    shadowColor: '#113744', shadowOpacity: 0.12, shadowRadius: 30, shadowOffset: { width: 0, height: 20 }, elevation: 8,
  },
  grip: { width: 34, height: 4, borderRadius: 4, marginBottom: 14 },
  logo: { width: 40, height: 40, marginBottom: 12 },
  title: { fontSize: 26, letterSpacing: 0.5, textAlign: 'center', lineHeight: 28 },
  sub: { fontSize: 12.5, marginTop: 7, textAlign: 'center', minHeight: 18 },
  embedded: { width: '100%', alignItems: 'center' },
  stage: { height: 150, marginTop: 6, width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  row: { flexDirection: 'row', gap: GAP, overflow: 'visible' },
  hiddenInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.011, color: 'transparent', outlineWidth: 0, outlineStyle: 'none' },
  slot: {
    borderRadius: RADIUS, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', overflow: 'visible',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 6 },
  },
  glow: { position: 'absolute', top: -5.5, left: -5.5, right: -5.5, bottom: -5.5, borderRadius: RADIUS + 4, borderWidth: 4 },
  caret: { position: 'absolute', width: 2, height: 24, borderRadius: 2, zIndex: 3 },
  digit: { fontSize: 34, lineHeight: 40 },
  spark: { position: 'absolute', top: -5, left: -5, zIndex: 4 },
  back: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS - 1.5, padding: 6 },
  backInner: { flex: 1, borderWidth: 1.5, borderRadius: 9 },
  seal: {
    position: 'absolute', width: SLOT_W + 2, height: SLOT_H + 2,
    left: '50%', top: '50%', marginLeft: -(SLOT_W + 2) / 2, marginTop: -(SLOT_H + 2) / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  ticks: { position: 'absolute', width: 120, height: 120, left: (SLOT_W + 2) / 2 - 60, top: (SLOT_H + 2) / 2 - 60 },
  check: { position: 'absolute' },
  foot: { height: 62, width: '100%', marginTop: 4 },
  footEmbedded: { height: 78, marginTop: 16 },
  err: { position: 'absolute', top: -8, left: 0, right: 0, textAlign: 'center', fontSize: 12 },
  resend: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  resendEmbedded: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  done: { ...StyleSheet.absoluteFillObject, alignItems: 'center', gap: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 10.5, letterSpacing: 1.2 },
  cta: {
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 32,
    shadowColor: '#ED1D24', shadowOpacity: 0.28, shadowRadius: 11, shadowOffset: { width: 0, height: 10 }, elevation: 4,
  },
  ctaText: { fontSize: 16, letterSpacing: 1.3 },
});
