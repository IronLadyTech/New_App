import React from 'react';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../../services/firebase';
import { ensureFirebaseCompat } from '../../services/ensureFirebaseCompat';
import ErrorBoundary from '../ErrorBoundary';

function RecaptchaInner({ recaptchaRef }) {
  ensureFirebaseCompat();

  if (!firebaseConfig?.apiKey) return null;

  return (
    <FirebaseRecaptchaVerifierModal
      ref={recaptchaRef}
      firebaseConfig={firebaseConfig}
      attemptInvisibleVerification
    />
  );
}

export default function PhoneRecaptcha({ recaptchaRef }) {
  return (
    <ErrorBoundary>
      <RecaptchaInner recaptchaRef={recaptchaRef} />
    </ErrorBoundary>
  );
}
