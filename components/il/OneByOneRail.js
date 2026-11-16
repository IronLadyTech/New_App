import React, { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { G } from '../../constants/guestTheme';

/**
 * A row of videos shown one at a time: each card fills the width, one swipe moves exactly one
 * card, and dots show where she is. Used for every video row (C-suite Speaks, board
 * talks, podcasts, community videos, continue watching…), so they all behave the same.
 *
 * renderItem(item, { width, index }) must size its card to `width`.
 * `inset` is the page's side padding; the row bleeds to the screen edges and centres each card.
 */
export default function OneByOneRail({ items, renderItem, keyOf, inset = 20, gap = 12, style, dots = true }) {
  const { width: screen } = useWindowDimensions();
  const width = Math.min(screen - inset * 2, 560);
  const snap = width + gap;
  const side = (screen - width) / 2;
  const [index, setIndex] = useState(0);
  const list = items || [];
  if (!list.length) return null;
  return (
    <View style={[{ marginHorizontal: -inset }, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={32}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / snap);
          if (i !== index) setIndex(Math.max(0, Math.min(list.length - 1, i)));
        }}
        contentContainerStyle={{ paddingHorizontal: side - gap / 2 }}
      >
        {list.map((item, i) => (
          <View key={keyOf ? keyOf(item, i) : i} style={{ width, marginHorizontal: gap / 2 }}>
            {renderItem(item, { width, index: i })}
          </View>
        ))}
      </ScrollView>
      {dots && list.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
          {list.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                marginHorizontal: 3,
                backgroundColor: i === index ? G.cta : 'rgba(17,43,50,0.18)',
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
