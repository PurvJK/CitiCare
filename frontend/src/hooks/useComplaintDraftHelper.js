import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useComplaintDraftHelper(title, description, category) {
  const { session } = useAuth();
  const debouncedTitle = useDebouncedValue(title, 500);
  const debouncedDescription = useDebouncedValue(description, 500);

  const shouldFetch = useMemo(() => {
    const totalLength = `${debouncedTitle} ${debouncedDescription}`.trim().length;
    return totalLength >= 20;
  }, [debouncedTitle, debouncedDescription]);

  return useQuery({
    queryKey: ['draft-helper', debouncedTitle, debouncedDescription, category],
    queryFn: async () => {
      const { data } = await api.post('/ai/draft-helper', {
        title: debouncedTitle,
        description: debouncedDescription,
        category,
      });
      return data;
    },
    enabled: !!session && shouldFetch,
    staleTime: 60 * 1000,
    retry: 0,
  });
}
