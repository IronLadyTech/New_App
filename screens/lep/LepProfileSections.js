import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { PAYMENT_STATUS, REGISTRATION_FEE } from '../../constants/programs';
import {
  learnerEnrollmentLabel,
  programPaymentStatus,
  zohoLeadBatchLabel,
  zohoPaymentDetail,
} from '../../utils/programAccess';
import { buildProgramBatchCard } from '../../utils/lepBatchHero';
import { formatLepDay } from '../../utils/registeredHomeData';
import { resolveLepBatchDateLine } from '../../utils/lepDeskBatchDate';
import { saveWelcomeProfileFields } from '../../services/functions';
import { welcomeSaveFeedback } from '../../utils/participantSyncMessage';
import { WhiteCard, RedCta } from './LepBits';

const FILL = '#F7F1E1';

function StrengthRing({ percent }) {
  const size = 64;
  const stroke = 5;
  const c = size / 2;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, percent / 100));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={c} cy={c} r={r} stroke={G.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={G.cta}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ * frac} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <ILText role="display" color={G.cta} style={{ fontFamily: IL_FONTS.display, fontSize: 16, lineHeight: 20 }}>
        {`${percent}%`}
      </ILText>
    </View>
  );
}

function strengthLabel(percent) {
  if (percent >= 100) return 'Complete';
  if (percent >= 60) return 'Good';
  if (percent >= 30) return 'Fair';
  return 'Start';
}

export function ProfileStrengthCard({ facts, onSaved }) {
  const domain = facts.domain || facts.industry || '';
  const fields = [
    {
      key: 'city',
      title: 'Current city',
      value: facts.city,
      hint: 'Find nearby mentors & peers',
      placeholder: 'Your city, for example Bengaluru',
    },
    {
      key: 'domain',
      title: 'Field of work',
      value: domain,
      hint: 'Technology, Marketing, Finance…',
      placeholder: 'Your domain, for example Technology',
    },
    {
      key: 'experience',
      title: 'Years of experience',
      value: facts.experience,
      hint: 'Helps us group you with the right peers',
      placeholder: 'For example 8',
    },
  ];
  const filled = [facts.city, domain, facts.experience, facts.bhag].filter(Boolean).length;
  const percent = Math.round((filled / 4) * 100);
  const [edit, setEdit] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = (field) => {
    setEdit(field);
    setDraft(String(field.value || '').replace(/\s*years$/i, ''));
  };

  const save = async () => {
    const value = draft.trim();
    if (!edit || !value || saving) return;
    setSaving(true);
    try {
      if (edit.key === 'experience') {
        onSaved?.({ experience: `${value.replace(/\s*years?$/i, '')} years` });
        setEdit(null);
        return;
      }
      const key = edit.key === 'domain' ? 'domain' : 'city';
      const local = key === 'domain' ? { domain: value, leadershipRole: value } : { city: value };
      onSaved?.(local);
      setEdit(null);
      const result = await saveWelcomeProfileFields({ [key]: value });
      const feedback = welcomeSaveFeedback(result);
      if (feedback.message && (feedback.isError || !feedback.zohoSynced)) {
        Alert.alert(feedback.isError ? 'Could not save' : 'Saved', feedback.message);
      }
    } catch (err) {
      const feedback = welcomeSaveFeedback(null, err);
      Alert.alert('Could not save', feedback.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
            PROFILE STRENGTH
          </ILText>
          <View
            style={{
              marginLeft: 8,
              backgroundColor: G.pink,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
              {strengthLabel(percent)}
            </ILText>
          </View>
        </View>
        <StrengthRing percent={percent} />
      </View>
      {fields.map((field) => (
        <Pressable
          key={field.key}
          onPress={() => openEdit(field)}
          style={{
            marginTop: 12,
            backgroundColor: FILL,
            borderRadius: 14,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <ILText role="label" color={G.ink}>
              {field.title}
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {field.value || field.hint}
            </ILText>
          </View>
          <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
            {field.value ? 'Edit' : '+ add'}
          </ILText>
        </Pressable>
      ))}
      <Modal visible={!!edit} transparent animationType="fade" onRequestClose={() => setEdit(null)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}
          onPress={() => setEdit(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{ backgroundColor: G.white, borderRadius: 18, padding: 18 }}
          >
            <ILText role="label" color={G.ink}>
              {edit?.title}
            </ILText>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={edit?.placeholder}
              placeholderTextColor={G.meta}
              autoFocus
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: G.line,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 15,
                color: G.ink,
              }}
            />
            <Pressable
              onPress={save}
              disabled={saving || !draft.trim()}
              style={{
                marginTop: 12,
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: saving || !draft.trim() ? 0.5 : 1,
              }}
            >
              <ILText role="label" color="#FFFFFF">
                {saving ? 'Saving…' : 'Save'}
              </ILText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </WhiteCard>
  );
}

export function ProfileBhagCard({ bhag, onSaved }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setDraft(String(bhag || ''));
    setEdit(true);
  };

  const save = async () => {
    const value = draft.trim();
    if (!value || saving) return;
    setSaving(true);
    try {
      onSaved?.({ bhag: value });
      setEdit(false);
      const result = await saveWelcomeProfileFields({ bhag: value });
      const feedback = welcomeSaveFeedback(result);
      if (feedback.message && (feedback.isError || !feedback.zohoSynced)) {
        Alert.alert(feedback.isError ? 'Could not save' : 'Saved', feedback.message);
      }
    } catch (err) {
      const feedback = welcomeSaveFeedback(null, err);
      Alert.alert('Could not save', feedback.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="auto-awesome" size={16} color={G.cta} />
        <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10, marginLeft: 8, flex: 1 }]}>
          MY B-HAG (BIG HAIRY AUDACIOUS GOAL)
        </ILText>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit B-HAG" onPress={openEdit} hitSlop={8}>
          <MaterialIcons name="edit" size={18} color={G.meta} />
        </Pressable>
      </View>
      <Pressable onPress={openEdit} style={{ marginTop: 12, backgroundColor: FILL, borderRadius: 14, padding: 14 }}>
        <ILText
          role="title"
          color={G.ink}
          style={{ fontFamily: IL_FONTS.display, fontSize: 20, lineHeight: 26 }}
        >
          {bhag || 'Name the goal big enough to scare you'}
        </ILText>
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ILText role="bodySm" color={G.meta} style={{ flex: 1, fontSize: 12, lineHeight: 17, paddingRight: 8 }}>
            {bhag
              ? 'Calibrated for Leadership Essentials · Foundation principle active'
              : 'Write it in one sentence. We use it across LEP.'}
          </ILText>
          <ILText role="label" color={G.cta} style={[af, { fontSize: 12 }]}>
            {bhag ? 'Edit' : '+ add'}
          </ILText>
        </View>
      </Pressable>
      <Modal visible={edit} transparent animationType="fade" onRequestClose={() => setEdit(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}
          onPress={() => setEdit(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            style={{ backgroundColor: G.white, borderRadius: 18, padding: 18 }}
          >
            <ILText role="label" color={G.ink}>
              Your B-HAG
            </ILText>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="One sentence — the goal big enough to scare you"
              placeholderTextColor={G.meta}
              autoFocus
              multiline
              style={{
                marginTop: 12,
                minHeight: 88,
                borderWidth: 1,
                borderColor: G.line,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 15,
                color: G.ink,
                textAlignVertical: 'top',
              }}
            />
            <Pressable
              onPress={save}
              disabled={saving || !draft.trim()}
              style={{
                marginTop: 12,
                backgroundColor: G.cta,
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: saving || !draft.trim() ? 0.5 : 1,
              }}
            >
              <ILText role="label" color="#FFFFFF">
                {saving ? 'Saving…' : 'Save'}
              </ILText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </WhiteCard>
  );
}

export function EnrollmentStatusCard({ program, source, group, cmsBatch, onEnroll, onChangeDate, onHelp }) {
  const enrolled = learnerEnrollmentLabel(source, program.id) === 'Enrolled';
  const batchCard = buildProgramBatchCard(source, program.id, group);
  const lep = source?.programAccess?.lep || {};
  const day1Iso = cmsBatch?.day1Date || lep.day1Date || '';
  const day1 = day1Iso ? formatLepDay(day1Iso) : batchCard.heading;
  const day2 = day1Iso
    ? formatLepDay(
        (() => {
          const [y, m, d] = String(day1Iso).split('-').map(Number);
          const next = new Date(y, m - 1, d + 1);
          return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
        })()
      )
    : '';
  const weekendLine =
    day1 && day2 ? `${day1} – ${day2}` : day1 || 'Pick your batch date';
  const { dateLine: zohoBatch } = resolveLepBatchDateLine({
    profile: source,
    cmsBatch,
    zohoLive: zohoLeadBatchLabel(source, program.id),
  });
  const hasBatch = Boolean(day1Iso || zohoBatch);

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10 }]}>
          ENROLLMENT STATUS
        </ILText>
        <View
          style={{
            backgroundColor: G.pink,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            maxWidth: '52%',
          }}
        >
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]} numberOfLines={2}>
            {enrolled ? 'Enrolled' : 'Seat reserved · Pending enrollment'}
          </ILText>
        </View>
      </View>
      <View style={{ marginTop: 14, backgroundColor: FILL, borderRadius: 14, padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ILText role="label" color={G.ink} style={{ flex: 1, paddingRight: 8 }}>
            {program.title}
          </ILText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: G.cta, marginRight: 6 }} />
            <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 9 }]}>
              Live Zoom
            </ILText>
          </View>
        </View>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
          {enrolled
            ? 'Your full seat is confirmed. Batch dates and join links stay on My Program.'
            : 'Your registration seat is held. Complete enrollment to unlock the full programme.'}
        </ILText>
      </View>
      {hasBatch ? (
        <View
          style={{
            marginTop: 12,
            backgroundColor: G.white,
            borderWidth: 1,
            borderColor: G.line,
            borderRadius: 14,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="event" size={18} color={G.ink} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 9 }]}>
                BATCH
              </ILText>
              {zohoBatch ? (
                <ILText role="label" color={G.ink} style={{ marginTop: 2, fontSize: 13 }}>
                  {zohoBatch}
                </ILText>
              ) : null}
              <ILText
                role="bodySm"
                color={G.meta}
                style={{ marginTop: zohoBatch ? 4 : 2, fontSize: 12, lineHeight: 16 }}
              >
                {weekendLine}
              </ILText>
            </View>
            {!enrolled ? (
              <Pressable onPress={onChangeDate} hitSlop={8}>
                <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
                  Change
                </ILText>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <View
          style={{
            marginTop: 12,
            backgroundColor: G.white,
            borderWidth: 1,
            borderColor: G.line,
            borderRadius: 14,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <MaterialIcons name="event" size={18} color={G.ink} />
          <ILText role="label" color={G.ink} style={{ flex: 1, marginLeft: 10, fontSize: 13 }}>
            Pick your batch date
          </ILText>
          <Pressable onPress={onChangeDate} hitSlop={8}>
            <ILText role="label" color={G.cta} style={{ fontSize: 13 }}>
              Choose
            </ILText>
          </Pressable>
        </View>
      )}
      <View style={{ marginTop: 14, minHeight: enrolled ? 0 : 52 }}>
        {!enrolled ? <RedCta label="Complete your enrollment →" onPress={onEnroll} /> : null}
      </View>
      <Pressable
        onPress={onHelp}
        style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
      >
        <MaterialIcons name="phone" size={16} color={G.meta} />
        <ILText role="bodySm" color={G.meta} style={{ marginLeft: 8, fontSize: 12 }}>
          Need help deciding? Talk to someone at Iron Lady
        </ILText>
      </Pressable>
    </WhiteCard>
  );
}

export function PaymentBillingCard({ program, source, latest, onPay, onReceipt }) {
  const pay = zohoPaymentDetail(source, program.id);
  const status = programPaymentStatus(source, program.id);
  const regAmount =
    pay.amount ||
    Number(source?.programAccess?.[program.id]?.registrationAmount) ||
    REGISTRATION_FEE[program.id] ||
    REGISTRATION_FEE.lep;
  const regPaid = status === PAYMENT_STATUS.REGISTER || status === PAYMENT_STATUS.PAID;
  const fullyPaid = status === PAYMENT_STATUS.PAID;
  const balanceLabel = fullyPaid ? 'PAID' : 'BALANCE DUE';

  return (
    <WhiteCard style={{ marginTop: 14, borderRadius: 22, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="receipt-long" size={16} color={G.ink} />
          <ILText role="eyebrow" color={G.ink} style={[af, { fontSize: 10, marginLeft: 8 }]}>
            PAYMENT & BILLING
          </ILText>
        </View>
        <ILText role="bodySm" color={G.meta} style={{ fontSize: 11 }}>
          Synced from Zoho
        </ILText>
      </View>
      <View style={{ marginTop: 14, backgroundColor: FILL, borderRadius: 14, padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ILText role="eyebrow" color={G.meta} style={[af, { fontSize: 10, flex: 1 }]}>
            {program.title.toUpperCase()}
          </ILText>
          <View
            style={{
              backgroundColor: fullyPaid ? '#E8F6EE' : G.pink,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <ILText role="eyebrow" color={fullyPaid ? '#1B7A4A' : G.cta} style={[af, { fontSize: 9 }]}>
              {balanceLabel}
            </ILText>
          </View>
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              Registration fee
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {regPaid ? `Paid${pay.paidOn ? ` ${pay.paidOn}` : ''}` : 'Due'}
            </ILText>
          </View>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
            {`₹${Number(regAmount).toLocaleString('en-IN')}`}
          </ILText>
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <ILText role="bodySm" color={G.meta} style={{ fontSize: 12 }}>
              Programme balance
            </ILText>
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 2, fontSize: 12 }}>
              {fullyPaid ? 'Paid' : 'Due after registration'}
            </ILText>
          </View>
          <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 18 }}>
            {fullyPaid ? '₹0' : '—'}
          </ILText>
        </View>
        <View style={{ marginTop: 12, height: 6, borderRadius: 3, backgroundColor: G.line, overflow: 'hidden' }}>
          <View
            style={{
              width: fullyPaid ? '100%' : regPaid ? '35%' : '10%',
              height: '100%',
              backgroundColor: G.cta,
            }}
          />
        </View>
      </View>
      <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
        {!fullyPaid ? (
          <View style={{ flex: 1 }}>
            <RedCta label="Pay balance" onPress={onPay} />
          </View>
        ) : null}
        <Pressable
          onPress={() => (latest ? onReceipt(latest) : onPay())}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: G.dash,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: G.white,
          }}
        >
          <ILText role="label" color={G.ink}>
            View receipt
          </ILText>
        </Pressable>
      </View>
    </WhiteCard>
  );
}

export function memberSinceLabel(profile) {
  const raw =
    profile?.createdAt?.toDate?.() ||
    profile?.createdAt ||
    profile?.welcomeCompletedAt ||
    profile?.programAccess?.lep?.registeredAt ||
    null;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Iron Lady Army';
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Iron Lady Army · since ${mon[date.getMonth()]} ${date.getFullYear()}`;
}

export function talkToIronLady() {
  Linking.openURL('mailto:support@ironlady.tech?subject=Help%20deciding%20on%20LEP%20enrollment').catch(() => {});
}
