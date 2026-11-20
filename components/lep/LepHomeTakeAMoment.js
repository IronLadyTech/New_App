import React, { useMemo } from 'react';
import { Image, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';
import { LinkRow, WhiteCard } from '../../screens/lep/LepBits';
import { useCmsEngagePosts } from '../../hooks/useCmsLearnerItems';
import { useArmyEventCalendar } from '../../hooks/useArmyEventCalendar';
import { resolveLepHomeMoment } from '../../utils/lepHomeMoment';
import { openLink } from '../../utils/openLink';
import { armyEventCalendarUrl } from '../../utils/armyEventCalendar';
import { Linking } from 'react-native';

/**
 * Optional engagement between Today’s practice and Due this week — not tracked as a task.
 */
export default function LepHomeTakeAMoment({ todayIso, day1Iso, cmsBatch, nav, navigation }) {
  const { width } = useWindowDimensions();
  const cmsPosts = useCmsEngagePosts('lep', cmsBatch);
  const { nextOffline, featured } = useArmyEventCalendar();
  const moment = useMemo(
    () =>
      resolveLepHomeMoment({
        todayIso,
        day1Iso,
        cmsPosts,
        nextOffline,
        featured,
      }),
    [todayIso, day1Iso, cmsPosts, nextOffline, featured]
  );

  const onPrimary = () => {
    if (!moment) return;
    switch (moment.kind) {
      case 'cms': {
        const target = moment.videoUrl || moment.link;
        if (target) openLink(target, { navigation, title: moment.title });
        else nav.goEngage();
        break;
      }
      case 'army': {
        const url = armyEventCalendarUrl(moment.event);
        if (url) Linking.openURL(url).catch(() => nav.goEngage());
        else nav.goEngage();
        break;
      }
      case 'listen':
        nav.goWatch({ assetKey: moment.assetKey, title: moment.title, sub: moment.body });
        break;
      case 'principle':
      default:
        nav.goEngage();
        break;
    }
  };

  if (!moment) return null;

  const icon =
    moment.kind === 'cms' ? 'campaign' : moment.kind === 'army' ? 'groups' : moment.kind === 'listen' ? 'headphones' : 'auto-awesome';
  const picture = moment.imageUrl ? { uri: moment.imageUrl } : moment.img || null;
  const playable = moment.kind === 'listen' || Boolean(moment.videoUrl);
  // Card width = screen minus the page's 20 px sides; the picture is 16:9 of that.
  const frameH = Math.round(((width || 360) - 40) * (9 / 16));

  // One card, one action: the whole card opens it. A picture leads when there is one; the
  // principle of the day gets a dark quote card instead.
  return (
    <View style={{ marginTop: 18 }}>
      <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
        Take a moment
      </ILText>

      <Pressable onPress={onPrimary} accessibilityRole="button" accessibilityLabel={`${moment.eyebrow}: ${moment.title}`} style={{ marginTop: 10 }}>
        <View style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: picture ? G.white : G.dark, borderWidth: picture ? 1 : 0, borderColor: G.line }}>
          {picture ? (
            // A fixed 16:9 frame with the picture cropped to fill it. (Width 100% + aspectRatio on
            // the Image alone fell back to the picture's own size: a tall portrait filled the screen.)
            <View style={{ width: '100%', height: frameH, overflow: 'hidden', backgroundColor: G.dark }}>
              <Image
                source={picture}
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              {playable ? (
                <View style={{ position: 'absolute', right: 12, bottom: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: G.cta, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="play-arrow" size={26} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: picture ? G.pink : 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <MaterialIcons name={icon} size={13} color={picture ? G.cta : '#FFFFFF'} />
                <ILText role="eyebrow" color={picture ? G.cta : '#FFFFFF'} style={{ marginLeft: 5, fontSize: 10 }}>
                  {moment.eyebrow}
                </ILText>
              </View>
              {moment.kicker ? (
                <ILText role="bodySm" color={picture ? G.meta : 'rgba(255,255,255,0.65)'} style={{ marginLeft: 8, fontSize: 11 }}>
                  {moment.kicker}
                </ILText>
              ) : null}
            </View>
            <ILText
              role="title"
              color={picture ? G.ink : '#FFFFFF'}
              style={{ marginTop: 10, fontFamily: IL_FONTS.display, fontSize: picture ? 20 : 22, lineHeight: picture ? 26 : 29 }}
            >
              {moment.title}
            </ILText>
            {moment.body ? (
              <ILText role="bodySm" color={picture ? G.meta : 'rgba(255,255,255,0.75)'} style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }} numberOfLines={3}>
                {moment.body}
              </ILText>
            ) : null}
            <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
              <ILText role="label" color={picture ? G.cta : '#FFFFFF'} style={{ fontSize: 14 }}>
                {moment.cta}
              </ILText>
              <MaterialIcons name="arrow-forward" size={16} color={picture ? G.cta : '#FFFFFF'} style={{ marginLeft: 6 }} />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
