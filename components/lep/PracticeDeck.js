import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Pressable from '../il/Press';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { practiceSummary } from '../../screens/lep/lepData';
import { LinkRow, SoftChip, WhiteCard } from '../../screens/lep/LepBits';

const DECK_SPRING = { damping: 17, stiffness: 95, mass: 0.9 };

/**
 * Swipeable stack for Today’s practice (tap to open, swipe to skip).
 */
export default function PracticeDeck({
  items = [],
  streakLabel = '',
  onOpen,
  onStreakPress,
  onItem,
  note = 'Aligned to your batch calendar',
}) {
  const [aside, setAside] = useState([]);
  const leftover = items.filter((item) => !item.done);
  const remaining = leftover.filter((item) => !aside.includes(item.id));
  const stack = remaining.slice(0, 3);
  const canRefresh = aside.length > 0;

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
            Today’s practice
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }}>
            {practiceSummary(items)}
          </ILText>
        </View>
        {onOpen ? <LinkRow label="Open checklist" onPress={onOpen} /> : null}
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {streakLabel ? (
          onStreakPress ? (
            <Pressable onPress={onStreakPress} accessibilityRole="button" accessibilityLabel="Your progress">
              <SoftChip icon="local-fire-department">{streakLabel}</SoftChip>
            </Pressable>
          ) : (
            <SoftChip icon="local-fire-department">{streakLabel}</SoftChip>
          )
        ) : (
          <View />
        )}
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
          {note}
        </ILText>
      </View>

      {remaining.length ? (
        <View style={{ marginTop: 14, height: 208 }}>
          {stack
            .slice()
            .reverse()
            .map((item, paintI, arr) => {
              const slot = arr.length - 1 - paintI;
              return (
                <DeckCard
                  key={item.id}
                  item={item}
                  slot={slot}
                  onPress={() => (onItem ? onItem(item) : onOpen?.())}
                  onSkip={() => setAside((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))}
                />
              );
            })}
        </View>
      ) : (
        <View style={{ marginTop: 18, paddingVertical: 18, alignItems: 'center' }}>
          <MaterialIcons name="check-circle" size={22} color={G.ink} />
          <ILText role="label" color={G.ink} style={{ marginTop: 8 }}>
            {leftover.length ? 'That’s all for now.' : 'Today’s practice is done.'}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13, textAlign: 'center' }}>
            {leftover.length ? 'Swipe skipped the rest.' : 'The next card will wait for tomorrow.'}
          </ILText>
        </View>
      )}
      {canRefresh ? (
        <Pressable
          onPress={() => setAside([])}
          accessibilityRole="button"
          accessibilityLabel="Show skipped tasks again"
          hitSlop={8}
          style={({ pressed }) => ({
            alignSelf: 'center',
            marginTop: 12,
            opacity: pressed ? 0.55 : 1,
          })}
        >
          <MaterialIcons name="refresh" size={22} color={G.ink} />
        </Pressable>
      ) : null}
    </WhiteCard>
  );
}

function DeckCard({ item, slot, onPress, onSkip }) {
  const place = useSharedValue(slot);
  const dragX = useSharedValue(0);
  const front = slot === 0;

  useEffect(() => {
    place.value = withSpring(slot, DECK_SPRING);
  }, [place, slot]);

  const skip = () => onSkip?.();

  const pan = Gesture.Pan()
    .enabled(front)
    .activeOffsetX([-18, 18])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      dragX.value = e.translationX;
    })
    .onEnd((e) => {
      const away = Math.abs(e.translationX) > 72 || Math.abs(e.velocityX) > 800;
      if (!away) {
        dragX.value = withSpring(0, DECK_SPRING);
        return;
      }
      const dir = (e.translationX === 0 ? e.velocityX : e.translationX) >= 0 ? 1 : -1;
      dragX.value = withTiming(dir * 460, { duration: 260 }, (finished) => {
        if (finished) runOnJS(skip)();
      });
    });

  const tap = Gesture.Tap()
    .enabled(true)
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const gesture = front ? Gesture.Exclusive(pan, tap) : Gesture.Tap().onEnd(() => runOnJS(onPress)());

  const wrapStyle = useAnimatedStyle(() => {
    const s = place.value;
    const x = dragX.value;
    return {
      zIndex: Math.round(10 - s),
      transform: [
        { translateX: x },
        { translateY: s * 14 },
        { rotateZ: `${interpolate(x, [-220, 0, 220], [-10, 0, 10])}deg` },
        { scale: 1 - s * 0.045 },
      ],
    };
  });

  const faceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(place.value, [0, 1, 2], ['#113744', '#5C8188', '#D7E0DC']),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(place.value, [0, 1, 2], ['#F5F2E8', '#F5F2E8', '#113744']),
  }));

  const metaStyle = useAnimatedStyle(() => ({
    color: interpolateColor(place.value, [0, 1, 2], ['rgba(245,242,232,0.7)', 'rgba(245,242,232,0.78)', '#5A574F']),
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    color: interpolateColor(place.value, [0, 1, 2], ['#F8D6D4', '#F8D6D4', '#113744']),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Reanimated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0 }, wrapStyle]}>
        <Reanimated.View style={[{ borderRadius: 18, padding: 16, minHeight: 164 }, faceStyle]}>
          <Reanimated.Text
            style={[
              af,
              {
                fontFamily: IL_FONTS.bold,
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
              },
              eyeStyle,
            ]}
          >
            {slot === 0 ? 'Now' : `Next · ${slot + 1}`}
          </Reanimated.Text>
          <Reanimated.Text
            style={[
              {
                marginTop: 8,
                fontFamily: IL_FONTS.display,
                fontSize: 22,
                lineHeight: 28,
              },
              titleStyle,
            ]}
          >
            {item.title}
          </Reanimated.Text>
          <Reanimated.Text
            style={[
              {
                marginTop: 6,
                fontFamily: IL_FONTS.regular,
                fontSize: 13,
                lineHeight: 18,
              },
              metaStyle,
            ]}
          >
            {item.meta}
          </Reanimated.Text>
          {slot === 0 ? (
            <Reanimated.Text
              style={[
                {
                  marginTop: 16,
                  fontFamily: IL_FONTS.semibold,
                  fontSize: 14,
                  lineHeight: 18,
                },
                titleStyle,
              ]}
            >
              Start this task →
            </Reanimated.Text>
          ) : null}
          {front ? (
            <Reanimated.Text
              style={[
                {
                  marginTop: 6,
                  fontFamily: IL_FONTS.regular,
                  fontSize: 12,
                  lineHeight: 16,
                },
                metaStyle,
              ]}
            >
              Swipe left or right to skip
            </Reanimated.Text>
          ) : null}
        </Reanimated.View>
      </Reanimated.View>
    </GestureDetector>
  );
}
