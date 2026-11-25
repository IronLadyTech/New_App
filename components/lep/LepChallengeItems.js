import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Pressable from '../il/Press';
import ILText from '../il/ILText';
import { G } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { CHALLENGE_DAYS, isChallengeDayDone } from '../../utils/lepChallenges';

const RED = '#E52A2A';

/** Seven dots: done days filled, today ringed. */
export function ChallengeDots({ challenge, state, log }) {
  const byDay = log?.days?.[challenge.key] || {};
  return (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      {state.days.map((iso, i) => {
        const done = isChallengeDayDone(challenge, byDay[iso]);
        const isToday = iso === state.today;
        return (
          <View
            key={iso}
            accessibilityLabel={`Day ${i + 1} ${done ? 'done' : 'not done'}`}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              marginRight: 6,
              backgroundColor: done ? G.dark : 'transparent',
              borderWidth: isToday && !done ? 2 : 1.5,
              borderColor: isToday ? RED : G.line,
            }}
          />
        );
      })}
    </View>
  );
}

function Check({ on }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: on ? 0 : 1.5,
        borderColor: G.line,
        backgroundColor: on ? G.dark : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {on ? <MaterialIcons name="check" size={15} color="#FFFFFF" /> : null}
    </View>
  );
}

function SmallBtn({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={{
        marginTop: 8,
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: disabled ? G.line : RED,
      }}
    >
      <ILText role="label" color="#FFFFFF" style={{ fontSize: 13 }}>
        {label}
      </ILText>
    </Pressable>
  );
}

const inputStyle = {
  marginTop: 8,
  borderWidth: 1,
  borderColor: G.line,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 9,
  fontFamily: IL_FONTS.regular,
  fontSize: 14,
  color: G.ink,
  backgroundColor: '#FFFFFF',
};

/**
 * One challenge item: a tick, a line of text, or a link (optional) + Mark done.
 * `value` is what is saved (true / text / link); onSave(value) stores it.
 */
export function ChallengeItem({ item, value, onSave, onOpen }) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const done = Boolean(value);
  const savedText = typeof value === 'string' ? value : '';

  if (item.kind === 'tick') {
    return (
      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => onSave(!done)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            accessibilityLabel={item.label}
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          >
            <Check on={done} />
            <ILText role="body" color={G.ink} style={{ marginLeft: 10, fontSize: 14, flex: 1 }}>
              {item.label}
            </ILText>
          </Pressable>
          {onOpen ? (
            <Pressable onPress={onOpen} accessibilityRole="button" hitSlop={8}>
              <ILText role="label" color={RED} style={{ fontSize: 13 }}>
                Open table ›
              </ILText>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  if (done && !editing) {
    return (
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'flex-start' }}>
        <Check on />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <ILText role="body" color={G.ink} style={{ fontSize: 14 }}>
            {item.label}
          </ILText>
          {savedText ? (
            <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 13, lineHeight: 18 }} numberOfLines={3}>
              {savedText}
            </ILText>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            setDraft(savedText);
            setEditing(true);
          }}
          accessibilityRole="button"
          hitSlop={8}
        >
          <ILText role="label" color={G.meta} style={{ fontSize: 12 }}>
            Edit
          </ILText>
        </Pressable>
      </View>
    );
  }

  const isLink = item.kind === 'link';
  const text = draft.trim();
  return (
    <View style={{ marginTop: 12 }}>
      <ILText role="body" color={G.ink} style={{ fontSize: 14 }}>
        {item.label}
      </ILText>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={item.placeholder}
        placeholderTextColor="#B8B4A8"
        autoCapitalize={isLink ? 'none' : 'sentences'}
        keyboardType={isLink ? 'url' : 'default'}
        multiline={!isLink}
        style={inputStyle}
      />
      <SmallBtn
        label={isLink ? 'Mark done' : 'Save'}
        disabled={!isLink && !text}
        onPress={() => {
          onSave(text || true);
          setEditing(false);
        }}
      />
    </View>
  );
}

export function challengeDayLabel(state) {
  if (state.phase === 'soon') return 'Starts tomorrow';
  if (state.phase === 'daily') return `Day ${state.dayN} of ${CHALLENGE_DAYS}`;
  return 'Week done';
}
