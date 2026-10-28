import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import IronLadyAnimatedSplash from '../components/il/IronLadyAnimatedSplash';
import { devToolsEnabled } from '../utils/devToolsEnabled';

const noop = () => {};

const DevLaunchSplashPreviewContext = createContext({
  showLaunchSplash: noop,
});

export function useDevLaunchSplashPreview() {
  return useContext(DevLaunchSplashPreviewContext);
}

/** Dev only: replay the red launch animation without killing the app or rebuilding an APK. */
export function DevLaunchSplashPreviewProvider({ children }) {
  const [open, setOpen] = useState(false);
  const showLaunchSplash = useCallback(() => {
    if (devToolsEnabled()) setOpen(true);
  }, []);
  const onFinish = useCallback(() => setOpen(false), []);

  return (
    <DevLaunchSplashPreviewContext.Provider value={{ showLaunchSplash }}>
      {children}
      {devToolsEnabled() ? (
        <Modal visible={open} animationType="none" statusBarTranslucent onRequestClose={onFinish}>
          <View style={styles.fill}>
            <IronLadyAnimatedSplash onFinish={onFinish} />
          </View>
        </Modal>
      ) : null}
    </DevLaunchSplashPreviewContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
