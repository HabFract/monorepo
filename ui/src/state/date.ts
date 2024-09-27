import { atom } from "jotai";
import { DateTime } from "luxon";

// Create an atom to hold the current Julian day
export const currentDayAtom = atom(DateTime.local());
