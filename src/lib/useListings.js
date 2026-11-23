import { useEffect, useState } from 'react';
import { api } from './api.js';

/**
 * Fetches the public listing search and re-runs when `params` change.
 * Aborts the in-flight request so a fast filter change cannot land out of order.
 */
export function useListings(params = {}) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ listings: [], loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));

    api
      .listings(JSON.parse(key), controller.signal)
      .then((listings) => setState({ listings, loading: false, error: null }))
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState({ listings: [], loading: false, error: error.message });
      });

    return () => controller.abort();
  }, [key]);

  return state;
}
