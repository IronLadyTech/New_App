import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import Pressable from '../il/Press';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard } from '../../screens/lep/LepBits';
import { SalaryPicker } from '../profile/ProfilePickers';

const TEAM_PROMISES = [
  'You will develop a new sense of internal confidence, understand your own strengths and start enhancing those continuously.',
  'You will start developing an ability to lead with sense of purpose.',
  'You will be able to visualise your long-term goals and be able to start working towards them.',
  'You will be exposed to breakthrough, distinct, global leadership and management principles and methodologies from the practitioners and be supported in practicing the same.',
  'The experiential methodology used in the program will enable you to honestly examine your existing limitations — be it about your goals, beliefs, assumptions or capabilities.',
  'The recognition of your limitations will allow you to step beyond them and act on opportunities which you may have never considered before.',
  'We promise that you will be treated with respect and dignity throughout the program. We will strive to always look at the greatness in you. However, you may experience sometimes that you are being “pushed”. This is intentional, to support you in breaching your own limits and going beyond them.',
  'We promise that we maintain the confidentiality of all the information about you and the information shared by you and will not use the information anywhere outside the program.',
  'Certificate of completion will be provided at the end of the program provided you participate in all the sessions completely.',
  'To get a lot of value out of program, you may go through some unsettling moments during the program, especially as you explore your beliefs in an open environment with your co-participants. You may also find yourself stretched — intellectually, physically and emotionally. You will be challenged frequently to go beyond your current thinking.',
  'This kind of “push” is intentional as the program is designed to support you in shifting your values, beliefs, feelings and thinking consciously with the sole intent of generating new possibilities for your life.',
];

const PARTICIPANT_PROMISES = [
  'I confirm my participation in this journey and promise to voluntarily bring my “whole self” — my dreams, emotions, challenges and aspirations to the program.',
  'I affirm that I will be “coachable”, provided that my well-being and dignity are not at stake. I will not let my ego come in the way of my learning, and when prompted by the Iron Lady Program Leaders, will permit them to coach me, lead me to look within, and find my answers.',
  'I understand that I will not get the complete value promised by Iron Lady program, in case I drop out of program in between or do not follow the instructions provided during the program fully.',
  'If I do not complete the program, or I do not adhere to the above-mentioned promises, I concur that I have no right to expect a refund either in full or in part. The fees I pay, and the time and my involvement are what I am putting at stake here.',
  'I also understand that the organisers of this program are not accountable for my well-being. I alone am accountable for my well-being.',
  'I affirm that I am of sound mind, that I am not under any therapy, that I know that this program is not a substitute for therapy.',
  'I promise that I will not take any stimulant in the form of any drug or alcohol during the days of the workshop. I promise to be present, physically, emotionally and on time each day of the program workshops. I promise to complete all the assignments, recognising that these are key to the design of the program.',
  'I promise that I maintain the confidentiality of all the information about the co-participants and do not use any such information anywhere outside, including my conversation with the co-participants.',
  'I promise that I maintain the confidentiality of the methodology and materials of Iron Lady Program.',
  'In case I choose to endorse the program through articles or videos or by any other means, it will be my own choice. In case I choose share these videos / articles with the Iron Lady team, I give Iron Lady team the permission to use it publicly.',
  'I will not try to coach other people using the methodologies learnt in the program.',
];

function LabeledInput({ label, value, onChangeText, keyboardType, editable = true, optional }) {
  return (
    <View style={{ marginTop: 14 }}>
      <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 14 }}>
        {label}
        {optional ? (
          <ILText role="bodySm" color={G.meta} style={{ fontFamily: IL_FONTS.regular, fontSize: 13 }}>
            {' '}
            (optional)
          </ILText>
        ) : null}
      </ILText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' || keyboardType === 'phone-pad' || keyboardType === 'url' ? 'none' : 'words'}
        placeholderTextColor="#B8B4A8"
        style={{
          marginTop: 6,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: G.line,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontFamily: IL_FONTS.regular,
          fontSize: 15,
          color: G.ink,
          backgroundColor: G.white,
        }}
      />
    </View>
  );
}

function applySignatureAsset(set, asset) {
  if (!asset?.uri) return;
  set('signatureUri', asset.uri);
  set('signatureFileName', asset.fileName || asset.name || 'signature.jpg');
}

export default function PromisesAgreementForm({ form, setForm }) {
  const set = useCallback((key, value) => setForm((prev) => ({ ...prev, [key]: value })), [setForm]);
  const [salaryOpen, setSalaryOpen] = useState(false);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos', 'Allow photo access in your phone settings, or use “Choose file” below.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.92,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    applySignatureAsset(set, result.assets[0]);
  };

  const pickFromDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    applySignatureAsset(set, result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera', 'Allow camera access to photograph your signature.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.92,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    applySignatureAsset(set, result.assets[0]);
  };

  return (
    <View style={{ marginTop: 18 }}>
      <WhiteCard style={{ borderRadius: 18, padding: 14, backgroundColor: G.pink }}>
        <ILText role="body" color={G.ink} style={{ fontSize: 15, lineHeight: 22 }}>
          Welcome on-board! We are about to start the journey together in the program. Just before we begin,
          listed here are promises by the Iron Lady team to you and your agreement with us.
        </ILText>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 18, padding: 0, overflow: 'hidden' }}>
        <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ padding: 14 }}>
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            Iron Lady team promise
          </ILText>
          <ILText role="bodySm" color={G.body} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
            We, the Iron Lady team, promise to enable you to be clearer about your life, who you really are
            and what you really want to be. Through the program, we promise that:
          </ILText>
          {TEAM_PROMISES.map((line, i) => (
            <ILText key={i} role="bodySm" color={G.ink} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              • {line}
            </ILText>
          ))}

          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginTop: 16 }]}>
            Participant promise
          </ILText>
          <ILText role="bodySm" color={G.body} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
            I, as the Iron Lady Leadership program participant, promise as mentioned below:
          </ILText>
          {PARTICIPANT_PROMISES.map((line, i) => (
            <ILText key={i} role="bodySm" color={G.ink} style={{ marginTop: 8, fontSize: 13, lineHeight: 19 }}>
              • {line}
            </ILText>
          ))}
        </ScrollView>
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 18, padding: 14 }}>
        <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 15 }}>
          Your details
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
          Pre-filled from your profile — change your name or add details if needed.
        </ILText>
        <LabeledInput label="Full name *" value={form.fullName || ''} onChangeText={(v) => set('fullName', v)} />
        <LabeledInput
          label="Contact no. *"
          value={form.contactNo || ''}
          onChangeText={(v) => set('contactNo', v)}
          keyboardType="phone-pad"
        />
        <LabeledInput
          label="Email *"
          value={form.email || ''}
          onChangeText={(v) => set('email', v)}
          keyboardType="email-address"
        />
        <LabeledInput
          label="LinkedIn profile"
          value={form.linkedinUrl || ''}
          onChangeText={(v) => set('linkedinUrl', v)}
          keyboardType="url"
          optional
        />
        <Pressable onPress={() => setSalaryOpen((o) => !o)} style={{ marginTop: 14 }}>
          <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 14 }}>
            Annual income{' '}
            <ILText role="bodySm" color={G.meta} style={{ fontFamily: IL_FONTS.regular, fontSize: 13 }}>
              (optional)
            </ILText>
          </ILText>
          <View
            style={{
              marginTop: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: G.line,
              paddingHorizontal: 12,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: G.white,
            }}
          >
            <ILText role="body" color={form.salaryRange ? G.ink : G.meta} style={{ flex: 1, fontSize: 15 }}>
              {form.salaryRange || 'Tap to choose a range or skip'}
            </ILText>
            <MaterialIcons name={salaryOpen ? 'expand-less' : 'expand-more'} size={22} color={G.meta} />
          </View>
        </Pressable>
        {salaryOpen ? (
          <View style={{ marginTop: 10 }}>
            <SalaryPicker
              value={form.salaryRange}
              optional
              onPick={(v) => {
                set('salaryRange', v);
                setSalaryOpen(false);
              }}
            />
          </View>
        ) : null}
        <LabeledInput
          label="Date *"
          value={form.agreementDate || ''}
          onChangeText={(v) => set('agreementDate', v)}
        />
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 18, padding: 14 }}>
        <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 15 }}>
          Upload signature *
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
          Sign on paper and photograph it, or upload a clear image of your signature.
        </ILText>
        <Pressable
          onPress={pickFromLibrary}
          style={{
            marginTop: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: G.line,
            borderStyle: 'dashed',
            padding: 14,
            alignItems: 'center',
            minHeight: form.signatureUri ? undefined : 100,
            justifyContent: 'center',
          }}
        >
          {form.signatureUri ? (
            <Image
              source={{ uri: form.signatureUri }}
              style={{ width: '100%', height: 120, resizeMode: 'contain' }}
            />
          ) : (
            <>
              <MaterialIcons name="draw" size={28} color={G.cta} />
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 13 }}>
                Choose from photos
              </ILText>
            </>
          )}
        </Pressable>
        <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
          <Pressable
            onPress={takePhoto}
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: G.line,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: G.white,
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
              Take photo
            </ILText>
          </Pressable>
          <Pressable
            onPress={pickFromDocuments}
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: G.line,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: G.white,
            }}
          >
            <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
              Choose file
            </ILText>
          </Pressable>
        </View>
      </WhiteCard>

      <Pressable
        onPress={() => set('agreed', !form.agreed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!form.agreed }}
        style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-start' }}
      >
        <MaterialIcons
          name={form.agreed ? 'check-box' : 'check-box-outline-blank'}
          size={22}
          color={G.cta}
          style={{ marginTop: 1 }}
        />
        <ILText role="body" color={G.ink} style={{ marginLeft: 10, flex: 1, fontSize: 14, lineHeight: 20 }}>
          I agree to the points mentioned in the document above.
        </ILText>
      </Pressable>
    </View>
  );
}