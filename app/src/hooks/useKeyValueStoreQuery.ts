import { Atom, useAtom } from 'jotai'
import store from '../state/jotaiKeyValueStore'
import { useEffect, useState } from 'react';

export default function useCachedGraphQLQuery(useGeneratedQueryHook, queryOptions) {
  const [db, setDb] = useAtom(store.entries as Atom<any>);
  const { data, error, loading } = useGeneratedQueryHook(queryOptions);
  const cacheKey = JSON.stringify({ query: queryOptions.query, variables: queryOptions.variables });

  // State to hold either cached or fetched data
  const [cachedData, setCachedData] = useState(() => db[cacheKey] || null);

  useEffect(() => {
    if (data) {
      console.log('data :>> ', cacheKey, data);
      // Update cache with new data
      (setDb as any)((prevDb) => ({
        ...prevDb,
        [cacheKey]: data,
      }));
      setCachedData(data);
    } else if (db[cacheKey]) {
      // Use cached data if available and no new data fetched
      setCachedData(db[cacheKey]);
    }
  }, [data, db, cacheKey, setDb]);

  return { data: cachedData, error, loading };
}