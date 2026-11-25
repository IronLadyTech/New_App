import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { WhiteCard } from '../../screens/lep/LepBits';
import { formatChallengeDay } from '../../utils/lepChallenges';
import { ChallengeDots, ChallengeItem, challengeDayLabel } from './LepChallengeItems';

const RED = '#E52A2A';

/** The daily items for today (and the once-a-week item, until it is done). */
export function ChallengeToday({ state, log, saveDay, saveOnce, onOpenTask }) {
  const { challenge } = state;
  const entry = log?.days?.[challenge.key]?.[state.today] || {};
  const onceValue = challenge.once ? log?.once?.[challenge.key]?.[challenge.once.id] : null;
  return (
    <>
      <ChallengeDots challenge={challenge} state={state} log={log} />
      {challenge.daily.map((item) => (
        <ChallengeItem
          key={`${state.today}-${item.id}`}
          item={item}
          value={entry[item.id]}
          onSave={(v) => saveDay(challenge.key, state.today, { [item.id]: v })}
          onOpen={item.openTaskId ? () => onOpenTask(item.openTaskId) : null}
        />
      ))}
      {challenge.once ? (
        <ChallengeItem
          key={`once-${challenge.once.id}`}
          item={{ ...challenge.once, label: `${challenge.once.label} (once this week)` }}
          value={onceValue}
          onSave={(v) => saveOnce(challenge.key, challenge.once.id, v)}
        />
      ) : null}
    </>
  );
}

/**
 * Home: one weekly challenge. It appears only after its session ends ("starts tomorrow"),
 * runs Day 1–7, then asks for the end-of-week summary until she submits it.
 */
export default function LepChallengeCard({ state, log, saveDay, saveOnce, onOpenTask, summaryDone, hideDaily }) {
  const { challenge } = state;
  const showSummary = state.summaryOpen && !summaryDone;
  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="star" size={18} color={RED} />
        <ILText role="label" color={RED} style={{ marginLeft: 6, fontSize: 12, flex: 1 }}>
          {`Week ${challenge.n} Challenge`}
        </ILText>
        <ILText role="label" color={G.meta} style={{ fontSize: 12 }}>
          {challengeDayLabel(state)}
        </ILText>
      </View>
      <ILText role="title" color={G.ink} style={{ marginTop: 6, fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}>
        {challenge.short}
      </ILText>

      {state.phase === 'soon' ? (
        <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          {`After today's ${state.sessionTitle} session, your 7-day challenge starts tomorrow (${formatChallengeDay(state.startIso)}). Open the task to read what you will do each day.`}
        </ILText>
      ) : null}

      {state.phase === 'daily' && !hideDaily ? (
        <ChallengeToday state={state} log={log} saveDay={saveDay} saveOnce={saveOnce} onOpenTask={onOpenTask} />
      ) : null}

      {showSummary && (state.phase === 'after' || hideDaily) ? (
        <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          {state.phase === 'after'
            ? 'Your 7 days are done. Tell us how the week went: a few taps and one line.'
            : 'Last day today. Once it is done, tell us how the week went: a few taps and one line.'}
        </ILText>
      ) : null}

      {state.phase === 'soon' || showSummary ? (
        <Pressable
          onPress={() => onOpenTask(challenge.taskId)}
          accessibilityRole="button"
          style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}
        >
          <ILText role="label" color={RED} style={{ fontSize: 14 }}>
            {showSummary ? 'Write your week summary' : 'See the challenge'}
          </ILText>
          <MaterialIcons name="chevron-right" size={18} color={RED} />
        </Pressable>
      ) : null}
    </WhiteCard>
  );
}
