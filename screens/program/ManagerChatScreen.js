import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pressable from '../../components/il/Press';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { GuestBackBar, Page } from '../guest/GuestBits';

const PROGRAM = { lep: 'LEP', '100bm': '100BM', mbw: 'MBW' };

const QUICK = ['Change my session date', 'Attendance query', 'About my seat or payment'];

// Demo threads live for the session so a reopened chat keeps its messages.
const threads = {};

function opening(programId) {
  const tag = PROGRAM[programId] || 'your program';
  return [
    {
      id: 'm0',
      from: 'pm',
      text: `Hi, I’m Kavya, your ${tag} Program Manager. Ask me about attendance, schedule changes or anything about your seat.`,
      at: '10:02 AM',
    },
  ];
}

function now() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function ManagerChatScreen() {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  const insets = useSafeAreaInsets();
  const programId = params.programId || 'mbw';
  const [messages, setMessages] = useState(() => threads[programId] || opening(programId));
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    threads[programId] = messages;
  }, [messages, programId]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (text) => {
    const body = text.trim();
    if (!body) return;
    setMessages((prev) => [...prev, { id: `u${prev.length}`, from: 'me', text: body, at: now() }]);
    setDraft('');
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `p${prev.length}`,
          from: 'pm',
          text: 'Thanks, noted. I’ll check and get back to you here within a few hours.',
          at: now(),
        },
      ]);
    }, 1400);
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title="Your Program Manager"
          sub={`${PROGRAM[programId] || ''} · usually replies in a few hours`}
          onBack={() => navigation.goBack()}
        />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}
        >
          {messages.map((m) => (
            <Bubble key={m.id} item={m} />
          ))}
          {typing ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12 }}>
              Kavya is typing…
            </ILText>
          ) : null}
          {messages.length === 1 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
              {QUICK.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => send(q)}
                  accessibilityRole="button"
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: G.cta,
                    backgroundColor: G.white,
                  }}
                >
                  <ILText role="label" color={G.cta} style={{ fontSize: 12 }}>
                    {q}
                  </ILText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 10) + 6,
            borderTopWidth: 1,
            borderTopColor: G.line,
            backgroundColor: G.page,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message"
            placeholderTextColor={G.meta}
            multiline
            style={{
              flex: 1,
              maxHeight: 120,
              minHeight: 44,
              backgroundColor: G.white,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: G.line,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 12,
              fontSize: 15,
              color: G.ink,
            }}
          />
          <Pressable
            onPress={() => send(draft)}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={{
              marginLeft: 10,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: draft.trim() ? G.cta : G.mutedFill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcons name="send" size={18} color={draft.trim() ? '#FFFFFF' : G.meta} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

function Bubble({ item }) {
  const mine = item.from === 'me';
  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginTop: 10 }}>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: mine ? G.dark : G.white,
          borderRadius: 18,
          borderBottomRightRadius: mine ? 6 : 18,
          borderBottomLeftRadius: mine ? 18 : 6,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <ILText role="body" color={mine ? '#FFFFFF' : G.ink} style={{ fontSize: 14, lineHeight: 20 }}>
          {item.text}
        </ILText>
      </View>
      <ILText role="bodySm" color={G.meta} style={[af, { marginTop: 4, fontSize: 10 }]}>
        {item.at}
      </ILText>
    </View>
  );
}
