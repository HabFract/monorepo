import { atom } from 'jotai';

export enum SortCriteria {
  Name = 'name',
  AtomicOrbits = 'atomicOrbits',
  SubatomicOrbits = 'subatomicOrbits',
  AstronomicOrbits = 'astronomicOrbits',
}

export enum SortOrder {
  GreatestToLowest = 'greatestToLowest',
  LowestToGreatest = 'lowestToGreatest',
}

export interface SortFilterState {
  sortCriteria: SortCriteria;
  sortOrder: SortOrder;
}

export const listSortFilterAtom = atom<SortFilterState>({
  sortCriteria: SortCriteria.Name,
  sortOrder: SortOrder.GreatestToLowest,
});