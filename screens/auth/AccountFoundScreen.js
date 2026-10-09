import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IL_BRAND, IL_SPACE } from '../../constants/ironLadyBrand';
import { ilShadow } from '../../components/il/ilShadow';
import ILHeader from '../../components/il/ILHeader';
import ILText from '../../components/il/ILText';
import ILButton from '../../components/il/ILButton';

export default function AccountFoundScreen({ navigation, route, onDone: onDoneProp, onBack }) {
  const programs = route?.params?.programs || [
    {
      id: 'lep',
      title: 'Leadership Essentials program (LEP)',
      status: 'Enrolled · opens first',
      meta: 'Batch 42 · Day 1 on Saturday 20 September, 9:00 AM IST',
      primary: true,
    },
    {
      id: '100bm',
      title: '100 Board Members (100BM)',
      status: 'Registered',
      meta: 'Part payment received · batch details open soon',
      primary: false,
    },
  ];
  const phone = route?.params?.phone || '';
  const primary = programs.find((p) => p.primary) || programs[0];
  const onDone = onDoneProp || route?.params?.onDone;

  const finish = (programId) => {
    if (typeof onDone === 'function') onDone(programId || primary?.id);
    else if (navigation?.canGoBack?.()) navigation.goBack();
  };

  const goBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: IL_BRAND.cream }}>
      <StatusBar style="dark" />
      <ILHeader
        onProfile={() => navigation.navigate('Profile')}
        onSearch={() => {}}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: IL_SPACE.page,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
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
              marginTop: 4,
            }}
          >
            <MaterialIcons name="chevron-left" size={22} color={IL_BRAND.ink} />
          </Pressable>
          <ILText role="eyebrow" color={IL_BRAND.red} style={{ marginTop: 8 }}>
            Number verified{phone ? ` · ${phone}` : ''}
          </ILText>
          <ILText role="displaySm" style={{ marginTop: 10 }}>
            We found you.
          </ILText>
          <ILText role="body" color={IL_BRAND.muted} style={{ marginTop: 8 }}>
            Here’s everything linked to this number. We’ll open the one that needs you first.
          </ILText>

          <View style={{ marginTop: 22, gap: 12 }}>
            {programs.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => finish(p.id)}
                style={[
                  {
                    backgroundColor: p.primary ? IL_BRAND.forest : IL_BRAND.white,
                    borderRadius: 22,
                    padding: 18,
                  },
                  !p.primary ? ilShadow(1) : null,
                ]}
              >
                <ILText
                  role="eyebrow"
                  color={p.primary ? IL_BRAND.redSoft : IL_BRAND.red}
                >
                  {p.status}
                </ILText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <ILText
                    role="title"
                    color={p.primary ? IL_BRAND.white : IL_BRAND.ink}
                    style={{ flex: 1, fontSize: 20 }}
                  >
                    {p.title}
                  </ILText>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={p.primary ? IL_BRAND.white : IL_BRAND.muted}
                  />
                </View>
                <ILText
                  role="bodySm"
                  color={p.primary ? IL_BRAND.mutedOnDark : IL_BRAND.muted}
                  style={{ marginTop: 6 }}
                >
                  {p.meta}
                </ILText>
              </Pressable>
            ))}
          </View>

          <ILButton
            label={primary?.meta ? `Go to my ${primary.meta} home` : 'Go to my home'}
            onPress={() => finish(primary?.id)}
            style={{ marginTop: 22 }}
          />
          <ILText
            role="bodySm"
            color={IL_BRAND.muted}
            align="center"
            style={{ marginTop: 14 }}
          >
            Switch programs any time from Home
          </ILText>

          <Pressable
            onPress={() => finish()}
            style={{
              marginTop: 18,
              backgroundColor: IL_BRAND.white,
              borderRadius: 20,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <MaterialIcons name="support-agent" size={22} color={IL_BRAND.forest} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ILText role="label">Something missing or not yours?</ILText>
              <ILText role="bodySm" color={IL_BRAND.muted}>
                Our team will fix it — we’ll call you back within a day
              </ILText>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={IL_BRAND.muted} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
