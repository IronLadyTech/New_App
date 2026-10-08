import React from 'react';
import { View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { CheckRow, WhiteCard } from '../lep/LepBits';
import { useLepNav } from '../lep/useLepNav';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { coursePhase, courseTasks } from '../../constants/programCourseSlice';

export default function ThisPhaseBlock({ programId, phaseId, style }) {
  const nav = useLepNav();
  const demo = useCourseDemo();
  const phase = coursePhase(programId, phaseId);
  const tasks = courseTasks(programId, phaseId);
  if (!phase || !tasks.length) return null;
  const doneCount = tasks.filter((t) => demo.isDone(programId, t.id)).length;

  return (
    <View style={style}>
      <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22 }}>
        This phase
      </ILText>
      <ILText role="bodySm" color={G.meta}>
        {phase.title} · {doneCount} of {tasks.length} done
      </ILText>
      <WhiteCard style={{ marginTop: 12, borderRadius: 22, paddingHorizontal: 16 }}>
        {tasks.map((item, i) => (
          <CheckRow
            key={item.id}
            item={{
              title: item.title,
              meta: item.week ? `${item.kind} · ${item.week}` : item.kind,
              done: demo.isDone(programId, item.id),
            }}
            last={i === tasks.length - 1}
            onPress={() => nav.goCourseTask(programId, item.id)}
          />
        ))}
      </WhiteCard>
    </View>
  );
}
