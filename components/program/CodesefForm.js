import React from 'react';
import { TextInput, View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { CODESEF_ROW_COUNT } from '../../constants/formTemplates';
import { WhiteCard } from '../../screens/lep/LepBits';
import { Field, SectionTitle, YesNoPick } from './FormBits';

export default function CodesefForm({ form, setForm }) {
  const rows = form.designTasks || [];

  const setRow = (index, patch) => {
    setForm((prev) => {
      const designTasks = [...(prev.designTasks || [])];
      while (designTasks.length < CODESEF_ROW_COUNT) {
        designTasks.push({ task: '', topTwenty: '' });
      }
      designTasks[index] = { ...designTasks[index], ...patch };
      return { ...prev, designTasks };
    });
  };

  return (
    <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 14 }}>
      <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
        YOUR CODESeF SHEET
      </ILText>
      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
        Fill every section below — the same worksheet as pages 2 and 3 of the handout.
      </ILText>

      <SectionTitle first>1. Context</SectionTitle>
      <Field
        label="My Goal"
        value={form.goal || ''}
        onChangeText={(v) => setForm((prev) => ({ ...prev, goal: v }))}
        placeholder="Your Big Hairy Audacious Goal"
      />
      <Field
        label="Capability that I want to develop"
        value={form.capability || ''}
        onChangeText={(v) => setForm((prev) => ({ ...prev, capability: v }))}
        placeholder="What you need to reach the goal and sustain it"
      />

      <SectionTitle>2. Design</SectionTitle>
      <ILText role="bodySm" color={G.meta} style={{ fontSize: 13, lineHeight: 18 }}>
        List each task toward your goal. Then say whether it is in the top 20% — the few tasks that
        create most of the impact.
      </ILText>
      {rows.slice(0, CODESEF_ROW_COUNT).map((row, i) => (
        <View
          key={i}
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            backgroundColor: G.mutedFill,
          }}
        >
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            Task {i + 1}
          </ILText>
          <TextInput
            value={row.task || ''}
            onChangeText={(v) => setRow(i, { task: v })}
            placeholder="Write the task"
            placeholderTextColor="#B8B4A8"
            multiline
            style={{
              marginTop: 6,
              minHeight: 44,
              fontFamily: IL_FONTS.regular,
              fontSize: 15,
              color: G.ink,
            }}
          />
          <YesNoPick
            label="Is this in your top 20% by impact?"
            value={row.topTwenty || ''}
            onChange={(v) => setRow(i, { topTwenty: v })}
          />
        </View>
      ))}

      <SectionTitle>3. Sequence & Stakes</SectionTitle>
      <Field
        label="List of things to get ready BEFORE starting for Faizen"
        value={form.readiness || ''}
        onChangeText={(v) => setForm((prev) => ({ ...prev, readiness: v }))}
        minHeight={80}
      />

      <SectionTitle>4. FAIZEN</SectionTitle>
      <Field
        label="Level 1 Faizen: First Faizen Steps"
        value={form.faizen1 || ''}
        onChangeText={(v) => setForm((prev) => ({ ...prev, faizen1: v }))}
        minHeight={72}
      />
      <Field
        label="Level 2 Faizen: Next Faizen Steps"
        value={form.faizen2 || ''}
        onChangeText={(v) => setForm((prev) => ({ ...prev, faizen2: v }))}
        minHeight={72}
      />
    </WhiteCard>
  );
}
