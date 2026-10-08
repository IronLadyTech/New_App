import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { useProgramNav } from '../../context/ProgramNavContext';
import { DateBadge, PeopleRow, ProgramPage, SoftCard } from '../program/ProgramKit';
import { CoverThumb } from '../lep/LepBits';
import { ARMY_STORIES, PODCASTS } from '../lep/lepData';
import { CSUITE_HOME } from '../guest/guestData';
import { useLepNav } from '../lep/useLepNav';

const CIRCLES = ['YUKTI', 'DISHA', 'UDAAN', 'Visibility Platform'];
const INDUSTRIES = ['Finance', 'Technology', 'Marketing'];

function RedButton({ label, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        marginTop: 14,
        backgroundColor: IL_BRAND.red,
        borderRadius: 999,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon ? <MaterialIcons name={icon} size={18} color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
      <ILText role="label" color="#FFFFFF">
        {label}
      </ILText>
    </Pressable>
  );
}

function StoryCard({ story, last, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, marginRight: last ? 0 : 10 }}>
      <View style={{ height: 110 }}>
        <CoverThumb source={story.img} height={110} radius={16} play time={story.time} />
      </View>
      <ILText role="label" style={{ marginTop: 8, fontSize: 13 }} numberOfLines={2}>
        {story.title}
      </ILText>
      <ILText role="bodySm" color={IL_BRAND.muted}>
        {story.meta}
      </ILText>
    </Pressable>
  );
}

function ArmyStories({ onWatch }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 12 }}>
      {ARMY_STORIES.map((story, i) => (
        <StoryCard
          key={story.title}
          story={story}
          last={i === ARMY_STORIES.length - 1}
          onPress={() => onWatch?.({ assetKey: story.assetKey, title: story.title, sub: story.meta })}
        />
      ))}
    </View>
  );
}

function CsuiteVideos({ onWatch }) {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 }}>
        <ILText role="title">The C-suite experience</ILText>
        <ILText role="bodySm" color={IL_BRAND.muted}>
          {CSUITE_HOME.length} videos
        </ILText>
      </View>
      <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 4 }}>
        Learn from women at the top table
      </ILText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12, marginHorizontal: -IL_SPACE.page }}
      >
        <View style={{ flexDirection: 'row', paddingHorizontal: IL_SPACE.page }}>
          {CSUITE_HOME.map((c) => (
            <Pressable
              key={c.title}
              onPress={() => onWatch?.({ assetKey: c.assetKey, title: c.title, sub: c.who })}
              style={{ width: 220, marginRight: 12 }}
            >
              <View style={{ height: 124 }}>
                <CoverThumb source={c.img} height={124} radius={16} play />
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    backgroundColor: IL_BRAND.red,
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 9 }}>
                    C-suite
                  </ILText>
                </View>
              </View>
              <ILText role="label" style={{ marginTop: 8, fontSize: 13 }} numberOfLines={2}>
                {c.title}
              </ILText>
              <ILText role="bodySm" color={IL_BRAND.muted}>
                {c.who}
              </ILText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function EnrolledEngage({ navigation, onWatch }) {
  const [added, setAdded] = useState(false);
  const [industry, setIndustry] = useState(null);
  return (
    <>
      <View
        style={{
          marginTop: 8,
          backgroundColor: IL_BRAND.cardDark,
          borderRadius: 22,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
            Iron Lady
          </ILText>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.28)',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <ILText role="bodySm" color="#FFFFFF" style={{ fontSize: 11 }}>
              Member till Sep 2027
            </ILText>
          </View>
        </View>
        <ILText role="displaySm" color="#FFFFFF" style={{ marginTop: 8 }}>
          Your Iron Lady Army
        </ILText>
      </View>

      <SoftCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
            This Thursday
          </ILText>
          <ILText role="bodySm" color={IL_BRAND.muted}>
            Live closed-door triad
          </ILText>
        </View>
        <ILText role="title" style={{ marginTop: 8 }}>
          Community Circle · Thu 8–9 PM
        </ILText>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 6 }}>
          Small group sessions with women working through the same problems.
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {CIRCLES.map((label) => (
            <View
              key={label}
              style={{
                marginRight: 8,
                marginBottom: 8,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: '#F3EFE8',
              }}
            >
              <ILText role="label" style={{ fontSize: 12 }}>
                {label}
              </ILText>
            </View>
          ))}
        </View>
        <RedButton
          icon="event"
          label={added ? 'Added to calendar' : 'Add to calendar'}
          onPress={() => setAdded(true)}
        />
      </SoftCard>

      <SoftCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <ILText role="label">42 women in your LEP batch</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Leadership Track
            </ILText>
          </View>
          <Pressable
            onPress={() => navigation.getParent()?.navigate('MyProgram')}
            accessibilityRole="button"
          >
            <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 13 }}>
              See batchmates
            </ILText>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PeopleRow extra={37} onLight />
          <ILText role="bodySm" color={IL_BRAND.paidGreen}>
            8 active now
          </ILText>
        </View>
      </SoftCard>

      <SoftCard>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="place" size={18} color={IL_BRAND.red} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <ILText role="label">Bengaluru Chapter</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Next meetup: Sat 27 Sep
            </ILText>
          </View>
          <Pressable accessibilityRole="button">
            <ILText role="label" color={IL_BRAND.red}>
              RSVP
            </ILText>
          </Pressable>
        </View>
      </SoftCard>

      <ILText role="title" style={{ marginTop: 22 }}>
        Stories from the Army
      </ILText>
      <ArmyStories onWatch={onWatch} />

      <CsuiteVideos onWatch={onWatch} />

      <SoftCard>
        <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
          IL Guide’s Whisper · Executive Mentor
        </ILText>
        <ILText role="title" style={{ marginTop: 8 }}>
          Want to meet women from your industry?
        </ILText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {INDUSTRIES.map((item) => {
            const on = industry === item;
            return (
              <Pressable
                key={item}
                onPress={() => setIndustry(item)}
                accessibilityRole="button"
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: on ? IL_BRAND.forest : '#F3EFE8',
                }}
              >
                <ILText role="label" color={on ? '#FFFFFF' : IL_BRAND.ink} style={{ fontSize: 13 }}>
                  {item}
                </ILText>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setIndustry(null)}
            accessibilityRole="button"
            style={{
              marginRight: 8,
              marginBottom: 8,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: IL_BRAND.line,
            }}
          >
            <ILText role="label" color={IL_BRAND.muted} style={{ fontSize: 13 }}>
              Not now
            </ILText>
          </Pressable>
        </View>
      </SoftCard>
    </>
  );
}

function Episode({ ep, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ width: 200, marginRight: 12 }}>
      <View style={{ height: 110 }}>
        <CoverThumb source={ep.img} height={110} radius={16} play />
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: IL_BRAND.red,
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <ILText role="eyebrow" color="#FFFFFF" style={{ fontSize: 9 }}>
            Free
          </ILText>
        </View>
      </View>
      <ILText role="label" style={{ marginTop: 8, fontSize: 13 }} numberOfLines={2}>
        {ep.title}
      </ILText>
      <ILText role="bodySm" color={IL_BRAND.muted}>
        {ep.who} · {ep.meta}
      </ILText>
    </Pressable>
  );
}

function RegisteredEngage({ navigation, onWatch }) {
  return (
    <>
      <View style={{ marginTop: 8 }}>
        <ILText role="displaySm">The Iron Lady Army</ILText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={{ backgroundColor: '#FDECEC', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
              Registered
            </ILText>
          </View>
          <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginLeft: 8 }}>
            Open to every member
          </ILText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 }}>
        <ILText role="title">Iron Lady Speaks</ILText>
        <ILText role="label" color={IL_BRAND.red} style={{ fontSize: 13 }}>
          All episodes
        </ILText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {PODCASTS.map((ep) => (
          <Episode
            key={ep.title}
            ep={ep}
            onPress={() => onWatch?.({ assetKey: ep.assetKey, title: ep.title, sub: ep.who })}
          />
        ))}
      </ScrollView>

      <ILText role="title" style={{ marginTop: 22 }}>
        Events
      </ILText>
      <SoftCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
          <DateBadge month="APR" day="26" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label">Winning Ways for Women</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Live webinar · April 26
            </ILText>
          </View>
          <ILText role="label" color={IL_BRAND.red}>
            RSVP
          </ILText>
        </View>
        <View style={{ height: 1, backgroundColor: IL_BRAND.line, marginVertical: 8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
          <DateBadge month="SEP" day="27" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ILText role="label">Bengaluru Chapter meetup</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Sat 27 Sep · 6 PM
            </ILText>
          </View>
          <ILText role="label" color={IL_BRAND.red}>
            RSVP
          </ILText>
        </View>
      </SoftCard>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 }}>
        <ILText role="title">Stories from the Army</ILText>
        <ILText role="eyebrow" color={IL_BRAND.red} style={{ fontSize: 10 }}>
          Free access
        </ILText>
      </View>
      <ArmyStories onWatch={onWatch} />

      <ILText role="eyebrow" color={IL_BRAND.dim} style={{ fontSize: 10, marginTop: 22 }}>
        In-program circles · enrolled members only
      </ILText>
      <SoftCard style={{ opacity: 0.7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
          <MaterialIcons name="lock" size={18} color={IL_BRAND.dim} />
          <View style={{ marginLeft: 10 }}>
            <ILText role="label">Thursday Community Circle</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Closed-door triads
            </ILText>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
          <MaterialIcons name="lock" size={18} color={IL_BRAND.dim} />
          <View style={{ marginLeft: 10 }}>
            <ILText role="label">Your batch group</ILText>
            <ILText role="bodySm" color={IL_BRAND.muted}>
              Private cohort circle
            </ILText>
          </View>
        </View>
        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 8 }}>
          Batches and live breakout circles stay locked.
        </ILText>
        <RedButton
          label="Opens when your enrollment is complete"
          onPress={() =>
            navigation.getParent()?.navigate('Profile', { screen: 'PaymentEnrollment' })
          }
        />
      </SoftCard>
    </>
  );
}

export default function EngageHome({ navigation }) {
  const { stage } = useProgramNav();
  const nav = useLepNav();
  const onWatch = (params) => nav.goWatch(params);
  return (
    <ProgramPage>
      {stage === 'registered' ? (
        <RegisteredEngage navigation={navigation} onWatch={onWatch} />
      ) : (
        <EnrolledEngage navigation={navigation} onWatch={onWatch} />
      )}
    </ProgramPage>
  );
}
