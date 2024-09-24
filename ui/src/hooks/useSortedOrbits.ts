import { useAtomValue } from 'jotai';
import { listSortFilterAtom } from '../state/ui';
import { Orbit } from '../graphql/generated';

export const useSortedOrbits = (orbits: Orbit[] | undefined): Orbit[] => {
  const listSortFilter = useAtomValue(listSortFilterAtom);
  const scaleValues = { Sub: 1, Atom: 2, Astro: 3 };

  const sortOrbits = (a: Orbit, b: Orbit) => {
    let propertyA;
    let propertyB;

    // If the sortCriteria is 'scale', use the scaleValues for comparison
    if (listSortFilter.sortCriteria === 'name') {
      propertyA = a ? a[listSortFilter.sortCriteria as keyof Orbit] : 0;
      propertyB = b ? b[listSortFilter.sortCriteria as keyof Orbit] : 0;
    } else {
      propertyA = a![listSortFilter.sortCriteria as any];
      propertyB = b![listSortFilter.sortCriteria as any];
      propertyA = scaleValues[propertyA] || 0; // Assign a default value if propertyA is undefined
      propertyB = scaleValues[propertyB] || 0; // Assign a default value if propertyB is undefined
    }

    if (listSortFilter.sortOrder === 'lowestToGreatest') {
      return propertyA < propertyB ? -1 : propertyA > propertyB ? 1 : 0;
    } else {
      return propertyA > propertyB ? -1 : propertyA < propertyB ? 1 : 0;
    }
  };

  return orbits ? orbits.sort(sortOrbits) : [];
};