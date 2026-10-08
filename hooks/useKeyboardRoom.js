import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Keeps a form above the Android keyboard.
 *
 * Android 15+ draws apps edge-to-edge and no longer shrinks the window for the
 * keyboard, so it covers the field you are typing in. Older phones still shrink
 * the window. We measure how much the scroll view actually shrank and add only
 * the missing room, then scroll to the bottom so the field is visible.
 *
 * Usage: spread `scrollProps` on the ScrollView and add `extra` to its paddingBottom.
 */
export function useKeyboardRoom() {
  const scrollRef = useRef(null);
  const [kb, setKb] = useState(0);
  const [baseH, setBaseH] = useState(0);
  const [curH, setCurH] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKb(e?.endCoordinates?.height || 0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKb(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const shrunk = kb && baseH && curH ? Math.max(0, baseH - curH) : 0;
  const extra = kb ? Math.max(0, kb - shrunk) : 0;

  const onLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    setCurH(h);
    if (!kb) setBaseH(h);
  };

  return { extra, scrollProps: { ref: scrollRef, onLayout } };
}
