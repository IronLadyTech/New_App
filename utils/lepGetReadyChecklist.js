import { GET_READY } from '../screens/lep/lepData';

function readChecked(saved) {
  if (!saved || typeof saved !== 'object') return {};
  return saved;
}

/** Merge AsyncStorage checklist with defaults; supports legacy saves keyed by title. */
export function mergeGetReadyItems(savedChecked) {
  const checked = readChecked(savedChecked);
  return GET_READY.map((item) => {
    const byId = checked[item.id];
    const byTitle = checked[item.title];
    const done = byId != null ? !!byId : byTitle != null ? !!byTitle : !!item.done;
    return { ...item, done };
  });
}

export function toggleGetReadyItem(items, toggled) {
  const checked = Object.fromEntries(items.map((item) => [item.id, item.id === toggled.id ? !item.done : item.done]));
  const nextItems = mergeGetReadyItems(checked);
  const allDone = nextItems.length > 0 && nextItems.every((i) => i.done);
  return { checked, nextItems, allDone };
}
