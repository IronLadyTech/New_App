import React, { useMemo } from 'react';
import { Image, View } from 'react-native';
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

  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
            Take a moment
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
            Not on your checklist — inspiration, community, or a story.
          </ILText>
        </View>
      </View>

      <WhiteCard style={{ marginTop: 10, borderRadius: 22, padding: 16 }}>
        {moment.imageUrl ? (
          <Image
            source={{ uri: moment.imageUrl }}
            style={{ width: '100%', height: 140, borderRadius: 16, marginBottom: 12 }}
            resizeMode="cover"
          />
        ) : null}
        {moment.img ? (
          <View style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden' }}>
            <Image source={moment.img} style={{ width: '100%', height: 120 }} resizeMode="cover" />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons
            name={
              moment.kind === 'cms'
                ? 'campaign'
                : moment.kind === 'army'
                  ? 'groups'
                  : moment.kind === 'listen'
                    ? 'headphones'
                    : 'auto-awesome'
            }
            size={16}
            color={G.cta}
          />
          <ILText role="eyebrow" color={G.cta} style={{ marginLeft: 6, fontSize: 11 }}>
            {moment.eyebrow}
          </ILText>
          {moment.kicker ? (
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 11 }}>
              · {moment.kicker}
            </ILText>
          ) : null}
        </View>
        <ILText role="label" color={G.ink} style={{ marginTop: 8, fontSize: 17, lineHeight: 23 }}>
          {moment.title}
        </ILText>
        {moment.body ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }} numberOfLines={4}>
            {moment.body}
          </ILText>
        ) : null}
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={onPrimary} accessibilityRole="button">
            <ILText role="label" color={G.cta} style={{ fontSize: 14 }}>
              {moment.cta} →
            </ILText>
          </Pressable>
          {moment.kind !== 'principle' ? (
            <LinkRow label="Engage tab" onPress={nav.goEngage} />
          ) : null}
        </View>
      </WhiteCard>
    </View>
  );
}
