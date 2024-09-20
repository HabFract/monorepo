// tests/integration/mocks/mockAppState.ts
import { AppState } from '../../../ui/src/state/store';
import { Frequency } from '../../../ui/src/state/types/orbit';
import { Scale } from '../../../ui/src/graphql/generated';

export const mockAppState: AppState = {
  spheres: {
    currentSphereHash: 'sphere1',
    spheres: {
      sphere1: {
        details: {
          entryHash: 'sphere1EntryHash',
          name: 'Health and Fitness',
          description: 'Focus on physical health, exercise, and nutrition.',
          hashtag: 'fitness',
          image: 'health.jpg',
        },
        hierarchies: {
          root1: {
            rootNode: 'orbit1',
            json: JSON.stringify({
              name: 'root',
              children: [
                { name: 'orbit1', children: [{ name: 'orbit2' }, { name: 'orbit3' }] },
                { name: 'orbit4' },
              ],
            }),
            bounds: { minBreadth: 0, maxBreadth: 2, minDepth: 0, maxDepth: 2 },
            indices: { x: 0, y: 0 },
            currentNode: 'orbit1',
            nodes: {
              orbit1: {
                id: 'orbit1',
                eH: 'orbit1EntryHash',
                name: 'Daily Exercise',
                scale: Scale.Atom,
                frequency: Frequency.DAILY_OR_MORE.DAILY,
                startTime: 1617235200,
                endTime: undefined,
              },
              orbit2: {
                id: 'orbit2',
                eH: 'orbit2EntryHash',
                name: 'Weekly Gym Session',
                scale: Scale.Atom,
                frequency: Frequency.LESS_THAN_DAILY.WEEKLY,
                startTime: 1617235200,
                endTime: undefined,
              },
              orbit3: {
                id: 'orbit3',
                eH: 'orbit3EntryHash',
                name: 'Meditation',
                scale: Scale.Atom,
                frequency: Frequency.DAILY_OR_MORE.DAILY,
                startTime: 1617235200,
                endTime: undefined,
              },
              orbit4: {
                id: 'orbit4',
                eH: 'orbit4EntryHash',
                name: 'Monthly Health Check',
                scale: Scale.Atom,
                frequency: Frequency.LESS_THAN_DAILY.MONTHLY,
                startTime: 1617235200,
                endTime: undefined,
              },
              orbit5: {
                id: 'orbit5',
                eH: 'orbit5EntryHash',
                name: 'Go for a walk',
                scale: Scale.Atom,
                frequency: Frequency.DAILY_OR_MORE.THREE,
                startTime: 1617235200,
                endTime: undefined,
              },
            },
          },
        },
      },
    },
  },
  orbits: {
    currentOrbitId: 'orbit1',
  },
  wins: {
    orbit1: {
      '2023-05-01': true,
      '2023-05-02': false,
      '2023-05-03': true,
    },
    orbit2: {
      '2023-W18': true,
      '2023-W19': false,
    },
    orbit3: {
      '2023-05-01': true,
      '2023-05-02': false,
      '2023-05-03': true,
    },
    orbit4: {
      '2023-05': true,
      '2023-06': false,
    },
    orbit5: {
      '2023-05-01': [true, false, true],
      '2023-05-02': [false, false, false],
      '2023-05-03': [true, true, true],
    },
  },
  listSortFilter: {
    sortCriteria: 'name',
    sortOrder: 'lowestToGreatest',
  },
  currentDay: '2023-05-03',
  subdivisionList: ['Health', 'Fitness', 'Nutrition'],
};

export default mockAppState;