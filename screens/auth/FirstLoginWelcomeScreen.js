import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import ILButton from '../../components/il/ILButton';
import { useAuth } from '../../context/AuthContext';
import { PAYMENT_STATUS } from '../../constants/programs';
import { fetchUserProfile } from '../../services/auth';
import {
  getEnrolledPrograms,
  learnerBatchLabel,
  needsLepBatchSelection,
  programPaymentStatus,
  readWelcomeFields,
} from '../../utils/programAccess';
import {
  refreshMyAccess,
  saveWelcomeProfileFields,
  syncWelcomeProfileInBackground,
} from '../../services/functions';
import { welcomeSaveFeedback } from '../../utils/participantSyncMessage';
import { BhagComposer, CityPicker, FieldOfWorkPicker } from '../../components/profile/ProfilePickers';

const GUIDE = require('../../assets/il/il-guide-face.jpg');
const DARK = '#102C32';
const CTA = '#ED1D24';
const ROSE = '#E8A8A0';
const RING_FROM = '#ED1D24';
const RING_VIA = '#FF9EA1';
const RING_TO = '#FF5C61';
const SEAL = '#FF9EA1';
const SEAL_DISC = '#113744';
const GLOW = 'rgba(235,193,102,0.35)';
const CARD_FILL = '#F4F1E8';
const INK_MUTED = 'rgba(16, 44, 50, 0.55)';

function welcomeBadges(profile) {
  return getEnrolledPrograms(profile)
    .map((entry) => {
      const payment = programPaymentStatus(profile, entry.id);
      if (payment === PAYMENT_STATUS.UNPAID) return null;
      const status = payment === PAYMENT_STATUS.PAID ? 'Enrolled' : 'Registered';
      return `${status} · ${entry.title}`;
    })
    .filter(Boolean);
}

const FIELD_META = {
  city: {
    icon: 'place',
    title: 'Current city',
    placeholder: 'Your city, for example Bengaluru',
    empty: 'Add your city',
  },
  domain: {
    icon: 'work-outline',
    title: 'Field of work',
    placeholder: 'Choose your field of work',
    empty: 'Choose your field of work',
  },
  bhag: {
    icon: 'flag',
    title: '3-month goal (B-HAG)',
    placeholder: 'Your goal for the next 3 months',
    empty: 'Add your 3-month goal',
  },
};

function WelcomeFieldRow({ fieldKey, value, active, onPress }) {
  const meta = FIELD_META[fieldKey];
  const filled = Boolean(String(value || '').trim());
  const display = filled ? value : meta.empty;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${meta.title}, edit`}
      onPress={onPress}
      style={{
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: active ? 'rgba(237, 29, 36, 0.08)' : IL_BRAND.white,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: active ? 'rgba(237, 29, 36, 0.12)' : CARD_FILL,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={meta.icon} size={18} color={active ? CTA : IL_BRAND.forest} />
      </View>
      <View style={{ flex: 1, marginLeft: 12, marginRight: 10, minWidth: 0 }}>
        <ILText role="eyebrow" color={INK_MUTED} style={{ fontSize: 10, letterSpacing: 0.5 }}>
          {meta.title.toUpperCase()}
        </ILText>
        <ILText
          role="body"
          color={filled ? IL_BRAND.ink : INK_MUTED}
          style={{
            marginTop: 3,
            fontSize: 15,
            lineHeight: 21,
            fontFamily: filled ? IL_FONTS.semibold : IL_FONTS.regular,
          }}
          numberOfLines={fieldKey === 'bhag' ? 4 : 2}
        >
          {display}
        </ILText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={INK_MUTED} />
    </Pressable>
  );
}

export default function FirstLoginWelcomeScreen({
  navigation,
  route,
  onGoBatch,
  onBack,
  onDone: onDoneProp,
}) {
  const insets = useSafeAreaInsets();
  const { profile, user, isPreview, patchProfile, logout } = useAuth();
  const name =
    route?.params?.name ||
    String(profile?.displayName || profile?.firstName || '')
      .trim()
      .split(/\s+/)[0] ||
    'there';
  const badges =
    !user?.uid || user.uid === 'preview' || isPreview
      ? ['Registered · Leadership Essentials Program']
      : welcomeBadges(profile);
  const [fields, setFields] = useState(() => readWelcomeFields(profile));
  const hasCity = Boolean(String(fields.city || '').trim());
  const hasDomain = Boolean(String(fields.domain || '').trim());
  const hasBhag = Boolean(String(fields.bhag || '').trim());
  const previewFlow = !user?.uid || user.uid === 'preview' || isPreview;
  const canContinue = previewFlow || (hasCity && hasDomain);
  const pickBatch = needsLepBatchSelection(profile);
  const batchLabel = learnerBatchLabel(profile, 'lep');
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const [saveNoticeError, setSaveNoticeError] = useState(false);
  const editingRef = useRef(null);
  const profileRef = useRef(profile);
  const syncRanRef = useRef(false);
  editingRef.current = editing;
  profileRef.current = profile;

  useEffect(() => {
    if (editing) return;
    const fromProfile = readWelcomeFields(profile);
    setFields((prev) => ({
      city: fromProfile.city || prev.city,
      domain: fromProfile.domain || prev.domain,
      bhag: fromProfile.bhag || prev.bhag,
    }));
  }, [profile, editing]);

  const displayValue = (key) => {
    if (editing === key) return draft;
    return fields[key] || '';
  };

  const beginEdit = (key) => {
    if (!user?.uid || user.uid === 'preview' || isPreview) return;
    setEditing(key);
    setDraft(fields[key] || '');
    setSaveNotice('');
    setSaveNoticeError(false);
  };

  const saveEdit = (picked) => {
    const value = String(typeof picked === 'string' ? picked : draft).trim();
    if (!editing || !value || saving) return;
    const key = editing;
    const local =
      key === 'domain' ? { domain: value, leadershipRole: value } : { [key]: value };
    setFields((prev) => ({ ...prev, [key]: value }));
    patchProfile(local);
    setEditing(null);
    setSaving(false);
    setSaveNotice('');
    setSaveNoticeError(false);

    if (previewFlow) return;

    setSaving(true);
    saveWelcomeProfileFields({ [key]: value })
      .then((result) => {
        const feedback = welcomeSaveFeedback(result);
        setSaveNotice(feedback.message);
        setSaveNoticeError(feedback.isError);
        if (result?.zohoLeadId) patchProfile({ zohoLeadId: result.zohoLeadId });
        if (feedback.zohoSynced) refreshMyAccess().catch(() => {});
      })
      .catch((err) => {
        const feedback = welcomeSaveFeedback(null, err);
        setSaveNotice(feedback.message);
        setSaveNoticeError(feedback.isError);
      })
      .finally(() => setSaving(false));
  };

  const syncFromZoho = useCallback(async () => {
    if (!user?.uid || user.uid === 'preview' || isPreview || editingRef.current) return;
    setSyncing(true);
    try {
      const fresh = await fetchUserProfile(user.uid).catch(() => null);
      const next = readWelcomeFields(fresh || profileRef.current);
      setFields((prev) => ({
        city: next.city || prev.city,
        domain: next.domain || prev.domain,
        bhag: next.bhag || prev.bhag,
      }));
      const patch = {};
      if (next.city) patch.city = next.city;
      if (next.domain) {
        patch.domain = next.domain;
        patch.leadershipRole = next.domain;
      }
      if (next.bhag) patch.bhag = next.bhag;
      if (Object.keys(patch).length) patchProfile(patch);
      refreshMyAccess().catch(() => {});
    } finally {
      setSyncing(false);
    }
  }, [user?.uid, isPreview, patchProfile]);

  useEffect(() => {
    if (!user?.uid || user.uid === 'preview' || isPreview) return;
    if (syncRanRef.current) return;
    syncRanRef.current = true;
    syncFromZoho();
  }, [user?.uid, isPreview, syncFromZoho]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncFromZoho();
    });
    return () => sub.remove();
  }, [syncFromZoho]);

  const goBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    logout();
  };

  const finishWelcome = () => {
    const done = onDoneProp || route?.params?.onDone;
    if (typeof done === 'function') {
      done();
      return;
    }
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  const goBatch = () => {
    if (!canContinue) return;
    const payload = {
      city: String(fields.city || '').trim(),
      domain: String(fields.domain || '').trim(),
    };
    const bhagVal = String(fields.bhag || '').trim();
    if (bhagVal) payload.bhag = bhagVal;
    patchProfile({
      city: payload.city,
      domain: payload.domain,
      leadershipRole: payload.domain,
      ...(payload.bhag ? { bhag: payload.bhag } : {}),
    });
    if (payload.city && payload.domain && !previewFlow) {
      syncWelcomeProfileInBackground(payload, (result) => {
        if (result?.zohoLeadId) patchProfile({ zohoLeadId: result.zohoLeadId });
      });
    }
    if (!pickBatch) {
      finishWelcome();
      return;
    }
    if (typeof onGoBatch === 'function') {
      onGoBatch();
      return;
    }
    if (navigation) {
      navigation.navigate('ChooseBatchDate');
      return;
    }
    finishWelcome();
  };

  return (
    <View style={{ flex: 1, backgroundColor: DARK }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: Math.max(insets.top, 12) + 10,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
          <View style={{ alignSelf: 'stretch', marginBottom: 14 }}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: IL_BRAND.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="chevron-left" size={22} color={IL_BRAND.ink} />
            </Pressable>
          </View>
          {badges.length ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignSelf: 'stretch',
              }}
            >
              {badges.map((label) => (
                <View
                  key={label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(232,168,160,0.55)',
                    backgroundColor: 'rgba(232,168,160,0.10)',
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    margin: 4,
                    maxWidth: '100%',
                  }}
                >
                  <MaterialIcons name="school" size={13} color={ROSE} />
                  <ILText
                    role="eyebrow"
                    color={ROSE}
                    style={{ marginLeft: 7, fontSize: 10, letterSpacing: 0.8, flexShrink: 1 }}
                  >
                    {label}
                  </ILText>
                </View>
              ))}
            </View>
          ) : null}

          <ILText
            role="display"
            color={IL_BRAND.white}
            align="center"
            style={{
              marginTop: 22,
              fontSize: 34,
              lineHeight: 42,
              letterSpacing: -0.5,
            }}
          >
            {`Welcome to the Iron Lady\nArmy, ${name}.`}
          </ILText>

          <ILText
            align="center"
            color={ROSE}
            style={{
              marginTop: 10,
              fontFamily: IL_FONTS.displayItalic,
              fontSize: 17,
              lineHeight: 24,
            }}
          >
            Your journey has begun.
          </ILText>

          <View style={{ alignItems: 'center', marginTop: 28 }}>
            <View style={{ width: 118, height: 118, marginBottom: 6, overflow: 'visible' }}>
              <LinearGradient
                colors={[RING_FROM, RING_VIA, RING_TO]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: 118,
                  height: 118,
                  borderRadius: 59,
                  padding: 3,
                  shadowColor: '#EBC166',
                  shadowOpacity: 0.55,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 0 },
                  ...(Platform.OS === 'web'
                    ? { boxShadow: `0 0 28px ${GLOW}` }
                    : null),
                }}
              >
                <Image
                  source={GUIDE}
                  resizeMode="cover"
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                />
              </LinearGradient>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 26,
                  height: 26,
                  right: 2,
                  bottom: 10,
                  borderRadius: 13,
                  backgroundColor: SEAL_DISC,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 3,
                }}
              >
                <MaterialCommunityIcons name="check-decagram" size={16} color={SEAL} />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <ILText role="label" color={IL_BRAND.white} style={{ fontSize: 14 }}>
                IL Guide
              </ILText>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: 'rgba(232,168,160,0.55)',
                  marginLeft: 6,
                }}
              />
            </View>
          </View>

          <View style={{ alignSelf: 'stretch', marginTop: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 14,
                height: 14,
                backgroundColor: IL_BRAND.white,
                transform: [{ rotate: '45deg' }],
                marginBottom: -7,
              }}
            />
          </View>
          <View
            style={{
              alignSelf: 'stretch',
              backgroundColor: IL_BRAND.white,
              borderRadius: 26,
              paddingHorizontal: 22,
              paddingVertical: 20,
              overflow: 'hidden',
            }}
          >
            <ILText
              role="body"
              color={IL_BRAND.ink}
              align="center"
              style={{ fontSize: 16, lineHeight: 24 }}
            >
              {pickBatch
                ? `Hi ${name}! I’m IL Guide, and I’ll walk with you every step. First, let’s lock in your batch date so your seat is yours.`
                : batchLabel
                  ? `Hi ${name}! I’m IL Guide. You’re on ${batchLabel} — let’s confirm your details and open your dashboard.`
                  : `Hi ${name}! I’m IL Guide. Let’s confirm your details and open your dashboard.`}
            </ILText>
          </View>

          <View
            style={{
              alignSelf: 'stretch',
              marginTop: 18,
              backgroundColor: IL_BRAND.white,
              borderRadius: 26,
              paddingHorizontal: 16,
              paddingTop: 18,
              paddingBottom: 14,
            }}
          >
            <ILText
              role="eyebrow"
              color={CTA}
              style={{ fontSize: 10, letterSpacing: 1, marginBottom: 4, marginLeft: 2 }}
            >
              YOUR DETAILS
            </ILText>
            <ILText role="bodySm" color={INK_MUTED} style={{ marginBottom: 10, marginLeft: 2, fontSize: 13 }}>
              Tap a row to add or update
            </ILText>
            <View
              style={{
                backgroundColor: CARD_FILL,
                borderRadius: 18,
                padding: 8,
                gap: 8,
              }}
            >
              {['city', 'domain', 'bhag'].map((key) => (
                <WelcomeFieldRow
                  key={key}
                  fieldKey={key}
                  value={displayValue(key)}
                  active={editing === key}
                  onPress={() => beginEdit(key)}
                />
              ))}
            </View>
            <View
              style={{
                height: 36,
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              {syncing ? (
                <>
                  <ActivityIndicator size="small" color={CTA} />
                  <ILText
                    role="bodySm"
                    color={INK_MUTED}
                    numberOfLines={1}
                    style={{ marginLeft: 8, fontSize: 12, flexShrink: 1 }}
                  >
                    Checking your saved details…
                  </ILText>
                </>
              ) : (
                <ILText
                  role="bodySm"
                  color={canContinue ? (hasBhag ? '#1B7A4A' : INK_MUTED) : INK_MUTED}
                  align="center"
                  numberOfLines={2}
                  style={{ fontSize: 12, lineHeight: 17 }}
                >
                  {!canContinue
                    ? hasCity || hasDomain
                      ? 'Add your city and field of work to continue.'
                      : 'Start with your city and field of work — then you can continue.'
                    : hasBhag
                      ? 'All set — you can edit anytime from Profile.'
                      : 'You can continue. Add your 3-month goal anytime from Profile.'}
                </ILText>
              )}
            </View>
          </View>

          <ILButton
            label={pickBatch ? 'Choose my batch date' : 'Continue to my dashboard'}
            onPress={goBatch}
            disabled={!canContinue}
            style={{
              alignSelf: 'stretch',
              backgroundColor: CTA,
              marginTop: 26,
            }}
          />

          {pickBatch && __DEV__ ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip batch selection"
              onPress={finishWelcome}
              style={{ marginTop: 14, paddingVertical: 8 }}
            >
              <ILText role="label" color={ROSE} align="center" style={{ fontSize: 14 }}>
                Skip for now
              </ILText>
            </Pressable>
          ) : null}

          {pickBatch ? (
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <MaterialIcons name="info-outline" size={15} color={ROSE} />
              <ILText
                role="bodySm"
                color={ROSE}
                style={{ marginLeft: 8, fontSize: 12 }}
              >
                Pick a batch to open your dashboard and community
              </ILText>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <MaterialIcons name="lock" size={13} color="rgba(243,237,228,0.45)" />
            <ILText
              role="bodySm"
              color="rgba(243,237,228,0.55)"
              style={{ marginLeft: 6, fontSize: 12 }}
            >
              Your details stay private
            </ILText>
          </View>
        </ScrollView>

      <Modal
        visible={Boolean(editing)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setEditing(null);
          setDraft('');
          setSaveNotice('');
          setSaveNoticeError(false);
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: IL_BRAND.white }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View
            style={{
              paddingTop: Math.max(insets.top, 12) + 8,
              paddingHorizontal: 20,
              paddingBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(16,44,50,0.08)',
            }}
          >
            <ILText role="title" color={IL_BRAND.ink} style={{ fontSize: 18 }}>
              {editing ? FIELD_META[editing].title : ''}
            </ILText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => {
                setEditing(null);
                setDraft('');
                setSaveNotice('');
                setSaveNoticeError(false);
              }}
              hitSlop={10}
            >
              <MaterialIcons name="close" size={24} color={IL_BRAND.ink} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 20,
              paddingBottom: Math.max(insets.bottom, 20) + 24,
            }}
          >
            {editing === 'city' ? (
              <CityPicker value={fields.city} onPick={saveEdit} autoFocus />
            ) : editing === 'domain' ? (
              <FieldOfWorkPicker value={fields.domain} onPick={saveEdit} />
            ) : editing === 'bhag' ? (
              <BhagComposer value={draft} onChange={setDraft} field={fields.domain} />
            ) : null}
            {editing === 'bhag' ? (
              <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => saveEdit()}
                  disabled={saving || !draft.trim()}
                  style={{
                    flex: 1,
                    backgroundColor: CTA,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: saving || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  <ILText role="label" color={IL_BRAND.white}>
                    {saving ? 'Saving…' : 'Save my goal'}
                  </ILText>
                </Pressable>
              </View>
            ) : null}
            {saveNotice ? (
              <ILText
                role="bodySm"
                color={saveNoticeError ? CTA : '#1B7A4A'}
                align="center"
                style={{ marginTop: 12, fontSize: 13, lineHeight: 18 }}
              >
                {saveNotice}
              </ILText>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
