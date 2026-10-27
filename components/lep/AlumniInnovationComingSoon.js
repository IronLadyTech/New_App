import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';

function PulseOrb({ delay, size, color, style }) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.85, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(0.65, { duration: 2200 }), withTiming(0.25, { duration: 2200 })),
        -1,
        false
      )
    );
  }, [delay, opacity, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        anim,
      ]}
    />
  );
}

/**
 * Polished “not live yet” shell for alumni film, community, etc.
 */
export default function AlumniInnovationComingSoon({
  icon = 'auto-awesome',
  eyebrow = 'Iron Lady Alumni',
  title = 'Coming soon',
  body,
  footnote,
  batchLabel,
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
      <View
        style={{
          width: '100%',
          height: 200,
          borderRadius: 24,
          backgroundColor: G.dark,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PulseOrb delay={0} size={140} color="rgba(232, 62, 140, 0.35)" style={{ top: 20, left: -20 }} />
        <PulseOrb delay={400} size={100} color="rgba(255, 255, 255, 0.12)" style={{ bottom: 10, right: -10 }} />
        <PulseOrb delay={800} size={72} color="rgba(232, 62, 140, 0.22)" style={{ top: 50, right: 40 }} />
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        >
          <MaterialIcons name={icon} size={36} color={G.pink} />
        </View>
        <ILText
          role="eyebrow"
          color={G.pink}
          style={[af, { marginTop: 16, fontSize: 10, letterSpacing: 1.2 }]}
        >
          {eyebrow}
        </ILText>
        <ILText
          role="title"
          color="#FFFFFF"
          style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 26, lineHeight: 32 }}
        >
          {title}
        </ILText>
        {batchLabel ? (
          <ILText role="bodySm" color="rgba(255,255,255,0.55)" style={{ marginTop: 6, fontSize: 12 }}>
            {batchLabel}
          </ILText>
        ) : null}
      </View>

      <WhiteCard style={{ marginTop: 16, borderRadius: 20, padding: 18, width: '100%' }}>
        <ILText role="body" color={G.body} style={{ fontSize: 15, lineHeight: 22 }}>
          {body}
        </ILText>
        {footnote ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 12, fontSize: 13, lineHeight: 19 }}>
            {footnote}
          </ILText>
        ) : null}
      </WhiteCard>
    </View>
  );
}
