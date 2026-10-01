import React from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILHeader from '../../components/il/ILHeader';
import ILText from '../../components/il/ILText';
import { useAuth } from '../../context/AuthContext';
import { BATCHES } from './ChooseBatchDateScreen';

const PAGE = '#F7F6E4';
const INK = '#113744';
const BODY = '#4A463D';
const META = '#5A574F';
const LINE = '#EAE8DC';
const CTA = '#ED1D24';
const PAID = '#1E7A4B';
const TRACK = '#F2D7D8';
const DARK = '#113744';

const androidFix = Platform.OS === 'android' ? { includeFontPadding: false } : null;

function MoneyRow({ label, detail, amount, status, paid }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
        <ILText role="label" color={INK} style={[androidFix, { fontSize: 13, lineHeight: 18 }]}>
          {label}
        </ILText>
        <ILText
          role="bodySm"
          color={META}
          style={[androidFix, { marginTop: 2, fontSize: 11, lineHeight: 15 }]}
        >
          {detail}
        </ILText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <ILText
          role="title"
          color={INK}
          style={{
            fontFamily: IL_FONTS.display,
            fontSize: 16,
            lineHeight: 21,
            letterSpacing: -0.2,
          }}
        >
          {amount}
        </ILText>
        <ILText
          role="eyebrow"
          color={paid ? PAID : CTA}
          style={[
            androidFix,
            {
              marginTop: 2,
              fontSize: 10,
              lineHeight: 14,
              letterSpacing: 1.2,
            },
          ]}
        >
          {status}
        </ILText>
      </View>
    </View>
  );
}

function BatchLine({ tag, title, note, last }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: last ? 8 : 0,
        marginTop: last ? 4 : 0,
        borderTopWidth: last ? 1 : 0,
        borderTopColor: 'rgba(255,255,255,0.10)',
      }}
    >
      <View
        style={{
          marginTop: last ? 6 : 2,
          marginRight: 12,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <ILText
          role="eyebrow"
          color="#FFFFFF"
          style={[androidFix, { fontSize: 10, lineHeight: 14, letterSpacing: 1.2 }]}
        >
          {tag}
        </ILText>
      </View>
      <View style={{ flex: 1, paddingTop: last ? 4 : 0 }}>
        <ILText
          role="label"
          color="#FFFFFF"
          style={[androidFix, { fontSize: 13.5, lineHeight: 18 }]}
        >
          {title}
        </ILText>
        <ILText
          role="bodySm"
          color="rgba(255,255,255,0.65)"
          style={[androidFix, { marginTop: 2, fontSize: 11.5, lineHeight: 16 }]}
        >
          {note}
        </ILText>
      </View>
    </View>
  );
}

export default function SeatHeldScreen({ navigation, route, onContinue }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const name =
    route?.params?.name ||
    profile?.displayName?.split(' ')[0] ||
    'Ananya';
  const batch =
    route?.params?.batch ||
    BATCHES.find((b) => b.id === route?.params?.batchId) ||
    BATCHES[0];

  const finish = () => {
    if (typeof onContinue === 'function') {
      onContinue();
      return;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <StatusBar style="dark" />
      <ILHeader
        photoUrl={profile?.photoURL}
        onSearch={() => {}}
        onNotifications={() => {}}
        onProfile={() => {}}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 28,
        }}
      >
        <View>
          <ILText
            role="eyebrow"
            color={CTA}
            style={[
              androidFix,
              { fontSize: 10, lineHeight: 13, letterSpacing: 1.6, marginBottom: 4 },
            ]}
          >
            Registered · part payment received
          </ILText>
          <ILText
            role="display"
            color={INK}
            style={{ fontSize: 27, lineHeight: 32, letterSpacing: -0.4 }}
          >
            {`Your seat is held, ${name}.`}
          </ILText>
          <ILText
            role="bodySm"
            color={BODY}
            style={{ marginTop: 6, fontSize: 13, lineHeight: 20 }}
          >
            It becomes confirmed once the balance is paid. Until then it can be released to someone
            on the waitlist.
          </ILText>
        </View>

        <View
          style={{
            marginTop: 24,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: LINE,
            padding: 20,
            shadowColor: '#0F1B3D',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 4,
            }}
          >
            <ILText
              role="eyebrow"
              color={META}
              style={[androidFix, { fontSize: 10, lineHeight: 13, letterSpacing: 1.6, flex: 1 }]}
            >
              Leadership Essentials Program
            </ILText>
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: 'rgba(237,29,36,0.10)',
              }}
            >
              <ILText
                role="eyebrow"
                color={CTA}
                style={[androidFix, { fontSize: 10, lineHeight: 13, letterSpacing: 1.2 }]}
              >
                Balance due
              </ILText>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: LINE, marginTop: 8 }}>
            <MoneyRow
              label="Registration fee"
              detail="Received · txn ending 4471"
              amount="₹2,999"
              status="Paid 12 Sep"
              paid
            />
            <View style={{ height: 1, backgroundColor: LINE }} />
            <MoneyRow
              label="Programme balance"
              detail="7 days from registration"
              amount="₹ XX,XXX"
              status="Due 19 Sep"
            />
          </View>

          <View
            style={{
              marginTop: 16,
              height: 6,
              borderRadius: 999,
              backgroundColor: TRACK,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: '22%',
                height: '100%',
                borderRadius: 999,
                backgroundColor: PAID,
              }}
            />
          </View>

          <Pressable
            onPress={() =>
              Alert.alert(
                'Pay balance',
                'Razorpay checkout will open here on the signed-in build.'
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Pay balance"
            style={({ pressed }) => ({
              marginTop: 16,
              width: '100%',
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: CTA,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.92 : 1,
              shadowColor: CTA,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.28,
              shadowRadius: 12,
              elevation: 4,
            })}
          >
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 14, lineHeight: 18 }}>
              Pay balance
            </ILText>
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert(
                'Talk to Iron Lady',
                'Someone from the team will call you about the amount.'
              )
            }
            style={{ marginTop: 10, alignItems: 'center' }}
          >
            <ILText
              role="bodySm"
              color={META}
              align="center"
              style={[androidFix, { fontSize: 11, lineHeight: 16 }]}
            >
              Questions about the amount?{' '}
              <ILText
                role="label"
                color={INK}
                style={[androidFix, { fontSize: 11, lineHeight: 16 }]}
              >
                Talk to someone at Iron Lady
              </ILText>
            </ILText>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 24,
            borderRadius: 20,
            backgroundColor: DARK,
            padding: 20,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 144,
              height: 144,
              borderRadius: 72,
              right: -40,
              top: -40,
              backgroundColor: 'rgba(237,29,36,0.25)',
            }}
          />
          <ILText
            role="eyebrow"
            color={CTA}
            style={[androidFix, { fontSize: 10, lineHeight: 13, letterSpacing: 1.6 }]}
          >
            Your batch
          </ILText>
          <View style={{ marginTop: 10, gap: 10 }}>
            <BatchLine
              tag="Day 1"
              title={batch.day1}
              note="Full day, live on Zoom"
            />
            <BatchLine
              tag="Day 2"
              title={batch.day2}
              note="Full day, live on Zoom"
            />
            <BatchLine
              tag="Then"
              title="Weekly sessions for four weeks"
              note="Tuesday evening and Saturday morning, ending with certification"
              last
            />
          </View>
          <Pressable
            onPress={() =>
              Alert.alert('Calendar', 'Dates will add to your calendar on the store build.')
            }
            style={({ pressed }) => ({
              marginTop: 12,
              width: '100%',
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.20)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <ILText role="label" color="#FFFFFF" style={{ fontSize: 13, lineHeight: 18 }}>
              Add all dates to calendar
            </ILText>
          </Pressable>
        </View>

        <Pressable
          onPress={finish}
          accessibilityRole="button"
          accessibilityLabel="Continue to my journey"
          style={({ pressed }) => ({
            marginTop: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ILText role="label" color={INK} style={{ fontSize: 13.5, lineHeight: 18 }}>
            Continue to my journey
          </ILText>
          <MaterialIcons
            name="arrow-forward"
            size={16}
            color={INK}
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}
