import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../il/ILText';
import Pressable from '../il/Press';
import { MaterialIcons } from '@expo/vector-icons';
import { G, af } from '../../constants/guestTheme';
import { WhiteCard, RedCta } from '../../screens/lep/LepBits';
import { SalaryPicker } from '../profile/ProfilePickers';
import {
  PROMISES_PARTICIPANT,
  PROMISES_PARTICIPANT_TITLE,
  PROMISES_TEAM,
  PROMISES_TEAM_TITLE,
  PROMISES_WELCOME,
} from '../../constants/promisesAgreementContent';

function LabeledInput({ label, value, onChangeText, keyboardType, editable = true, optional, onFocus }) {
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
        onFocus={onFocus}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' || keyboardType === 'phone-pad' || keyboardType === 'url' ? 'none' : 'words'}
        placeholderTextColor="#B8B4A8"
        multiline={keyboardType !== 'phone-pad'}
        textAlignVertical="top"
        style={{
          marginTop: 6,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: G.line,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minHeight: keyboardType === 'phone-pad' ? undefined : 44,
          fontFamily: IL_FONTS.regular,
          fontSize: 15,
          lineHeight: 22,
          color: G.ink,
          backgroundColor: G.white,
        }}
      />
    </View>
  );
}

function BulletList({ items }) {
  return (
    <View style={{ marginTop: 10 }}>
      {items.map((line) => (
        <View key={line.slice(0, 48)} style={{ flexDirection: 'row', marginTop: 10, alignItems: 'flex-start' }}>
          <ILText role="body" color={G.cta} style={{ width: 14, fontSize: 14, lineHeight: 21 }}>
            •
          </ILText>
          <ILText role="body" color={G.ink} style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>
            {line}
          </ILText>
        </View>
      ))}
    </View>
  );
}

/** Step 1 — full agreement text in-app (PDF on server is optional when available). */
export function PromisesPdfGate({ onMarkRead, onOpenPdf, pdfAvailable }) {
  const [scrolledEnd, setScrolledEnd] = useState(false);

  const onScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 48) {
      setScrolledEnd(true);
    }
  };

  return (
    <View style={{ marginTop: 18 }}>
      <WhiteCard style={{ borderRadius: 18, padding: 14, backgroundColor: G.pink }}>
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          STEP 1 · READ THE AGREEMENT
        </ILText>
        {PROMISES_WELCOME.map((p) => (
          <ILText key={p} role="body" color={G.ink} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
            {p}
          </ILText>
        ))}
      </WhiteCard>

      <WhiteCard style={{ marginTop: 12, borderRadius: 18, padding: 0, overflow: 'hidden' }}>
        <ScrollView
          style={{ maxHeight: 360 }}
          nestedScrollEnabled
          onScroll={onScroll}
          scrollEventThrottle={120}
          showsVerticalScrollIndicator
        >
          <View style={{ padding: 16 }}>
            <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 16 }}>
              {PROMISES_TEAM_TITLE}
            </ILText>
            <BulletList items={PROMISES_TEAM} />

            <ILText
              role="label"
              color={G.ink}
              style={{ marginTop: 20, fontFamily: IL_FONTS.semibold, fontSize: 16 }}
            >
              {PROMISES_PARTICIPANT_TITLE}
            </ILText>
            <BulletList items={PROMISES_PARTICIPANT} />
          </View>
        </ScrollView>
      </WhiteCard>

      <ILText role="bodySm" color={G.meta} style={{ marginTop: 10, fontSize: 13, lineHeight: 18 }}>
        Scroll through the full text above. When you are done, tap below to unlock the sign-in form.
      </ILText>

      <View style={{ marginTop: 12, gap: 10 }}>
        <RedCta
          label="I have read the full agreement"
          onPress={() => {
            if (!scrolledEnd) {
              Alert.alert(
                'Read to the end',
                'Please scroll through the entire Promises and Agreements text above, then tap this button again.'
              );
              return;
            }
            onMarkRead?.();
          }}
        />
        {pdfAvailable && onOpenPdf ? (
          <Pressable onPress={onOpenPdf} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
              Open printable PDF copy (optional)
            </ILText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function applySignatureAsset(set, asset) {
  if (!asset?.uri) return;
  set('signatureUri', asset.uri);
  set('signatureFileName', asset.fileName || asset.name || 'signature.jpg');
}

export default function PromisesAgreementForm({
  form,
  setForm,
  pdfRead,
  onOpenPdf,
  onMarkRead,
  pdfAvailable,
  onInputFocus,
}) {
  const set = useCallback((key, value) => setForm((prev) => ({ ...prev, [key]: value })), [setForm]);
  const [salaryOpen, setSalaryOpen] = useState(false);

  if (!pdfRead) {
    return (
      <PromisesPdfGate onMarkRead={onMarkRead} onOpenPdf={onOpenPdf} pdfAvailable={pdfAvailable} />
    );
  }

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
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
          STEP 2 · YOUR AGREEMENT
        </ILText>
        <ILText role="body" color={G.ink} style={{ marginTop: 8, fontSize: 15, lineHeight: 22 }}>
          You have read the Promises and Agreements. Complete your details, upload your signature, and
          confirm you agree.
        </ILText>
        {pdfAvailable && onOpenPdf ? (
          <Pressable onPress={onOpenPdf} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="menu-book" size={18} color={G.cta} />
            <ILText role="label" color={G.cta} style={{ marginLeft: 8, fontSize: 13 }}>
              Open printable PDF copy
            </ILText>
          </Pressable>
        ) : null}
      </WhiteCard>

      <WhiteCard style={{ marginTop: 14, borderRadius: 18, padding: 14 }}>
        <ILText role="label" color={G.ink} style={{ fontFamily: IL_FONTS.semibold, fontSize: 15 }}>
          Your details
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 4, fontSize: 12, lineHeight: 17 }}>
          Pre-filled from your profile — change your name or add details if needed.
        </ILText>
        <LabeledInput
          label="Full name *"
          value={form.fullName || ''}
          onChangeText={(v) => set('fullName', v)}
          onFocus={onInputFocus}
        />
        <LabeledInput
          label="Contact no. *"
          value={form.contactNo || ''}
          onChangeText={(v) => set('contactNo', v)}
          keyboardType="phone-pad"
          onFocus={onInputFocus}
        />
        <LabeledInput
          label="Email *"
          value={form.email || ''}
          onChangeText={(v) => set('email', v)}
          keyboardType="email-address"
          onFocus={onInputFocus}
        />
        <LabeledInput
          label="LinkedIn profile"
          value={form.linkedinUrl || ''}
          onChangeText={(v) => set('linkedinUrl', v)}
          keyboardType="url"
          optional
          onFocus={onInputFocus}
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
          onFocus={onInputFocus}
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
          I have read the Promises and Agreements above and I agree to those promises.
        </ILText>
      </Pressable>
    </View>
  );
}