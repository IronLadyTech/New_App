import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';

function AuthenticatedBranch() {
  const AuthenticatedApp = require('./AuthenticatedApp').default;
  return <AuthenticatedApp />;
}

function GuestBranch() {
  const GuestNavigator = require('./GuestNavigator').default;
  return <GuestNavigator />;
}

export default function AppNavigator() {
  const { isAuthenticated, isGuest } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AuthenticatedBranch />
      ) : isGuest ? (
        <GuestBranch />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
