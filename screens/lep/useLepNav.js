import { Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { navigateInMemberStack, navigateWatch } from '../../utils/watchNav';
import { LMS_HOST } from '../../constants/lmsHost';

export function useLepNav() {
  const navigation = useNavigation();
  const tabNav = () => navigation.getParent?.();
  const goProfileScreen = (screen, params) => {
    const names = navigation.getState()?.routeNames || [];
    if (names.includes(screen)) navigation.navigate(screen, params);
    else navigation.navigate('Profile', { screen, params });
  };
  const goIn = (stack, screen, params) => navigateInMemberStack(navigation, stack, screen, params);
  const goTab = (tabName, screen, params) => {
    const tabs = tabNav();
    if (tabs) {
      tabs.navigate(tabName, screen ? { screen, params } : undefined);
      return;
    }
    if (screen) navigation.navigate(tabName, { screen, params });
    else navigation.navigate(tabName);
  };
  return {
    goProfile: () => navigation.navigate('Profile', { screen: 'ProfileHome' }),
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
        screen: 'LepProgram',
        ...(tab ? { params: { tab } } : {}),
      }),
    goLearn: () => navigation.navigate('Learn'),
    goEngage: () => navigation.navigate('Engage'),
    goEngageMediaList: (kind) => {
      const params = { kind: kind === 'podcast' ? 'podcast' : 'csuite' };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('EngageMediaList')) navigation.navigate('EngageMediaList', params);
      else navigation.navigate('Engage', { screen: 'EngageMediaList', params });
    },
    goPhase: (programId, phaseId) => {
      const params = { programId: programId || 'lep', phaseId: phaseId || 'pre-program' };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CoursePhase')) navigation.navigate('CoursePhase', params);
      else navigation.navigate('MyProgram', { screen: 'CoursePhase', params });
    },
    goCoursePhase: (programId, phaseId) => {
      const params = { programId, phaseId };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CoursePhase')) navigation.navigate('CoursePhase', params);
      else navigation.navigate('MyProgram', { screen: 'CoursePhase', params });
    },
    goCourseTask: (programId, taskId, extraParams) => {
      const params = { programId, taskId, ...(extraParams || {}) };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CourseTask')) navigation.navigate('CourseTask', params);
      else navigation.navigate('MyProgram', { screen: 'CourseTask', params });
    },
    goPractice: (programId, practiceId, extra = {}) =>
      goIn('Home', 'Practice', { programId, practiceId, ...extra }),
    goWatch: (params) => navigateWatch(navigation, params),
    /** Today's practice row → its course task, or the Practice page when it isn't one. */
    goPracticeItem: (item) => {
      if (item.taskId) goIn('MyProgram', 'CourseTask', { programId: item.programId, taskId: item.taskId });
      else if (item.practiceId) {
        goIn('Home', 'Practice', {
          programId: item.programId,
          practiceId: item.practiceId,
          seededDone: !!item.done,
          principleN: item.principleN,
        });
      }
    },
    goManager: (programId) => goIn('MyProgram', 'ManagerChat', { programId }),
    goAssignment: () => navigation.navigate('MyProgram', { screen: 'Assignment' }),
    goQuiz: () => navigation.navigate('MyProgram', { screen: 'Quiz' }),
    goTicket: (event) =>
      navigation.navigate('Engage', {
        screen: 'EventTicket',
        params: event?.id ? { eventId: event.id } : undefined,
      }),
    goEventDetail: (event) =>
      navigation.navigate('Engage', {
        screen: 'EventDetail',
        params: event?.id ? { eventId: event.id } : undefined,
      }),
    goProgress: () => navigation.navigate('Profile', { screen: 'LepProgress' }),
    goWeeklyBrief: () => navigation.navigate('Profile', { screen: 'WeeklyBrief' }),
    goCertificate: () => navigation.navigate('Profile', { screen: 'LepCertificate' }),
    goCertificates: () => goProfileScreen('Certificates'),
    goNudges: () => navigation.navigate('Profile', { screen: 'NudgeSettings' }),
    goFoundationGuides: () => goTab('Learn'),
    goHelp: () => goProfileScreen('HelpSupport'),
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
