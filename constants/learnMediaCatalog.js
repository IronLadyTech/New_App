import { CSUITE_ASSET_KEYS, PODCAST_ASSET_KEYS } from './lessonAssets';

function labelFromKey(assetKey) {
  const name = String(assetKey).split(':')[1] || assetKey;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const LEARN_MEDIA_LIBRARIES = [
  { value: 'task', label: 'Journey task file' },
  { value: 'session', label: 'Session recording / link' },
  { value: 'podcast', label: 'Podcast (Learn)' },
  { value: 'csuite', label: 'C-Suite video (Learn)' },
];

export function podcastCatalog() {
  return PODCAST_ASSET_KEYS.map((assetKey) => ({
    assetKey,
    library: 'podcast',
    title: `IL Speaks — ${labelFromKey(assetKey)}`,
  }));
}

export function csuiteCatalog() {
  return CSUITE_ASSET_KEYS.map((assetKey) => ({
    assetKey,
    library: 'csuite',
    title: `C-Suite — ${labelFromKey(assetKey)}`,
  }));
}
