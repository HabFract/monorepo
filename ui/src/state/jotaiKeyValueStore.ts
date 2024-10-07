import { createStore } from "jotai";
import { MiniDb } from "jotai-minidb";

/**
 * IndexDB store used to quickly index and retrieve data related to a node in the hierarchy. 
 * Stored as a dictionary of SphereOrbitNodeDetails.
 *  I.e.
 *  Keyed by Sphere ActionHashB64, then by Orbit EntryHashB64, allowing easy retrieval by vis object callbacks
 * 
 *  E.g.```
 *  {
 *     [sphere1ActionHash]: {
 *          [orbit1EntryHash]: {
 *               ...
 *          }
 *     },
 *     [sphere2ActionHash]: {
 *          [orbit1EntryHash]: {
 *               ...
 *          }
 *     },
 *  }```
 */
export const nodeCache = new MiniDb();

/**
 * Store object which can be used outside React components to get, set, or sub state
 */
export const store: any = createStore();