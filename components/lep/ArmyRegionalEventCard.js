import React from 'react';
import { Image, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ILText from '../il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { armyEventDateBadge } from '../../utils/armyEventCalendar';
import { FACE } from '../../screens/lep/lepData';

/**
 * “Upcoming events near you” card — driven by the live Army calendar (not mock Sep/Oct dates).
 */
export default function ArmyRegionalEventCard({ event, onPress, attendingLabel = '+28 attending' }) {
  if (!event) return null;
  const badge = armyEventDateBadge(event);
  const place =
    event.city && event.mode === 'offline'
      ? `${event.city}${event.meta?.includes('Marriott') ? '' : ''}`
      : event.meta?.split('·')[0]?.trim() || 'In person';
  const subtitle =
    event.seriesTitle && event.seriesTitle !== event.title
      ? `“${event.title.replace(/^.*·\s*/, '')}”`
      : event.speaker
        ? `With ${event.speaker}`
        : event.meta;

  return (
    <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{
            width: 56,
            borderRadius: 16,
            backgroundColor: G.dark,
            alignItems: 'center',
            paddingVertical: 8,
          }}
        >
          <ILText role="eyebrow" color="#FFFFFF" style={[af, { fontSize: 9 }]}>
            {badge.mon}
          </ILText>
          <ILText role="title" color="#FFFFFF" style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 24 }}>
            {badge.day}
          </ILText>
          <ILText role="eyebrow" color="rgba(255,255,255,0.6)" style={[af, { fontSize: 8 }]}>
            {badge.dow}
          </ILText>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="place" size={12} color={G.meta} />
            <ILText role="bodySm" color={G.meta} style={{ marginLeft: 4, fontSize: 12 }} numberOfLines={1}>
              {place}
            </ILText>
          </View>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
            numberOfLines={2}
          >
            {event.city ? `${event.city} Chapter Meetup` : event.title}
          </ILText>
          {subtitle ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 13 }} numberOfLines={2}>
              {subtitle}
            </ILText>
          ) : null}
        </View>
      </View>
      <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <Image
              key={i}
              source={FACE}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                marginLeft: i ? -8 : 0,
                borderWidth: 2,
                borderColor: G.white,
              }}
            />
          ))}
          <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 12 }}>
            {attendingLabel}
          </ILText>
        </View>
        <View style={{ backgroundColor: G.cta, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
          <ILText role="label" color="#FFFFFF" style={{ fontSize: 12 }}>
            RSVP
          </ILText>
        </View>
      </View>
    </WhiteCard>
  );
}
