import { useState, useCallback } from 'react';

/**
 * A custom hook to handle pull-to-refresh logic.
 * @param onRefreshAction - A promise-returning function that fetches new data.
 * @returns { refreshing, onRefresh } properties to be used in a RefreshControl component.
 */
export function usePullToRefresh(onRefreshAction: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshAction();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshAction]);

  return { refreshing, onRefresh };
}
