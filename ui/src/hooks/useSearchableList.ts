import { useMemo, useState } from 'react';

interface SearchableItem {
  id: string;
  [key: string]: any;
}

interface UseSearchableListProps<T extends SearchableItem> {
  items: T[];
  searchKeys: (keyof T)[];
  initialSortKey?: keyof T;
  sortOrder?: 'asc' | 'desc';
}

interface UseSearchableListReturn<T> {
  filteredItems: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortKey: keyof T | null;
  setSortKey: (key: keyof T) => void;
  sortOrder: 'asc' | 'desc';
  toggleSortOrder: () => void;
}

export function useSearchableList<T extends SearchableItem>({
  items,
  searchKeys,
  initialSortKey,
  sortOrder: initialSortOrder = 'asc'
}: UseSearchableListProps<T>): UseSearchableListReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filtering
    if (searchTerm) {
      result = result.filter(item =>
        searchKeys.some(key =>
          String(item[key])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sorting
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