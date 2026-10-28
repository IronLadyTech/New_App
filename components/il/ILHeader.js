import React from 'react';
import GlassHeader from './GlassHeader';

export default function ILHeader({
  onCalendar,
  onSearch,
  onNotifications,
  onProfile,
  photoUrl,
  insetTop = true,
  floating = false,
  showCalendar,
}) {
  return (
    <GlassHeader
      onCalendar={onCalendar}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onProfile={onProfile}
      photo={photoUrl ? { uri: photoUrl } : null}
      insetTop={insetTop}
      floating={floating}
      showCalendar={showCalendar}
    />
  );
}
