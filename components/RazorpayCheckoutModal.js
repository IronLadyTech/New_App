import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, Platform, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';

function buildCheckoutHtml(checkout) {
  const payload = JSON.stringify(checkout);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body { margin: 0; background: #F4F1E8; font-family: -apple-system, sans-serif; }
    #loading { padding: 48px; text-align: center; color: #0C3535; }
  </style>
</head>
<body>
  <div id="loading">Opening secure payment…</div>
  <script>
    function post(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }
    try {
      var checkout = ${payload};
      var options = {
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency || 'INR',
        name: checkout.name || 'Iron Lady',
        description: checkout.description || 'Programme balance',
        prefill: checkout.prefill || {},
        theme: checkout.theme || { color: '#E8272A' },
        modal: {
          ondismiss: function () { post({ type: 'dismiss' }); }
        },
        handler: function (response) {
          post({
            type: 'success',
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });
        }
      };
      if (checkout.orderId) options.order_id = checkout.orderId;
      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        post({ type: 'error', message: resp.error && resp.error.description });
      });
      document.getElementById('loading').style.display = 'none';
      rzp.open();
    } catch (e) {
      post({ type: 'error', message: e.message || 'Checkout failed' });
    }
  </script>
</body>
</html>`;
}

/**
 * Native: Razorpay Checkout inside a WebView.
 * Web uses openRazorpayInBrowser instead — WebView is not reliable there.
 */
export default function RazorpayCheckoutModal({ visible, checkout, onSuccess, onDismiss, onError }) {
  const html = useMemo(
    () => (checkout ? buildCheckoutHtml(checkout) : null),
    [checkout]
  );

  if (Platform.OS === 'web' || !visible || !html) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onDismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1E8' }}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E8272A" />
            </View>
          )}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'success') onSuccess?.(data);
              else if (data.type === 'dismiss') onDismiss?.();
              else if (data.type === 'error') onError?.(new Error(data.message || 'Payment failed'));
            } catch {
              onError?.(new Error('Invalid payment response'));
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}
