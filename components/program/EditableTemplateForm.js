import React from 'react';
import { TextInput, View } from 'react-native';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import { G, af } from '../../constants/guestTheme';
import { TEMPLATE_IDS } from '../../constants/formTemplates';
import { getFormDefinition } from '../../constants/lepFormTemplates';
import { WhiteCard } from '../../screens/lep/LepBits';
import AgameBeliefsForm from './AgameBeliefsForm';
import CodesefForm from './CodesefForm';
import ErrcForm from './ErrcForm';
import GenericLepForm from './GenericLepForm';

const GENERIC_FIELDS = ['What you will keep', 'What you will change', 'Your next step'];

export function isGenericTemplateComplete(form) {
  return GENERIC_FIELDS.every((f) => (form[f] || '').trim());
}

export default function EditableTemplateForm({ templateId, form, setForm }) {
  if (templateId === TEMPLATE_IDS.CODESEF) {
    return <CodesefForm form={form} setForm={setForm} />;
  }
  if (templateId === TEMPLATE_IDS.AGAME_BELIEFS) {
    return <AgameBeliefsForm form={form} setForm={setForm} />;
  }
  if (templateId === TEMPLATE_IDS.ERRC) {
    return <ErrcForm form={form} setForm={setForm} />;
  }

  const def = getFormDefinition(templateId);
  if (def?.fields) {
    return <GenericLepForm definition={def} form={form} setForm={setForm} />;
  }

  return (
    <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 14 }}>
      {GENERIC_FIELDS.map((label, i) => (
        <View key={label} style={{ marginTop: i ? 14 : 0 }}>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            {label}
          </ILText>
          <TextInput
            value={form[label] || ''}
            onChangeText={(v) => setForm((prev) => ({ ...prev, [label]: v }))}
            placeholder="Write here"
            placeholderTextColor="#B8B4A8"
            multiline
            style={{
              marginTop: 6,
              minHeight: 56,
              fontFamily: IL_FONTS.regular,
              fontSize: 15,
              color: G.ink,
            }}
          />
        </View>
      ))}
    </WhiteCard>
  );
}
