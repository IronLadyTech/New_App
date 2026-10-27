import { useEffect, useState } from 'react';
import { fetchGuestItems } from '../services/guestContent';

const cache = {};
const TTL_MS = 5 * 60 * 1000;

/**
 * Published CMS rows of one guest kind, or `fallback` until they load — and whenever the
 * CMS has none or cannot be reached, so the guest app never goes blank.
 */
export function useGuestCms(kind, fallback) {
  const hit = cache[kind];
  const [items, setItems] = useState(hit?.items?.length ? hit.items : null);

  useEffect(() => {
    let alive = true;
    if (hit && Date.now() - hit.at < TTL_MS) return undefined;
    fetchGuestItems(kind)
      .then((rows) => {
        cache[kind] = { at: Date.now(), items: rows };
        if (alive) setItems(rows.length ? rows : null);
      })
      .catch(() => {
        if (alive) setItems(null);
      });
    return () => {
      alive = false;
    };
  }, [kind]);

  return items || fallback;
}
