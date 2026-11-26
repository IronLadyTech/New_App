import React, { useMemo, useState } from 'react';
import { addToCalendar } from '../../utils/calendarAdd';
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

const RED = '#E52A2A';
const TEAL = '#0E3A44';

/** Small sound-wave mark: five red bars of different heights. */
function WaveMark({ color = RED, heights = [8, 16, 24, 14, 20], width = 3, gap = 3 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 26 }}>
      {heights.map((h, i) => (
        <View key={i} style={{ width, height: h, borderRadius: width, backgroundColor: color, marginRight: i < heights.length - 1 ? gap : 0 }} />
      ))}
    </View>
  );
}

/** "Take a moment" with the red italic "moment", its underline and three accent strokes. */
function MomentHeader() {
  return (
    <View style={{ paddingRight: 28 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <WaveMark />
        <ILText role="title" color={G.ink} style={{ marginLeft: 10, fontFamily: IL_FONTS.display, fontSize: 30, lineHeight: 38 }}>
          {'Take a '}
        </ILText>
        <View>
          <ILText role="title" color={RED} style={{ fontFamily: IL_FONTS.displayItalic, fontSize: 30, lineHeight: 38 }}>
            moment
          </ILText>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: RED, marginTop: -4, marginLeft: 6, marginRight: -4, transform: [{ rotate: '-2deg' }] }} />
        </View>
        {/* Three accent strokes, top right of "moment". */}
        <View style={{ marginLeft: 8, marginTop: -26 }}>
          <View style={{ width: 2, height: 10, backgroundColor: G.ink, borderRadius: 1, transform: [{ rotate: '25deg' }] }} />
          <View style={{ width: 10, height: 2, backgroundColor: G.ink, borderRadius: 1, marginTop: 3, marginLeft: 6, transform: [{ rotate: '-20deg' }] }} />
          <View style={{ width: 9, height: 2, backgroundColor: G.ink, borderRadius: 1, marginTop: 5, marginLeft: 6, transform: [{ rotate: '10deg' }] }} />
        </View>
      </View>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, marginLeft: 34, fontSize: 14 }}>
        {'Listen  ·  Learn  ·  Be Inspired'}
      </ILText>
    </View>
  );
}

/**
 * Iron Lady Speaks episode: photo on the left, a dark panel on the right with the badge, title,
 * the cover's subtitle, a red play button and speaker · episode · length; "Listen Now" below.
 */
function PodcastMomentCard({ moment, width, onPress }) {
  const cardW = Math.max(280, width - 40);
  const panelH = Math.round(cardW * 0.5);
  const photoW = Math.round(cardW * 0.44);
  // The cover is 16:9 with the guest on the right half: draw it at full width for this height
  // and show its right side (the speaker this episode is about).
  const coverW = Math.round(panelH * (16 / 9));
  const meta = [moment.who, moment.episode, moment.length].filter(Boolean).join('  ·  ');
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Play ${moment.title}`} style={{ marginTop: 14 }}>
      {/* Red shape peeking out behind the top-right corner. */}
      <View style={{ position: 'absolute', right: -6, top: -14, width: 120, height: 90, borderTopRightRadius: 40, borderTopLeftRadius: 90, borderBottomRightRadius: 30, backgroundColor: RED, opacity: 0.9, transform: [{ rotate: '8deg' }] }} />
      <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: G.white, shadowColor: '#0F1B3D', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 }}>
        <View style={{ flexDirection: 'row', height: panelH }}>
          <View style={{ width: photoW, height: panelH, overflow: 'hidden', backgroundColor: TEAL }}>
            {moment.img ? (
              <Image
                source={moment.img}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: coverW,
                  height: panelH,
                  ...(moment.coverFocus === 'left'
                    ? { left: 0 }
                    : moment.coverFocus === 'center'
                      ? { left: -Math.round((coverW - photoW) / 2) }
                      : { right: 0 }),
                }}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <View style={{ flex: 1, backgroundColor: TEAL, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 }}>
            {/* Faint sound wave, top right. */}
            <View style={{ position: 'absolute', right: 12, top: 14, opacity: 0.18 }}>
              <WaveMark color="#FFFFFF" width={2} gap={3} heights={[10, 22, 14, 30, 18, 26, 12, 20]} />
            </View>
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: RED, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <MaterialIcons name={moment.badgeIcon || 'headphones'} size={13} color="#FFFFFF" />
              <ILText role="label" color="#FFFFFF" style={{ marginLeft: 5, fontSize: 10, letterSpacing: 0.4 }}>
                {moment.badgeText || 'IRON LADY SPEAKS'}
              </ILText>
            </View>
            <ILText role="title" color="#FFFFFF" numberOfLines={2} style={{ marginTop: 10, fontFamily: IL_FONTS.displayBold, fontSize: 21, lineHeight: 25, paddingRight: 54 }}>
              {moment.title}
            </ILText>
            {moment.tagline ? (
              <ILText role="bodySm" color="rgba(255,255,255,0.85)" numberOfLines={2} style={{ marginTop: 6, fontSize: 12, lineHeight: 17, paddingRight: 54 }}>
                {moment.tagline}
              </ILText>
            ) : null}
            <View style={{ flex: 1 }} />
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.16)', marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="mic-none" size={13} color="rgba(255,255,255,0.8)" />
              <ILText role="bodySm" color="rgba(255,255,255,0.85)" numberOfLines={1} style={{ marginLeft: 5, fontSize: 11, flex: 1 }}>
                {meta}
              </ILText>
            </View>
            {/* Red play button, right middle. */}
            <View style={{ position: 'absolute', right: 12, top: panelH / 2 - 26, width: 52, height: 52, borderRadius: 26, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.18)' }}>
              <MaterialIcons name="play-arrow" size={30} color="#FFFFFF" />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#FCEEEE' }}>
          <WaveMark width={3} gap={2} heights={[8, 14, 10]} />
          <ILText role="label" color={RED} style={{ marginLeft: 10, fontSize: 15, flex: 1 }}>
            {moment.barText || 'Listen Now'}
          </ILText>
          <MaterialIcons name="arrow-forward" size={20} color={RED} />
        </View>
      </View>
    </Pressable>
  );
}

/**
 * C-Suite League story: the cover already carries the title, guest and role, so it is shown
 * whole (no teal panel over it), with the action bar below.
 */
function CsuiteMomentCard({ moment, onPress }) {
  return (
    <MomentShell
      onPress={onPress}
      label={`Play ${moment.title}`}
      barIcon={<MaterialIcons name="play-circle-outline" size={20} color={RED} />}
      barLabel={moment.barText || 'Watch now'}
    >
      <View style={{ aspectRatio: 16 / 9, backgroundColor: TEAL }}>
        {moment.img ? <Image source={moment.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
      </View>
    </MomentShell>
  );
}

/** Shared shell: red shape behind the corner, rounded white card, and the pink action bar. */
function MomentShell({ onPress, label, barIcon, barLabel, children, blobLeft = false }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ marginTop: 14 }}>
      {blobLeft ? (
        <View style={{ position: 'absolute', left: -8, bottom: 40, width: 70, height: 70, borderRadius: 35, backgroundColor: RED, opacity: 0.9 }} />
      ) : (
        <View style={{ position: 'absolute', right: -6, top: -14, width: 120, height: 90, borderTopRightRadius: 40, borderTopLeftRadius: 90, borderBottomRightRadius: 30, backgroundColor: RED, opacity: 0.9, transform: [{ rotate: '8deg' }] }} />
      )}
      <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: G.white, shadowColor: '#0F1B3D', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 }}>
        {children}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#FCEEEE' }}>
          {barIcon}
          <ILText role="label" color={RED} style={{ marginLeft: 10, fontSize: 15, flex: 1 }}>
            {barLabel}
          </ILText>
          <MaterialIcons name="arrow-forward" size={20} color={RED} />
        </View>
      </View>
    </Pressable>
  );
}

function Badge({ icon, text, light = false }) {
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: light ? '#FFFFFF' : RED, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <MaterialIcons name={icon} size={13} color={light ? RED : '#FFFFFF'} />
      <ILText role="label" color={light ? TEAL : '#FFFFFF'} style={{ marginLeft: 5, fontSize: 10, letterSpacing: 0.4 }}>
        {text}
      </ILText>
    </View>
  );
}

/** Team post: picture on top (badge + play when it is a video), dark panel, Watch/Open/Read bar. */
function TeamPostMomentCard({ moment, width, onPress }) {
  const cardW = Math.max(280, width - 40);
  const picH = Math.round(cardW * 0.43);
  const picture = moment.imageUrl ? { uri: moment.imageUrl } : null;
  return (
    <MomentShell
      onPress={onPress}
      label={`${moment.eyebrow}: ${moment.title}`}
      blobLeft
      barIcon={<MaterialIcons name={moment.videoUrl ? 'ondemand-video' : moment.link ? 'open-in-new' : 'article'} size={18} color={RED} />}
      barLabel={moment.barLabel || moment.cta}
    >
      {picture ? (
        <View style={{ height: picH, overflow: 'hidden', backgroundColor: TEAL }}>
          <Image source={picture} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ position: 'absolute', left: 12, top: 12 }}>
            <Badge icon="campaign" text="FROM YOUR IRON LADY TEAM" light />
          </View>
          {moment.videoUrl ? (
            <View style={{ position: 'absolute', right: 12, bottom: 12, width: 46, height: 46, borderRadius: 23, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' }}>
              <MaterialIcons name="play-arrow" size={26} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={{ backgroundColor: TEAL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 }}>
        {picture ? null : <Badge icon="campaign" text="FROM YOUR IRON LADY TEAM" light />}
        {moment.postedLabel ? (
          <ILText role="bodySm" color="rgba(255,255,255,0.7)" style={{ marginTop: picture ? 0 : 10, fontSize: 11 }}>
            {moment.postedLabel}
          </ILText>
        ) : null}
        <ILText role="title" color="#FFFFFF" numberOfLines={3} style={{ marginTop: 6, fontFamily: IL_FONTS.displayBold, fontSize: 21, lineHeight: 26 }}>
          {moment.title}
        </ILText>
        {moment.body ? (
          <ILText role="bodySm" color="rgba(255,255,255,0.85)" numberOfLines={2} style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}>
            {moment.body}
          </ILText>
        ) : null}
      </View>
    </MomentShell>
  );
}

/** Army event: big red date tile on the left, dark panel, Add to calendar bar. */
function EventMomentCard({ moment, width, onPress }) {
  const cardW = Math.max(280, width - 40);
  const panelH = Math.round(cardW * 0.5);
  const tile = moment.dateTile;
  return (
    <MomentShell
      onPress={onPress}
      label={`${moment.eyebrow}: ${moment.headTitle || moment.title}`}
      barIcon={<MaterialIcons name="event" size={18} color={RED} />}
      barLabel="Add to calendar"
    >
      <View style={{ flexDirection: 'row', height: panelH }}>
        <View style={{ width: Math.round(cardW * 0.35), backgroundColor: RED, alignItems: 'center', justifyContent: 'center' }}>
          {tile ? (
            <>
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 12, letterSpacing: 2 }}>{tile.dow}</ILText>
              <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.displayBold, fontSize: 52, lineHeight: 58 }}>{tile.day}</ILText>
              <ILText role="label" color="#FFFFFF" style={{ fontSize: 12, letterSpacing: 2 }}>{tile.monthYear}</ILText>
              {tile.time ? (
                <View style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>{tile.time}</ILText>
                </View>
              ) : null}
            </>
          ) : (
            <MaterialIcons name="event" size={40} color="#FFFFFF" />
          )}
        </View>
        <View style={{ flex: 1, backgroundColor: TEAL, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 }}>
          <Badge icon="groups" text="IRON LADY ARMY" />
          <ILText role="title" color="#FFFFFF" numberOfLines={2} style={{ marginTop: 10, fontFamily: IL_FONTS.displayBold, fontSize: 21, lineHeight: 25 }}>
            {moment.headTitle || moment.title}
          </ILText>
          {moment.subTitle ? (
            <ILText role="bodySm" color="rgba(255,255,255,0.85)" numberOfLines={2} style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}>
              {moment.subTitle}
            </ILText>
          ) : null}
          <View style={{ flex: 1 }} />
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.16)', marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="public" size={13} color="rgba(255,255,255,0.8)" />
            <ILText role="bodySm" color="rgba(255,255,255,0.85)" numberOfLines={1} style={{ marginLeft: 5, fontSize: 11, flex: 1 }}>
              {moment.metaLine}
            </ILText>
          </View>
        </View>
      </View>
    </MomentShell>
  );
}

/** Principle of the day: a dark quote card with the number behind it, Reflect bar. */
function PrincipleMomentCard({ moment, onPress }) {
  const n = String(moment.principleN || '').padStart(2, '0');
  return (
    <MomentShell
      onPress={onPress}
      label={`Principle ${n}: ${moment.quote || moment.title}`}
      barIcon={<MaterialIcons name="edit" size={18} color={RED} />}
      barLabel="Reflect in one line"
    >
      <View style={{ backgroundColor: TEAL, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20, overflow: 'hidden' }}>
        <ILText
          role="title"
          color="rgba(255,255,255,0.07)"
          style={{ position: 'absolute', right: 10, top: -34, fontFamily: IL_FONTS.displayBold, fontSize: 150, lineHeight: 160 }}
        >
          {n}
        </ILText>
        <Badge icon="star-border" text="TODAY’S LEADERSHIP IDEA" />
        <ILText role="label" color="rgba(255,255,255,0.6)" style={{ marginTop: 14, fontSize: 12, letterSpacing: 1.5 }}>
          {`PRINCIPLE ${n} OF 27`}
        </ILText>
        <ILText role="title" color="#FFFFFF" style={{ marginTop: 6, fontFamily: IL_FONTS.displayItalic, fontSize: 26, lineHeight: 32 }}>
          {moment.quote ? `“${moment.quote}.”` : moment.title}
        </ILText>
        <View style={{ width: 40, height: 3, borderRadius: 2, backgroundColor: RED, marginTop: 14 }} />
        <ILText role="bodySm" color="rgba(255,255,255,0.85)" style={{ marginTop: 12, fontSize: 13, lineHeight: 19 }}>
          {moment.reflection || moment.body}
        </ILText>
      </View>
    </MomentShell>
  );
}

/**
 * Optional engagement between Today’s practice and Due this week — not tracked as a task.
 */
export default function LepHomeTakeAMoment({ todayIso, day1Iso, cmsBatch, nav, navigation }) {
  const { width } = useWindowDimensions();
  const cmsPosts = useCmsEngagePosts('lep', cmsBatch);
  const { nextOffline, featured } = useArmyEventCalendar();
  // Long-press "Take a moment" to preview each kind in turn (for checking the designs with real
  // content; only one kind shows on a normal day). Off again after the last kind.
  const KINDS = [null, 'cms', 'army', 'listen', 'principle', 'csuite'];
  const [forceIdx, setForceIdx] = useState(0);
  const force = KINDS[forceIdx];
  const moment = useMemo(
    () =>
      resolveLepHomeMoment({
        todayIso,
        day1Iso,
        cmsPosts,
        nextOffline,
        featured,
        force,
      }),
    [todayIso, day1Iso, cmsPosts, nextOffline, featured, force]
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
        if (url) addToCalendar(url).then((ok) => !ok && nav.goEngage());
        else nav.goEngage();
        break;
      }
      case 'listen':
      case 'csuite':
        nav.goWatch({ assetKey: moment.assetKey, title: moment.title, sub: moment.who || moment.body });
        break;
      case 'principle':
        nav.goPractice('lep', 'lep-principle', { principleN: moment.principleN });
        break;
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
      <Pressable onLongPress={() => setForceIdx((i) => (i + 1) % KINDS.length)} delayLongPress={600} pressFeedback={false} accessibilityRole="header">
        <MomentHeader />
      </Pressable>
      {force ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 11 }}>
          {`Preview: ${force === 'cms' ? 'team post' : force === 'army' ? 'Army event' : force === 'listen' ? 'podcast' : force === 'csuite' ? 'C-suite story' : 'principle'} · long-press the heading for the next`}
        </ILText>
      ) : null}
      {moment.kind === 'csuite' ? (
        <CsuiteMomentCard moment={moment} onPress={onPrimary} />
      ) : moment.kind === 'listen' ? (
        <PodcastMomentCard moment={moment} width={width || 360} onPress={onPrimary} />
      ) : moment.kind === 'cms' ? (
        <TeamPostMomentCard moment={moment} width={width || 360} onPress={onPrimary} />
      ) : moment.kind === 'army' ? (
        <EventMomentCard moment={moment} width={width || 360} onPress={onPrimary} />
      ) : moment.kind === 'principle' ? (
        <PrincipleMomentCard moment={moment} onPress={onPrimary} />
      ) : (

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
      )}
    </View>
  );
}
