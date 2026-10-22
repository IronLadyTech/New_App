import { useEffect, useRef } from 'react';
import { useEventListener } from 'expo';
import { recordVideoProgress } from '../services/activityTracking';

const MILESTONES = [25, 50, 75, 90];

/**
 * Records how far a learner got in an expo-video player: started (0), 25/50/75/90%
 * and finished. Writes only when a new milestone is reached, never per tick.
 */
export function useVideoProgressTracking(player, videoKey) {
  const reached = useRef(new Set());

  useEffect(() => {
    reached.current = new Set();
  }, [videoKey]);

  useEffect(() => {
    // timeUpdate never fires while this is 0 (the default).
    if (player) player.timeUpdateEventInterval = 5;
  }, [player]);

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    const duration = player?.duration;
    if (!videoKey || !duration || duration < 1) return;
    const pct = (currentTime / duration) * 100;
    const hit = [0, ...MILESTONES].filter(
      (m) => !reached.current.has(m) && (m === 0 ? currentTime >= 2 : pct >= m)
    );
    if (!hit.length) return;
    hit.forEach((m) => reached.current.add(m));
    recordVideoProgress(videoKey, { milestones: hit, durationSec: Math.round(duration) });
  });

  useEventListener(player, 'playToEnd', () => {
    if (!videoKey) return;
    const rest = [0, ...MILESTONES].filter((m) => !reached.current.has(m));
    rest.forEach((m) => reached.current.add(m));
    recordVideoProgress(videoKey, {
      milestones: rest,
      completed: true,
      durationSec: player?.duration ? Math.round(player.duration) : null,
    });
  });
}
