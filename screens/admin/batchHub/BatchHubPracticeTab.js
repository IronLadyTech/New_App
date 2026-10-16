import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  buildEnrolledDailyPractice,
  buildRegisteredDailyPractice,
  todayIsoIST,
} from '../../../utils/lepDailyPractice';
import { describeBatchAnchor } from '../../../utils/lepBatchSchedule';
import { A, Card, Notice, T } from '../adminUi';

export default function BatchHubPracticeTab({ batch }) {
  const today = todayIsoIST();
  const anchor = batch?.orientationDate || null;
  const enrolled = useMemo(() => buildEnrolledDailyPractice(today, anchor), [today, anchor]);
  const registered = useMemo(() => buildRegisteredDailyPractice(today, anchor), [today, anchor]);

  if (!batch?.day1Date) {
    return <Notice tone="neutral">Set batch dates under Setup to preview practice and due items.</Notice>;
  }

  return (
    <View>
      <Notice tone="neutral">
        Learner home: <T weight="semibold">5 Rituals</T> from Monday after Week 0 Day 2 (LEP_Flow); then every IST day;
        principle
        1–27 advances by day from orientation; two other enrolled slots rotate from the pool. Task links open the
        journey task when tapped.
      </Notice>
      <T size={12} color={A.muted} style={{ marginBottom: 12 }}>
        Preview for {today} · {describeBatchAnchor(batch)}
      </T>

      <T weight="bold" size={14} style={{ marginBottom: 8 }}>Today’s practice (enrolled)</T>
      {enrolled.map((row) => (
        <Card key={row.id} style={{ marginBottom: 6, padding: 10 }}>
          <T size={13} weight="semibold">{row.title}</T>
          <T size={11} color={A.muted}>
            {row.meta}
            {row.taskId ? ` · ${row.taskId}` : ''}
            {row.dailyReset ? ' · resets daily' : ''}
          </T>
        </Card>
      ))}

      <T weight="bold" size={14} style={{ marginTop: 16, marginBottom: 8 }}>Today’s practice (registered / part-paid)</T>
      {registered.map((row) => (
        <Card key={row.id} style={{ marginBottom: 6, padding: 10 }}>
          <T size={13}>{row.title}</T>
          <T size={11} color={A.muted}>{row.meta}</T>
        </Card>
      ))}
    </View>
  );
}
