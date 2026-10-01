import { useNavigation } from '@react-navigation/native';

export function useLepNav() {
  const navigation = useNavigation();
  const goProfileScreen = (screen, params) => {
    const names = navigation.getState()?.routeNames || [];
    if (names.includes(screen)) navigation.navigate(screen, params);
    else navigation.navigate('Profile', { screen, params });
  };
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
    goPhase: () => navigation.navigate('MyProgram', { screen: 'PhaseDetail' }),
    goAssignment: () => navigation.navigate('MyProgram', { screen: 'Assignment' }),
    goQuiz: () => navigation.navigate('MyProgram', { screen: 'Quiz' }),
    goTicket: () => navigation.navigate('Engage', { screen: 'EventTicket' }),
    goProgress: () => navigation.navigate('Profile', { screen: 'LepProgress' }),
    goCertificate: () => navigation.navigate('Profile', { screen: 'LepCertificate' }),
    goNudges: () => navigation.navigate('Profile', { screen: 'NudgeSettings' }),
  };
}
