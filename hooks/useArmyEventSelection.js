import { useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { learnerCityText } from '../utils/programAccess';
import {
  nextRegionalChapterEvent,
  resolveArmyEventById,
} from '../utils/armyEventCalendar';
import { useArmyEventCalendar } from './useArmyEventCalendar';

/**
 * Event for detail / ticket screens — route param wins, else next chapter near the learner.
 */
export function useArmyEventSelection(explicitEventId) {
  const route = useRoute();
  const { profile } = useAuth();
  const city = learnerCityText(profile);
  const { events, upcoming, nextOffline, loading } = useArmyEventCalendar();
  const eventId = explicitEventId || route.params?.eventId;

  const fromRoute = useMemo(
    () => resolveArmyEventById(events, eventId),
    [events, eventId]
  );

  const fallback = useMemo(
    () => nextRegionalChapterEvent(upcoming, { city }) || nextOffline || null,
    [upcoming, nextOffline, city]
  );

  return {
    event: fromRoute || fallback,
    city,
    loading,
  };
}
