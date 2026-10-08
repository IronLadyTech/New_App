import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { GuestBackBar, Page, WhiteCard } from '../guest/GuestBits';
import { useAuth } from '../../context/AuthContext';
import { useProgramNavMaybe } from '../../context/ProgramNavContext';
import { useLepNav } from '../lep/useLepNav';
import { isLepEnrolled } from '../../utils/lepState';
import { noticesFor } from '../../constants/notices';

// Survives leaving and reopening the screen within a session.
const readIds = new Set();

function useNoticeRunner(audience) {
  const navigation = useNavigation();
  const nav = useLepNav();
  const guestTab = (screen, params) => navigation.navigate('GuestTabs', { screen, params });
  return (go) => {
    if (!go) return;
    if (audience === 'signup' || go.to === 'back') {
      navigation.goBack();
      return;
    }
    if (audience === 'guest') {
      if (go.to === 'challenge') guestTab('Home', { screen: 'ChallengeHub' });
      else if (go.to === 'programs') guestTab('Programs');
      else if (go.to === 'engage') guestTab('Engage');
      return;
    }
    switch (go.to) {
      case 'task':
        nav.goCourseTask(go.programId, go.taskId);
        break;
      case 'payment':
        nav.goEnroll();
        break;
      case 'schedule':
        nav.goSchedule();
        break;
      case 'guide':
        nav.goGuide();
        break;
      case 'ticket':
        nav.goTicket();
        break;
      case 'today':
        nav.goToday();
        break;
      case 'learn':
        nav.goLearn();
        break;
      case 'engage':
        nav.goEngage();
        break;
      case 'myProgram':
        nav.goMyProgram();
        break;
      default:
        break;
    }
  };
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { profile, isAuthenticated, isGuest } = useAuth();
  const programNav = useProgramNavMaybe();
  const audience = isGuest ? 'guest' : !isAuthenticated || !programNav ? 'signup' : 'member';
  const items = noticesFor({
    audience,
    program: programNav?.program,
    stage: programNav?.stage,
    lepEnrolled: audience === 'member' && isLepEnrolled(profile),
  });
  const run = useNoticeRunner(audience);
  const [, bump] = useState(0);
  const isRead = (n) => readIds.has(n.id);
  const unread = items.filter((n) => !isRead(n)).length;

  const markAll = () => {
    items.forEach((n) => readIds.add(n.id));
    bump((x) => x + 1);
  };
  const open = (n) => {
    readIds.add(n.id);
    bump((x) => x + 1);
    run(n.go);
  };

  const attention = items.filter((n) => n.kind === 'attention');
  const guide = items.filter((n) => n.kind === 'guide');

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title="Notifications"
          sub={unread ? `${unread} unread` : 'All caught up'}
          onBack={() => navigation.goBack()}
          right={
            unread ? (
              <Pressable onPress={markAll} accessibilityRole="button" hitSlop={8}>
                <ILText role="label" color={G.pink} style={[af, { fontSize: 12 }]}>
                  Mark all read
                </ILText>
              </Pressable>
            ) : null
          }
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8) }}
      >
        {attention.length ? (
          <>
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginTop: 8 }]}>
              Needs attention
            </ILText>
            <WhiteCard style={{ marginTop: 10, borderRadius: 22, overflow: 'hidden' }}>
              {attention.map((n, i) => (
                <NoticeRow key={n.id} item={n} read={isRead(n)} last={i === attention.length - 1} onPress={() => open(n)} />
              ))}
            </WhiteCard>
          </>
        ) : null}
        {guide.length ? (
          <>
            <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, marginTop: 22 }]}>
              {audience === 'member' ? 'From IL Guide' : 'From Iron Lady'}
            </ILText>
            <WhiteCard style={{ marginTop: 10, borderRadius: 22, overflow: 'hidden' }}>
              {guide.map((n, i) => (
                <NoticeRow key={n.id} item={n} read={isRead(n)} last={i === guide.length - 1} onPress={() => open(n)} />
              ))}
            </WhiteCard>
          </>
        ) : null}
      </ScrollView>
    </Page>
  );
}

function NoticeRow({ item, read, last, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: G.line,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: read ? G.mutedFill : G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={item.icon} size={18} color={read ? G.meta : G.cta} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ILText role="label" color={read ? G.meta : G.ink} style={{ flex: 1 }}>
            {item.title}
          </ILText>
          <ILText role="bodySm" color={G.meta} style={{ fontSize: 11, marginLeft: 8 }}>
            {item.ago}
          </ILText>
          {!read ? (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: G.cta, marginLeft: 6 }} />
          ) : null}
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12 }}>
          {item.meta}
        </ILText>
        {item.action ? (
          <ILText role="label" color={G.cta} style={[af, { marginTop: 8, fontSize: 12 }]}>
            {item.action} →
          </ILText>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={G.meta} style={{ alignSelf: 'center', marginLeft: 6 }} />
    </Pressable>
  );
}
