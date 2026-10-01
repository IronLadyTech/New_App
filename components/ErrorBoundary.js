import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { IL_BRAND } from '../constants/ironLadyBrand';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    const message = this.state.error?.message || String(this.state.error);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: IL_BRAND.cream,
          padding: 24,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: IL_BRAND.red, fontSize: 18, fontWeight: '700' }}>
          Something went wrong
        </Text>
        <Text style={{ color: IL_BRAND.muted, marginTop: 10, lineHeight: 20 }}>
          {message}
        </Text>
        <Pressable
          onPress={() => this.setState({ error: null })}
          style={{
            marginTop: 20,
            backgroundColor: IL_BRAND.red,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
