import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { GuestBackBar, WhiteCard } from '../guest/GuestBits';
import { Page, RedCta } from '../lep/LepBits';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import { useAuth } from '../../context/AuthContext';
import { lepFullName } from '../../utils/lepState';
import {
  TICKET_CATEGORIES,
  addTicketMessage,
  createTicket,
  getMyTickets,
  getTicketMessages,
  ticketStatusLabel,
} from '../../services/tickets';

const GREEN = '#1B7A4A';

const inputStyle = {
  marginTop: 8,
  borderWidth: 1,
  borderColor: G.line,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontFamily: IL_FONTS.regular,
  fontSize: 15,
  color: G.ink,
  backgroundColor: '#FFFFFF',
};

function when(ts) {
  const d = ts?.toDate?.();
  if (!d) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function StatusPill({ status }) {
  const resolved = status === 'resolved';
  return (
    <View
      style={{
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: resolved ? '#E8F6EE' : status === 'assigned' ? '#E3ECEE' : G.pink,
      }}
    >
      <ILText role="label" color={resolved ? GREEN : status === 'assigned' ? G.dark : G.cta} style={{ fontSize: 11 }}>
        {ticketStatusLabel(status)}
      </ILText>
    </View>
  );
}

function NewTicket({ initial, onSent, onCancel }) {
  const { profile, user } = useAuth();
  const [category, setCategory] = useState(initial?.category || 'course');
  const [subject, setSubject] = useState(initial?.subject || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ready = subject.trim().length > 2 && message.trim().length > 2 && !busy;

  const send = async () => {
    if (!ready || !user?.uid) return;
    setBusy(true);
    setError('');
    try {
      const lep = profile?.programAccess?.lep || {};
      await createTicket({
        uid: user.uid,
        email: profile?.email || user.email || '',
        name: lepFullName(profile),
        phone: profile?.phoneNumber || profile?.phone || user.phoneNumber || '',
        batch: lep.zohoRawBatch || lep.day1Date || '',
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      onSent();
    } catch {
      setError('Could not send your ticket. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <WhiteCard style={{ marginTop: 16, borderRadius: 22, padding: 18 }}>
      <ILText role="title" color={G.ink} style={{ fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
        Raise a ticket
      </ILText>
      <ILText role="bodySm" color={G.body} style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>
        Your CEM and the Iron Lady team reply here. You will see their answer under My tickets.
      </ILText>

      <ILText role="label" color={G.ink} style={{ marginTop: 16, fontSize: 14 }}>
        What is it about?
      </ILText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        {TICKET_CATEGORIES.map((c) => {
          const on = c.value === category;
          return (
            <Pressable
              key={c.value}
              onPress={() => setCategory(c.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={{
                marginTop: 8,
                marginRight: 8,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: on ? G.dark : G.line,
                backgroundColor: on ? G.dark : '#FFFFFF',
              }}
            >
              <ILText role="label" color={on ? '#FFFFFF' : G.ink} style={{ fontSize: 13 }}>
                {c.label}
              </ILText>
            </Pressable>
          );
        })}
      </View>

      <ILText role="label" color={G.ink} style={{ marginTop: 16, fontSize: 14 }}>
        Subject
      </ILText>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="In a few words"
        placeholderTextColor="#B8B4A8"
        style={inputStyle}
        maxLength={120}
      />
      <ILText role="label" color={G.ink} style={{ marginTop: 16, fontSize: 14 }}>
        Tell us more
      </ILText>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="What happened, and what you need"
        placeholderTextColor="#B8B4A8"
        multiline
        style={[inputStyle, { minHeight: 110, textAlignVertical: 'top' }]}
        maxLength={2000}
      />
      {error ? (
        <ILText role="bodySm" color={G.cta} style={{ marginTop: 10, fontSize: 13 }}>
          {error}
        </ILText>
      ) : null}
      <View style={{ marginTop: 16, opacity: ready ? 1 : 0.45 }}>
        <RedCta label={busy ? 'Sending…' : 'Send ticket'} icon="send" onPress={ready ? send : undefined} />
      </View>
      {onCancel ? (
        <Pressable onPress={onCancel} hitSlop={8} style={{ marginTop: 12, alignSelf: 'center' }}>
          <ILText role="label" color={G.meta} style={{ fontSize: 13 }}>
            Cancel
          </ILText>
        </Pressable>
      ) : null}
    </WhiteCard>
  );
}

function Thread({ ticket, onBack }) {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    getTicketMessages(ticket.id)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [ticket.id]);
  useEffect(load, [load]);

  const send = async () => {
    const text = reply.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await addTicketMessage(ticket.id, { senderId: user.uid, senderName: lepFullName(profile), text });
      setReply('');
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: 16 }}>
      <Pressable onPress={onBack} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
        <MaterialIcons name="chevron-left" size={20} color={G.ink} />
        <ILText role="label" color={G.ink} style={{ fontSize: 13 }}>
          My tickets
        </ILText>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
        <ILText role="title" color={G.ink} style={{ flex: 1, fontFamily: IL_FONTS.display, fontSize: 22, lineHeight: 28 }}>
          {ticket.subject}
        </ILText>
        <StatusPill status={ticket.status} />
      </View>
      {messages === null ? (
        <ActivityIndicator color={G.cta} style={{ marginTop: 24 }} />
      ) : (
        messages.map((m) => {
          const mine = m.senderRole === 'user';
          return (
            <View
              key={m.id}
              style={{
                marginTop: 12,
                maxWidth: '88%',
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? G.dark : '#FFFFFF',
                borderRadius: 16,
                borderBottomRightRadius: mine ? 4 : 16,
                borderBottomLeftRadius: mine ? 16 : 4,
                padding: 12,
              }}
            >
              {!mine ? (
                <ILText role="label" color={G.cta} style={{ fontSize: 12, marginBottom: 4 }}>
                  {m.senderName || 'Iron Lady team'}
                </ILText>
              ) : null}
              <ILText role="body" color={mine ? '#FFFFFF' : G.ink} style={{ fontSize: 14, lineHeight: 20 }}>
                {m.text}
              </ILText>
              <ILText
                role="bodySm"
                color={mine ? 'rgba(255,255,255,0.6)' : G.meta}
                style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}
              >
                {when(m.createdAt)}
              </ILText>
            </View>
          );
        })
      )}
      {ticket.status === 'resolved' ? (
        <ILText role="bodySm" color={GREEN} style={{ marginTop: 18, fontSize: 13, textAlign: 'center' }}>
          This ticket is resolved. Raise a new one if you need more help.
        </ILText>
      ) : (
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-end' }}>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Write a reply"
            placeholderTextColor="#B8B4A8"
            multiline
            style={[inputStyle, { flex: 1, marginTop: 0, maxHeight: 120 }]}
          />
          <Pressable
            onPress={send}
            disabled={!reply.trim() || busy}
            accessibilityRole="button"
            accessibilityLabel="Send reply"
            style={{
              marginLeft: 8,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: reply.trim() ? G.cta : G.line,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

/** Support tickets: raise one, see her tickets and the team's replies (answered in the LMS). */
export default function SupportTicketsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const prefill = route?.params || null;
  const [mode, setMode] = useState(prefill?.subject || prefill?.compose ? 'new' : 'list');
  const [tickets, setTickets] = useState(null);
  const [open, setOpen] = useState(null);
  const [sent, setSent] = useState(false);

  const load = useCallback(() => {
    if (!user?.uid || user.uid === 'preview') {
      setTickets([]);
      return;
    }
    getMyTickets(user.uid)
      .then(setTickets)
      .catch(() => setTickets([]));
  }, [user?.uid]);
  useEffect(load, [load]);

  return (
    <Page>
      <StatusBar style="dark" />
      <GuestBackBar title="Tickets" sub="Help from your CEM" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 16) }}
        >
          {open ? (
            <Thread ticket={open} onBack={() => setOpen(null)} />
          ) : mode === 'new' ? (
            <NewTicket
              initial={prefill}
              onCancel={() => setMode('list')}
              onSent={() => {
                setSent(true);
                setMode('list');
                load();
              }}
            />
          ) : (
            <>
              {sent ? (
                <WhiteCard style={{ marginTop: 16, borderRadius: 18, padding: 14, backgroundColor: '#E8F6EE' }}>
                  <ILText role="label" color={GREEN} style={{ fontSize: 14 }}>
                    Ticket sent. The team will reply here.
                  </ILText>
                </WhiteCard>
              ) : null}
              <View style={{ marginTop: 16 }}>
                <RedCta label="Raise a ticket" icon="add" onPress={() => setMode('new')} />
              </View>
              <ILText role="label" color={G.ink} style={{ marginTop: 24, fontSize: 15 }}>
                My tickets
              </ILText>
              {tickets === null ? (
                <ActivityIndicator color={G.cta} style={{ marginTop: 20 }} />
              ) : !tickets.length ? (
                <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 14, lineHeight: 20 }}>
                  No tickets yet. When you raise one, its replies show here.
                </ILText>
              ) : (
                tickets.map((t) => (
                  <Pressable key={t.id} onPress={() => setOpen(t)} accessibilityRole="button">
                    <WhiteCard style={{ marginTop: 10, borderRadius: 18, padding: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ILText role="label" color={G.ink} style={{ flex: 1, fontSize: 15 }} numberOfLines={2}>
                          {t.subject}
                        </ILText>
                        <StatusPill status={t.status} />
                      </View>
                      <ILText role="bodySm" color={G.meta} style={{ marginTop: 6, fontSize: 12 }}>
                        {`${TICKET_CATEGORIES.find((c) => c.value === t.category)?.label || 'Ticket'} · ${when(t.updatedAt || t.createdAt)}`}
                      </ILText>
                    </WhiteCard>
                  </Pressable>
                ))
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}
