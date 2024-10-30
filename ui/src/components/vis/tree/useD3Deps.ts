import { useState, useEffect } from 'react';
import { loadD3Dependencies } from '../tree-helpers';

export const useD3Dependencies = () => {
  const [d3Modules, setD3Modules] = useState<{
    hierarchy: typeof import('d3-hierarchy').hierarchy;
    select: typeof import('d3-selection').select;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDeps = async () => {
      try {
        setIsLoading(true);
        const modules = await loadD3Dependencies();
        setD3Modules(modules);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDeps();
  }, []);

  return { d3Modules, isLoading, error };
};