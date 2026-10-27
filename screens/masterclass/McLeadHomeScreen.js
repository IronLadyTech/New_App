import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pressable from '../../components/il/Press';
import ILHeader from '../../components/il/ILHeader';
import ILText from '../../components/il/ILText';
import { IL_BRAND, IL_FONTS, IL_SPACE } from '../../constants/ironLadyBrand';
import { MC_RECORDINGS } from '../../constants/masterclassRecordings';
import { GUEST_KINDS } from '../../constants/cms';
import { useGuestCms } from '../../hooks/useGuestCms';
import { useAuth } from '../../context/AuthContext';
import { lepFirstName } from '../../utils/lepState';
import { navigateWatch } from '../../utils/watchNav';
import { useNavigation } from '@react-navigation/native';

export default function McLeadHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile } = useAuth();
  // Same list CX edits in CMS → Guest app; the built-in two until they add theirs.
  const recordings = useGuestCms(GUEST_KINDS.MC_RECORDING, MC_RECORDINGS);
  const name = lepFirstName(profile);
  const status = profile?.leadStatus || profile?.programAccess?.mc?.leadStatus || 'MC';

  const openRecording = (item) => {
    navigateWatch(navigation, {
      title: item.title,
      sub: `Masterclass · ${item.duration}`,
      videoUrl: item.videoUrl || item.url,
      assetKey: item.id,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: IL_BRAND.cream }}>
      <StatusBar style="dark" />
      <ILHeader photoUrl={profile?.photoURL} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: IL_SPACE.page,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24) + 32,
        }}
      >
        <ILText role="eyebrow" color={IL_BRAND.red}>
          {String(status).toUpperCase()}
        </ILText>
        <ILText role="displaySm" style={{ marginTop: 8 }}>
          Welcome{name !== 'there' ? `, ${name}` : ''}.
        </ILText>
        <ILText role="body" color={IL_BRAND.muted} style={{ marginTop: 10 }}>
          Your two masterclass evenings are ready. Watch in order when you can — your progress stays on this number.
        </ILText>

        <View style={{ marginTop: 24, backgroundColor: IL_BRAND.forest, borderRadius: 24, padding: 20 }}>
          <ILText role="eyebrow" color={IL_BRAND.redSoft} style={{ fontSize: 10 }}>
            Your recordings
          </ILText>
          {recordings.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => openRecording(item)}
              style={{
                marginTop: index === 0 ? 14 : 10,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: IL_BRAND.red,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <ILText role="label" color="#FFFFFF">
                  {item.title}
                </ILText>
                <ILText role="bodySm" color="rgba(255,255,255,0.72)" style={{ marginTop: 4 }}>
                  {item.duration || item.body}
                </ILText>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
            </Pressable>
          ))}
        </View>

        <ILText role="bodySm" color={IL_BRAND.muted} style={{ marginTop: 20, lineHeight: 20 }}>
          When you enroll in LEP or 100BM, your full program home will unlock here automatically after the next sync.
        </ILText>
      </ScrollView>
    </View>
  );
}
