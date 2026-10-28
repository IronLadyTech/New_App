import React from 'react';
import { Image, View } from 'react-native';
import Pressable from '../il/Press';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { HERO } from '../../screens/lep/lepData';

function PreworkHeader({ total, doneCount, heading, description }) {
  const title =
    heading || (total === 1 ? 'Watch this before your rituals' : `Watch these ${total} before Day 1`);
  const sub = description ?? 'Essential foundations curated by Rajesh & IL Guide';
  return (
    <View style={{ marginTop: 26 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ILText
          role="title"
          color={G.ink}
          style={{ flex: 1, paddingRight: 12, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}
        >
          {title}
        </ILText>
        <View
          style={{
            backgroundColor: G.pink,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
            marginTop: 2,
          }}
        >
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9, letterSpacing: 0.6 }]}>
            {doneCount} OF {total} DONE
          </ILText>
        </View>
      </View>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
        {sub}
      </ILText>
    </View>
  );
}

function PreworkWatchedRow({ item, onPress }) {
  return (
    <WhiteCard
      onPress={onPress}
      style={{ marginTop: 10, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }}
    >
      <View style={{ width: 96, height: 86, backgroundColor: G.dark }}>
        <Image
          source={item.thumb || HERO}
          style={{ width: '100%', height: '100%', opacity: 0.55 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: 'absolute',
            left: 34,
            top: 29,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: G.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="check" size={16} color={G.ink} />
        </View>
        <View
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 10 }}>
            {item.min}
          </ILText>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ILText role="title" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
            {item.n}
          </ILText>
          <View style={{ backgroundColor: G.pink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 8 }]}>
              Watched
            </ILText>
          </View>
        </View>
        <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 14 }}>
          {item.title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }} numberOfLines={1}>
          {item.sub}
        </ILText>
      </View>
    </WhiteCard>
  );
}

function PreworkUpNextRow({ item, onPress }) {
  return (
    <WhiteCard
      onPress={onPress}
      style={{ marginTop: 10, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }}
    >
      <View style={{ width: 96, height: 86, backgroundColor: G.dark }}>
        <Image source={item.thumb || HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            left: 34,
            top: 29,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={18} color={G.cta} />
        </View>
        <View
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 10 }}>
            {item.min}
          </ILText>
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ILText role="title" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
            {item.n}
          </ILText>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 8 }]}>
            Up next
          </ILText>
        </View>
        <ILText role="label" color={G.ink} style={{ marginTop: 4, fontSize: 14 }}>
          {item.title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }} numberOfLines={1}>
          {item.sub}
        </ILText>
      </View>
    </WhiteCard>
  );
}

function PreworkNextCard({ item, onPress }) {
  return (
    <WhiteCard onPress={onPress} style={{ marginTop: 10, borderRadius: 22, padding: 12 }}>
      <View style={{ height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: G.dark }}>
        <Image source={item.thumb || HERO} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: G.cta,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 6 }} />
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 10 }]}>
            Next to watch
          </ILText>
        </View>
        <View
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: G.cta,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
        </View>
        <View
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
            {item.min}
          </ILText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 12 }}>
        <ILText role="title" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 18, lineHeight: 22 }}>
          {item.n}
        </ILText>
        <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 11, marginLeft: 8 }]}>
          Crucial pre-requisite
        </ILText>
      </View>
      <ILText
        role="title"
        color={G.ink}
        style={{ marginTop: 4, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
      >
        {item.title}
      </ILText>
      <ILText role="bodySm" color={G.body} style={{ marginTop: 4, fontSize: 13, lineHeight: 19 }}>
        {item.sub}
      </ILText>
    </WhiteCard>
  );
}

/**
 * Pre–Day 1 pre-work: compact “Watched” rows + one hero “Next to watch” card (reference MoM enrolled home).
 */
export default function PreworkBeforeDay1({ items, onOpenItem, heading, description }) {
  if (!items?.length) return null;
  const doneCount = items.filter((i) => i.done).length;
  const watched = items.filter((i) => i.done);
  const next = items.find((i) => !i.done);
  const queued = items.filter((i) => !i.done && i !== next);
  const open = (item) => {
    if (item?.practiceId && onOpenItem) onOpenItem(item);
  };

  return (
    <>
      <PreworkHeader
        total={items.length}
        doneCount={doneCount}
        heading={heading}
        description={description}
      />
      {watched.map((item) => (
        <PreworkWatchedRow key={item.n} item={item} onPress={() => open(item)} />
      ))}
      {next ? <PreworkNextCard key={next.n} item={next} onPress={() => open(next)} /> : null}
      {queued.map((item) => (
        <PreworkUpNextRow key={item.n} item={item} onPress={() => open(item)} />
      ))}
    </>
  );
}
