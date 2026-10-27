import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ILText from '../il/ILText';
import Pressable from '../il/Press';
import { G, af } from '../../constants/guestTheme';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import { LEP_ALUMNI_GEO_CHAPTERS } from '../../constants/lepAlumniGeoChapters';
import { RedCta, WhiteCard } from '../../screens/lep/LepBits';

/**
 * One-time alumni geography chapter (Zoho `Chapters`).
 */
export default function LepAlumniChapterModal({ visible, onClose, onConfirm, saving }) {
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState('');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: G.page, paddingTop: Math.max(insets.top, 12) }}>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <MaterialIcons name="close" size={26} color={G.ink} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 24) + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <ILText role="eyebrow" color={G.cta} style={[af, { fontSize: 10 }]}>
            One-time · Alumni
          </ILText>
          <ILText
            role="title"
            color={G.ink}
            style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
          >
            Choose your chapter
          </ILText>
          <ILText role="body" color={G.meta} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
            Which Iron Lady chapter are you part of? We use this for alumni events and community — you only set it once.
          </ILText>

          <View style={{ marginTop: 20 }}>
            {LEP_ALUMNI_GEO_CHAPTERS.map((label) => {
              const active = picked === label;
              return (
                <Pressable key={label} onPress={() => setPicked(label)} style={{ marginBottom: 10 }}>
                  <WhiteCard
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: active ? 2 : 0,
                      borderColor: active ? G.cta : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: active ? G.cta : G.meta,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      {active ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: G.cta }} /> : null}
                    </View>
                    <ILText role="label" color={G.ink} style={{ flex: 1, fontSize: 15 }}>
                      {label === 'East Zone( Kolkata)' ? 'East Zone (Kolkata)' : label}
                    </ILText>
                  </WhiteCard>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 8 }}>
            {saving ? (
              <ActivityIndicator color={G.cta} style={{ marginVertical: 16 }} />
            ) : (
              <RedCta label="Save & open task →" onPress={() => picked && onConfirm?.(picked)} />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
