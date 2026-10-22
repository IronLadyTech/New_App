import React from 'react';
import { Image, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { G } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { useCmsEngagePosts } from '../../hooks/useCmsLearnerItems';
import { openLink } from '../../utils/openLink';

const KIND = {
  event: { label: 'Event', icon: 'event' },
  announcement: { label: 'From your team', icon: 'campaign' },
  video: { label: 'Video', icon: 'play-circle-filled' },
  highlight: { label: 'Highlight', icon: 'star' },
};

function whenLabel(iso) {
  const ms = Date.parse(iso || '');
  if (!Number.isFinite(ms)) return '';
  const d = new Date(ms);
  const day = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  return `${day} · ${time.toUpperCase()}`;
}

/**
 * Events, announcements, videos and highlights the Iron Lady team posted in the CMS
 * for this learner's batch or program. Videos play in the app — never on YouTube.
 */
export default function CmsEngageFeed({ programId = 'lep', cmsBatch, navigation }) {
  const posts = useCmsEngagePosts(programId, cmsBatch);
  if (!posts.length) return null;

  return (
    <View style={{ marginTop: 20 }}>
      <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
        From your Iron Lady team
      </ILText>
      {posts.map((p) => {
        const kind = KIND[p.kind] || KIND.announcement;
        const target = p.videoUrl || p.link;
        const meta = [p.when ? whenLabel(p.when) : '', p.place].filter(Boolean).join(' · ');
        return (
          <Pressable
            key={p.id}
            disabled={!target}
            onPress={() => openLink(target, { navigation, title: p.title })}
            accessibilityRole={target ? 'button' : undefined}
          >
            <WhiteCard style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={{ width: '100%', height: 160, borderRadius: 16, marginBottom: 12 }} resizeMode="cover" />
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name={kind.icon} size={16} color={G.cta} />
                <ILText role="eyebrow" color={G.cta} style={{ marginLeft: 6, fontSize: 11 }}>
                  {kind.label}
                </ILText>
              </View>
              <ILText role="label" color={G.ink} style={{ marginTop: 6, fontSize: 16 }}>
                {p.title}
              </ILText>
              {meta ? (
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
                  {meta}
                </ILText>
              ) : null}
              {p.body ? (
                <ILText role="body" color={G.ink} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
                  {p.body}
                </ILText>
              ) : null}
              {p.videoUrl ? (
                <ILText role="label" color={G.cta} style={{ marginTop: 10, fontSize: 13 }}>
                  ▶ Watch in the app
                </ILText>
              ) : p.link ? (
                <ILText role="label" color={G.cta} style={{ marginTop: 10, fontSize: 13 }}>
                  Open link →
                </ILText>
              ) : null}
            </WhiteCard>
          </Pressable>
        );
      })}
    </View>
  );
}
