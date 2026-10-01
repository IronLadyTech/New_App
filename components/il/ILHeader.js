import React from 'react';
import GlassHeader from './GlassHeader';

export default function ILHeader({
  onSearch,
  onNotifications,
  onProfile,
  photoUrl,
  insetTop = true,
  floating = false,
}) {
  return (
    <GlassHeader
      onSearch={onSearch}
      onNotifications={onNotifications}
      onProfile={onProfile}
      photo={photoUrl ? { uri: photoUrl } : null}
      insetTop={insetTop}
      floating={floating}
    />
  );
}
