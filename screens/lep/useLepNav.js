import { useNavigation } from '@react-navigation/native';
import { navigateInMemberStack, navigateWatch } from '../../utils/watchNav';

export function useLepNav() {
  const navigation = useNavigation();
  const goProfileScreen = (screen, params) => {
    const names = navigation.getState()?.routeNames || [];
    if (names.includes(screen)) navigation.navigate(screen, params);
    else navigation.navigate('Profile', { screen, params });
  };
  const goIn = (stack, screen, params) => navigateInMemberStack(navigation, stack, screen, params);
  return {
    goProfile: () => navigation.navigate('Profile'),
    goNotifications: () => navigation.navigate('Home', { screen: 'Notifications' }),
    goSchedule: () => navigation.navigate('Home', { screen: 'Schedule' }),
    goToday: () => navigation.navigate('Home', { screen: 'TodayChecklist' }),
    goGuide: () => navigation.navigate('Home', { screen: 'GuideChat' }),
    goCheckin: () => navigation.navigate('Home', { screen: 'SessionCheckin' }),
    goRoad: () => navigation.navigate('Home', { screen: 'FirstMonth' }),
    goMilestone: () => navigation.navigate('Home', { screen: 'Milestone' }),
    goGraduation: () => navigation.navigate('Home', { screen: 'Graduation' }),
    goAlumni: () => navigation.navigate('Home', { screen: 'Alumni' }),
    goEnroll: () => goProfileScreen('PaymentEnrollment'),
    goOrders: () => goProfileScreen('Orders'),
    goReceipt: (order) => goProfileScreen('OrderReceipt', { orderId: order?.id, order }),
    goMyProgram: () => navigation.navigate('MyProgram'),
    goLearn: () => navigation.navigate('Learn'),
    goEngage: () => navigation.navigate('Engage'),
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
    goCourseTask: (programId, taskId) => {
      const params = { programId, taskId };
      const names = navigation.getState()?.routeNames || [];
      if (names.includes('CourseTask')) navigation.navigate('CourseTask', params);
      else navigation.navigate('MyProgram', { screen: 'CourseTask', params });
    },
    goPractice: (programId, practiceId) => goIn('Home', 'Practice', { programId, practiceId }),
    goWatch: (params) => navigateWatch(navigation, params),
    /** Today's practice row → its course task, or the Practice page when it isn't one. */
    goPracticeItem: (item) => {
      if (item.taskId) goIn('MyProgram', 'CourseTask', { programId: item.programId, taskId: item.taskId });
      else if (item.practiceId) {
        goIn('Home', 'Practice', { programId: item.programId, practiceId: item.practiceId, seededDone: !!item.done });
      }
    },
    goManager: (programId) => goIn('MyProgram', 'ManagerChat', { programId }),
    goAssignment: () => navigation.navigate('MyProgram', { screen: 'Assignment' }),
    goQuiz: () => navigation.navigate('MyProgram', { screen: 'Quiz' }),
    goTicket: () => navigation.navigate('Engage', { screen: 'EventTicket' }),
    goProgress: () => navigation.navigate('Profile', { screen: 'LepProgress' }),
    goCertificate: () => navigation.navigate('Profile', { screen: 'LepCertificate' }),
    goNudges: () => navigation.navigate('Profile', { screen: 'NudgeSettings' }),
  };
}
