import { useMemo, useState } from 'react';
import { Orbit } from '../graphql/generated';

type SortableKeys = keyof Pick<Orbit, 'name' | 'scale'>;

/**
 * Props for initializing the useSearchableList hook
 * @template T - The type of items in the list (must extend Orbit)
 */
interface UseSearchableListProps<T> {
  /** Array of items to be searched and sorted */
  items: T[];
  /** Array of keys from T to search within */
  searchKeys: (keyof T)[];
  /** Initial key to sort by */
  initialSortKey?: SortableKeys;
}

/**
 * Return type for the useSearchableList hook
 * @template T - The type of items in the list
 */
interface UseSearchableListReturn<T> {
  /** Filtered and sorted items based on current search and sort state */
  filteredItems: T[];
  /** Current search term */
  searchTerm: string;
  /** Function to update search term */
  setSearchTerm: (term: string) => void;
  /** Current key being sorted by */
  sortKey: SortableKeys | null;
  /** Function to update sort key */
  setSortKey: (key: SortableKeys) => void;
  /** Current sort direction */
  sortOrder: 'asc' | 'desc';
  /** Function to toggle sort direction */
  toggleSortOrder: () => void;
}

/**
 * A custom hook that provides search and sort functionality for a list of items
 * 
 * @template T - The type of items in the list (must extend Orbit)
 * @param {UseSearchableListProps<T>} props - Configuration options for the hook
 * @returns {UseSearchableListReturn<T>} Object containing filtered items and control functions
 * 
 * @example
 * ```tsx
 * const {
 *   filteredItems,
 *   searchTerm,
 *   setSearchTerm,
 *   sortKey,
 *   setSortKey,
 *   sortOrder,
 *   toggleSortOrder
 * } = useSearchableList({
 *   items: orbits,
 *   searchKeys: ['name', 'scale'],
 *   initialSortKey: 'name'
 * });
 * ```
 */
export function useSearchableList<T extends Orbit>({
  items,
  searchKeys,
  initialSortKey
}: UseSearchableListProps<T>): UseSearchableListReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortableKeys | null>(initialSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        searchKeys.some(key =>
          String(item[key])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [items, searchTerm, searchKeys, sortKey, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return {
    filteredItems,
    searchTerm,
    setSearchTerm,
    sortKey,
    setSortKey,
    sortOrder,
    toggleSortOrder
  };
}