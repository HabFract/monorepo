import { atom } from 'jotai';
import { DateTime } from 'luxon';
import { currentSphereOrbitNodes } from './orbit';
import { currentOrbitId } from './orbit';
import { SphereOrbitNodes } from './jotaiKeyValueStore';

// Create an atom to hold the current Julian day
export const currentDayAtom = atom(DateTime.local());