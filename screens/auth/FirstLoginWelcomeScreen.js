import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_BRAND, IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import ILButton from '../../components/il/ILButton';
import { useAuth } from '../../context/AuthContext';
import { formatCallableError, refreshMyAccess, updateMyWelcomeProfile } from '../../services/functions';

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
const CHIP_INK = '#F3EDE4';

/** Staff notes in Zoho are not a learner's answer. */
function learnerValue(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const v = text.toLowerCase().replace(/\s+/g, ' ');
  if (
    v.includes('check with the learner') ||
    v.includes('please check') ||
    ['n/a', 'na', 'none', 'nil', '-', '--', 'tbd', 'unknown', 'not available'].includes(v)
  ) {
    return '';
  }
  return text;
}

function Chip({ icon, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, edit`}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 11,
      }}
    >
      <MaterialIcons name={icon} size={15} color={ROSE} />
      <ILText
        role="label"
        color={CHIP_INK}
        style={{ marginLeft: 8, marginRight: 8, fontSize: 13, lineHeight: 16 }}
      >
        {label}
      </ILText>
      <MaterialIcons name="edit" size={13} color={ROSE} />
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
    profile?.displayName?.split(' ')[0] ||
    'Ananya';
  const city = learnerValue(profile?.city);
  const domain = learnerValue(profile?.domain);
  const bhag = learnerValue(profile?.bhag);
  const needsDetails = !city || !domain || !bhag;
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const beginEdit = (key) => {
    if (!user?.uid || user.uid === 'preview' || isPreview) return;
    const current = key === 'city' ? city : key === 'domain' ? domain : bhag;
    setEditing(key);
    setDraft(current);
    setSaveError('');
  };

  const saveEdit = async () => {
    const value = draft.trim();
    if (!editing || !value || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const result = await updateMyWelcomeProfile({ [editing]: value });
      if (!result?.ok) {
        setSaveError(result?.reason || 'Could not save to Zoho');
        return;
      }
      patchProfile({ [editing]: value });
      setEditing(null);
    } catch (err) {
      setSaveError(formatCallableError(err, 'Could not save to Zoho'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!user?.uid || user.uid === 'preview' || isPreview) return undefined;
    refreshMyAccess();
    return undefined;
  }, [user?.uid, isPreview]);

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

  const goBatch = () => {
    if (typeof onGoBatch === 'function') {
      onGoBatch();
      return;
    }
    if (navigation) {
      navigation.navigate('ChooseBatchDate');
      return;
    }
    const fallback = onDoneProp || route?.params?.onDone;
    if (typeof fallback === 'function') fallback();
  };

  return (
    <View style={{ flex: 1, backgroundColor: DARK }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(232,168,160,0.55)',
              backgroundColor: 'rgba(232,168,160,0.10)',
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <MaterialIcons name="school" size={13} color={ROSE} />
            <ILText
              role="eyebrow"
              color={ROSE}
              style={{ marginLeft: 7, fontSize: 10, letterSpacing: 0.8 }}
            >
              Registered · Leadership Essentials program
            </ILText>
          </View>

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

          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: IL_BRAND.white,
              transform: [{ rotate: '45deg' }],
              marginTop: 12,
              marginBottom: -8,
              zIndex: 1,
            }}
          />
          <View
            style={{
              alignSelf: 'stretch',
              backgroundColor: IL_BRAND.white,
              borderRadius: 26,
              paddingHorizontal: 22,
              paddingVertical: 20,
            }}
          >
            <ILText
              role="body"
              color={IL_BRAND.ink}
              align="center"
              style={{ fontSize: 16, lineHeight: 24 }}
            >
              {`Hi ${name}! I’m IL Guide, and I’ll walk with you every step. First, let’s lock in your batch date so your seat is yours.`}
            </ILText>
          </View>

          <View
            style={{
              alignSelf: 'stretch',
              alignItems: 'center',
              marginTop: 22,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.10)',
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <View style={{ marginRight: 10 }}>
                <Chip icon="place" label={city || 'Add your city'} onPress={() => beginEdit('city')} />
              </View>
              <Chip icon="work-outline" label={domain || 'Add your field of work'} onPress={() => beginEdit('domain')} />
            </View>
            <View style={{ marginTop: 10 }}>
              <Chip icon="flag" label={bhag ? `Goal: ${bhag}` : 'Add your 3-month goal'} onPress={() => beginEdit('bhag')} />
            </View>
            {editing ? (
              <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={
                    editing === 'city'
                      ? 'Your city, for example Bengaluru'
                      : editing === 'domain'
                        ? 'Your field of work, for example Technology'
                        : 'Your goal for the next 3 months'
                  }
                  placeholderTextColor="rgba(16,44,50,0.45)"
                  autoFocus
                  style={{
                    backgroundColor: IL_BRAND.white,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: IL_BRAND.ink,
                  }}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={saveEdit}
                  disabled={saving || !draft.trim()}
                  style={{
                    marginTop: 8,
                    backgroundColor: CTA,
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: saving || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  <ILText role="label" color={IL_BRAND.white}>
                    {saving ? 'Saving…' : 'Save'}
                  </ILText>
                </Pressable>
                {saveError ? (
                  <ILText
                    role="bodySm"
                    color={ROSE}
                    align="center"
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    {saveError}
                  </ILText>
                ) : null}
              </View>
            ) : null}
            <ILText
              role="bodySm"
              color="rgba(232,168,160,0.72)"
              align="center"
              style={{ marginTop: 12, fontSize: 13 }}
            >
              {needsDetails
                ? 'Tap a line to fill it in: your city, your field of work, and your goal for the next 3 months.'
                : 'From your profile. Tap a line to update it.'}
            </ILText>
          </View>

          <ILButton
            label="Choose my batch date"
            onPress={goBatch}
            style={{
              alignSelf: 'stretch',
              backgroundColor: CTA,
              marginTop: 26,
            }}
          />

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
    </View>
  );
}
