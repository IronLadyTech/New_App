import { Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { navigateInMemberStack, navigateWatch } from '../../utils/watchNav';
import { findTabNavigator, openInTab } from '../../utils/tabReturn';
import { LMS_HOST } from '../../constants/lmsHost';

export function useLepNav() {
  const navigation = useNavigation();
  const tabNav = () => navigation.getParent?.();
  const goProfileScreen = (screen, params) => {
    const names = navigation.getState()?.routeNames || [];
    if (names.includes(screen)) navigation.navigate(screen, params);
    else openInTab(navigation, 'Profile', screen, params);
  };
  const goIn = (stack, screen, params) => navigateInMemberStack(navigation, stack, screen, params);
  const goTab = (tabName, screen, params) => {
    if (screen) {
      openInTab(navigation, tabName, screen, params);
      return;
    }
    const tabs = tabNav();
    if (tabs) tabs.navigate(tabName);
    else navigation.navigate(tabName);
  };
  return {
    // Profile at the top (it used to open wherever it was last scrolled to).
    goProfile: () => navigation.navigate('Profile', { pop: true, screen: 'ProfileHome', params: { scrollTop: Date.now() } }),
    /**
     * "Complete your profile" task: Profile, remembering the tab she came from. Once her profile
     * is complete there, Profile takes her straight back (LepProfileScreen).
     */
    goCompleteProfile: () => {
      const tabs = findTabNavigator(navigation);
      const s = tabs?.getState?.();
      const returnTo = s?.routes?.[s.index]?.name;
      navigation.navigate('Profile', {
        pop: true,
        screen: 'ProfileHome',
        params: { scrollTop: Date.now(), returnTo: returnTo && returnTo !== 'Profile' ? returnTo : null },
      });
    },
    /** Her B-HAG has one home: the Profile B-HAG card (saved to her profile and Zoho). */
    goBhag: () => navigation.navigate('Profile', { pop: true, screen: 'ProfileHome', params: { openBhag: Date.now() } }),
    goNotifications: () => goProfileScreen('Notifications'),
    goSchedule: () => goIn('Home', 'Schedule'),
    goToday: () => goIn('Home', 'TodayChecklist'),
    goRitualsDashboard: () => goIn('Home', 'RitualsDashboard'),
    goGuide: () => goIn('Home', 'GuideChat'),
    goCheckin: () => goIn('Home', 'SessionCheckin'),
    goRoad: () => goIn('Home', 'FirstMonth'),
    goMilestone: () => goIn('Home', 'Milestone'),
    goGraduation: () => goIn('Home', 'Graduation'),
    goAlumni: () => goIn('Home', 'Alumni'),
    goAlumniGraduationFilm: () => goIn('Home', 'AlumniGraduationFilm'),
    goAlumniCommunity: () => goIn('Home', 'AlumniCommunity'),
    goEnroll: () => goProfileScreen('PaymentEnrollment', { programId: 'lep' }),
    goOrders: () => goProfileScreen('Orders'),
    goReceipt: (order) => goProfileScreen('OrderReceipt', { orderId: order?.id, order }),
    goMyProgram: (tab) =>
      navigation.navigate('MyProgram', {
        pop: true,
        screen: 'LepProgram',
        ...(tab ? { params: { tab } } : {}),
      }),
    goLearn: () => navigation.navigate('Learn'),
    goEngage: () => navigation.navigate('Engage'),
    goEngageMediaList: (kind) => {
      const params = { kind: kind === 'podcast' ? 'podcast' : 'csuite' };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('EngageMediaList')) navigation.navigate('EngageMediaList', params);
      else openInTab(navigation, 'Engage', 'EngageMediaList', params);
    },
    goPhase: (programId, phaseId) => {
      const params = { programId: programId || 'lep', phaseId: phaseId || 'pre-program' };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CoursePhase')) navigation.navigate('CoursePhase', params);
      else openInTab(navigation, 'MyProgram', 'CoursePhase', params);
    },
    goCoursePhase: (programId, phaseId) => {
      const params = { programId, phaseId };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CoursePhase')) navigation.navigate('CoursePhase', params);
      else openInTab(navigation, 'MyProgram', 'CoursePhase', params);
    },
    goCourseTask: (programId, taskId, extraParams) => {
      // The certificate opens through Graduation, which first checks every required step is done.
      if (taskId === 'lep-certification' && !extraParams?.fromGraduation) {
        goIn('Home', 'Graduation');
        return;
      }
      const params = { programId, taskId, ...(extraParams || {}) };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CourseTask')) navigation.navigate('CourseTask', params);
      else openInTab(navigation, 'MyProgram', 'CourseTask', params);
    },
    goPractice: (programId, practiceId, extra = {}) =>
      practiceId === 'lep-bhag'
        ? navigation.navigate('Profile', { pop: true, screen: 'ProfileHome', params: { openBhag: Date.now() } })
        : goIn('Home', 'Practice', { programId, practiceId, ...extra }),
    goWatch: (params) => navigateWatch(navigation, params),
    /** Today's practice row → its course task, or the Practice page when it isn't one. */
    goPracticeItem: (item) => {
      if (item.taskId) goIn('MyProgram', 'CourseTask', { programId: item.programId, taskId: item.taskId });
      else if (item.practiceId === 'lep-bhag') {
        navigation.navigate('Profile', { pop: true, screen: 'ProfileHome', params: { openBhag: Date.now() } });
      } else if (item.practiceId) {
        goIn('Home', 'Practice', {
          programId: item.programId,
          practiceId: item.practiceId,
          seededDone: !!item.done,
          principleN: item.principleN,
        });
      }
    },
    goManager: (programId) => goIn('MyProgram', 'ManagerChat', { programId }),
    goAssignment: () => openInTab(navigation, 'MyProgram', 'Assignment'),
    goQuiz: () => openInTab(navigation, 'MyProgram', 'Quiz'),
    goTicket: (event) =>
      openInTab(navigation, 'Engage', 'EventTicket', event?.id ? { eventId: event.id } : undefined),
    goEventDetail: (event) =>
      openInTab(navigation, 'Engage', 'EventDetail', event?.id ? { eventId: event.id } : undefined),
    goProgress: () => openInTab(navigation, 'Profile', 'LepProgress'),
    goWeeklyBrief: () => openInTab(navigation, 'Profile', 'WeeklyBrief'),
    goCertificate: () => openInTab(navigation, 'Profile', 'LepCertificate'),
    goCertificates: () => goProfileScreen('Certificates'),
    goNudges: () => openInTab(navigation, 'Profile', 'NudgeSettings'),
    goFoundationGuides: () => goTab('Learn'),
    goHelp: () => goProfileScreen('HelpSupport'),
    // Raise / see support tickets; params prefill a new one ({ subject, category }).
    goTickets: (params) => goProfileScreen('SupportTickets', params),
    goPrivacyCenter: () => goProfileScreen('PrivacyCenter'),
    goPrivacy: () => goProfileScreen('LegalWeb', { url: `${LMS_HOST}/privacy`, title: 'Privacy' }),
    goTerms: () => goProfileScreen('LegalWeb', { url: `${LMS_HOST}/terms`, title: 'Terms' }),
    goRateApp: () => {
      const pkg = Constants.expoConfig?.android?.package || 'com.ironlady.app';
      const url =
        Platform.OS === 'android'
          ? `market://details?id=${pkg}`
          : 'https://apps.apple.com/search?term=Iron%20Lady';
      Linking.openURL(url).catch(() =>
        Linking.openURL(`https://play.google.com/store/apps/details?id=${pkg}`).catch(() => {})
      );
    },
  };
}
