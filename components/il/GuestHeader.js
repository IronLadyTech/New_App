import React from 'react';
import GlassHeader from './GlassHeader';

export default function GuestHeader({ floating = false }) {
  return (
    <GlassHeader
      showCalendar={false}
      showProfile={false}
      floating={floating}
    />
  );
}
