import { atom } from 'jotai';

export enum SortCriteria {
  Name = 'name',
  Scale = 'scale',
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
  sortOrder: SortOrder.LowestToGreatest,
});