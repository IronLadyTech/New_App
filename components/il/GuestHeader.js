import React from 'react';
import GlassHeader from './GlassHeader';

export default function GuestHeader({ floating = false }) {
  return (
    <GlassHeader
      onSearch={() => {}}
      showProfile={false}
      floating={floating}
    />
  );
}
