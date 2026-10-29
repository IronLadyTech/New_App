import React, { useEffect } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Reanimated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';

/**
 * Upload pill: a red fill grows with the real bytes sent, the arrow bobs while it moves,
 * and a check pops in when it lands. Animations run on the UI thread, so the fill keeps
 * moving while JS reads the file or saves.
 *
 *   progress — 0–100 while uploading, null when there is nothing in flight
 *   done     — the file is up (check icon)
 *   busy     — saving after the upload (fill stays full, arrow keeps bobbing)
 */
export default function UploadProgressButton({ label, progress = null, done = false, busy = false, onPress, disabled }) {
  const fill = useSharedValue(0);
  const bob = useSharedValue(0);
  const pop = useSharedValue(done ? 1 : 0);
  const moving = progress !== null || busy;

  useEffect(() => {
    const target = done || busy ? 100 : progress ?? 0;
    fill.value = withTiming(target, { duration: target === 0 ? 0 : 280 });
  }, [progress, done, busy, fill]);

  useEffect(() => {
    if (moving && !done) {
      bob.value = withRepeat(withSequence(withTiming(-3, { duration: 320 }), withTiming(0, { duration: 320 })), -1);
    } else {
      cancelAnimation(bob);
      bob.value = withTiming(0, { duration: 120 });
    }
  }, [moving, done, bob]);

  useEffect(() => {
    pop.value = done ? withSequence(withTiming(1.25, { duration: 140 }), withSpring(1, { damping: 9 })) : 0;
  }, [done, pop]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }], opacity: pop.value > 0 ? 1 : 0 }));

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: moving }}
      style={{
        height: 56,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: moving || done ? 'rgba(237,29,36,0.45)' : G.cta,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: disabled && !moving ? 0.55 : 1,
      }}
    >
      <Reanimated.View
        pointerEvents="none"
        style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: G.cta }, fillStyle]}
      />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <ILText role="label" color="#FFFFFF" style={{ fontSize: 16 }}>
          {label}
        </ILText>
      </View>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          marginRight: 8,
          backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? (
          <Reanimated.View style={checkStyle}>
            <MaterialIcons name="check" size={22} color="#FFFFFF" />
          </Reanimated.View>
        ) : (
          <Reanimated.View style={arrowStyle}>
            <MaterialIcons name="arrow-upward" size={22} color="#FFFFFF" />
          </Reanimated.View>
        )}
      </View>
    </Pressable>
  );
}
