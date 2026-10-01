import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

function navigateInStack(navigation, name, params) {
  const names = navigation.getState?.()?.routeNames;
  if (Array.isArray(names) && names.includes(name)) {
    navigation.navigate(name, params);
    return;
  }
  const parent = navigation.getParent?.();
  if (parent) {
    navigateInStack(parent, name, params);
    return;
  }
  navigation.navigate(name, params);
}

export function useGuestActions() {
  const navigation = useNavigation();
  const { enterAuthFromGuest, enterLepPreview, enterJourneyPreview } = useAuth();
  return {
    findRegistration: enterAuthFromGuest,
    previewRegisteredHome: () => enterLepPreview('registered'),
    previewEnrolledHome: () => enterLepPreview('enrolled'),
    previewJourney: enterJourneyPreview,
    goPrograms: () => navigation.navigate('Programs'),
    goEngage: () => navigation.navigate('Engage'),
    goHome: () => navigation.navigate('Home'),
    goProgram: (id) => navigateInStack(navigation, 'ProgramDetail', { id }),
    goChallenge: () => {
      const names = navigation.getState?.()?.routeNames;
      if (Array.isArray(names) && names.includes('ChallengeHub')) {
        navigation.navigate('ChallengeHub');
        return;
      }
      navigation.navigate('Home', { screen: 'ChallengeHub' });
    },
  };
}
