import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { EntryHashB64, ActionHashB64 } from "@holochain/client";
import { hierarchy } from "d3-hierarchy";
import { OrbitHierarchyQueryParams, GetOrbitHierarchyDocument } from "../../graphql/generated";
import { SphereOrbitNodeDetails, store, currentSphereHierarchyIndices, Frequency } from "../../state";
import { TreeVisualization } from "./base-classes/TreeVis";
import { byStartTime, parseAndSortTrees } from "./helpers";
import { VisCoverage, VisType } from "./types";
import { NODE_ENV } from "../../constants";

export const toYearDotMonth = (date: string) => date.split("/").slice(1).reverse().join(".");

export const isMoreThenDaily = (frequency: Frequency.Rationals): boolean => frequency > 1;


/**
 * Determines the visual coverage type based on current parameters
 * @param params - The current parameters
 * @param y - The current y-coordinate in the hierarchy
 * @returns The determined VisCoverage type
 */
export const determineVisCoverage = (params, y) =>
  params?.orbitEh
    ? VisCoverage.CompleteOrbit
    : y == 0
      ? VisCoverage.CompleteSphere
      : VisCoverage.Partial;

/**
 * Generates query parameters for fetching orbit hierarchy
 * @param visCoverage - The current visual coverage type
 * @param sphereHashB64 - The current sphere's entry hash
 * @returns The query parameters for fetching orbit hierarchy
 */
export const generateQueryParams = (visCoverage, sphereHashB64: EntryHashB64) => (customDepth?: number): OrbitHierarchyQueryParams | null => {
  return visCoverage == VisCoverage.CompleteOrbit
    ? { orbitEntryHashB64: null }// } TODO: update or remove this functionality
    : {
      levelQuery: {
        sphereHashB64: sphereHashB64,
        orbitLevel: customDepth || 0,
      },
    }
};

/**
 * Parses and derives JSON data based on the current visual coverage
 * @param json - The JSON string to parse
 * @param visCoverage - The current visual coverage type
 * @param x - The current x-coordinate in the hierarchy
 * @returns The derived JSON data
 */
export const deriveJsonData = (json: string, visCoverage, x) => {
  try {
    const parsed = JSON.parse(json);
    if (parsed?.length && (x > parsed.length - 1)) console.error("Tried to traverse out of hierarchy bounds")

    return visCoverage == VisCoverage.CompleteOrbit ? parsed : parsed[x];
  } catch (error) {
    console.error("Error deriving parsed JSON from data: ", error);
  }
};

/**
 * Creates a new TreeVisualization instance
 * @param params - Various parameters needed for creating the visualization
 * @returns A new TreeVisualization instance
 */
export const createTreeVisualization = ({
  json,
  visCoverage,
  canvasHeight,
  canvasWidth,
  margin,
  transition,
  params,
  sphereNodeDetails,
  getJsonDerivation,
  setDepthBounds,
}) => {
  const currentTreeJson = getJsonDerivation(json);
  const hierarchyData = hierarchy(currentTreeJson).sort(byStartTime);
  setDepthBounds(params?.currentSphereEhB64, [
    0,
    visCoverage == VisCoverage.CompleteOrbit ? 100 : hierarchyData.height,
  ]);

  return new TreeVisualization(
    VisType.Tree,
    visCoverage,
    "vis",
    hierarchyData,
    canvasHeight,
    canvasWidth,
    margin,
    transition,
    params?.currentSphereEhB64 as EntryHashB64,
    params?.currentSphereAhB64 as ActionHashB64,
    sphereNodeDetails as SphereOrbitNodeDetails,
  );
};

/**
 * Parses the orbit hierarchy data and updates relevant state
 * @param hierarchyData - The raw hierarchy data to process
 */
export const parseOrbitHierarchyData = (
  hierarchyData: string,
) => {
  const sortedTrees = parseAndSortTrees(hierarchyData);
  !(NODE_ENV == 'test') && console.log('Parsing result... :>> ', sortedTrees);

  return sortedTrees;
};

/**
 * Fetches hierarchy data from the cache or the server
 * @param params - Various parameters needed for fetching the data
 */
export const fetchHierarchyDataForLevel = async ({
  error,
  depthBounds,
  getQueryParams,
  y,
  getHierarchy,
  client
}) => {
  if (error) return;
  const query = depthBounds
    ? { ...getQueryParams(), orbitLevel: 0 }
    : getQueryParams(y);

  let cachedData;
  try {
    if (NODE_ENV !== 'test') {
      const gql: ApolloClient<NormalizedCacheObject> =
        (await client) as ApolloClient<NormalizedCacheObject>;
      cachedData = gql.readQuery({
        query: GetOrbitHierarchyDocument,
        variables: { params: { ...query } },
      });
    }
  } catch (error) {
    console.error("Couldn't get client or data from Apollo cache")
  }
  if (cachedData) {
    console.log("Fetching current hierarchy level from Apollo cache...")
    return cachedData
  } else {
    NODE_ENV !== 'test' && console.log("Fetching current hierarchy level from source chain: ", JSON.stringify({ variables: { params: { ...query } } }, null, 2))
    await getHierarchy({ variables: { params: { ...query } } });
  }
};

/**
 * Handles zoomer initialization based on the current orbit tree and visual coverage
 * @param currentOrbitTree - The current orbit tree visualization
 * @param visCoverage - The current visual coverage
 */
export const handleZoomerInitialization = (currentOrbitTree, visCoverage) => {
  if (currentOrbitTree) {
    visCoverage === VisCoverage.Partial
      ? currentOrbitTree.resetZoomer()
      : currentOrbitTree.initializeZoomer();
  }
};

/**
 * Calculates and sets the breadth bounds based on the current parameters
 * @param setBreadthBounds - Function to set breadth bounds
 * @param params - Current parameters
 * @param visCoverage - Current visual coverage
 * @param sortedLength - Length of the sorted data
 */
export const calculateAndSetBreadthBounds = (setBreadthBounds, params, visCoverage, sortedLength) => {
  setBreadthBounds(params?.currentSphereEhB64, [
    0,
    visCoverage === VisCoverage.CompleteOrbit ? 100 : sortedLength - 1,
  ]);
};

/**
 * Checks if the hierarchy has new nodes that have been added which may not be present in the hierarchy data yet
 * @param sorted - Sorted hierarchy data
 * @param currentOrbitTree - Current orbit tree visualization
 * @returns Boolean indicating if there are new nodes
 */
export const checkNewDescendantsAdded = (sorted, currentOrbitTree): boolean => {
  if (!currentOrbitTree.rootData) return false;
  const newHierarchyDescendants = hierarchy(sorted[0])?.sort(byStartTime)?.descendants()?.length;
  const oldHierarchyDescendants = currentOrbitTree?.rootData.descendants().length;
  return newHierarchyDescendants === oldHierarchyDescendants;
};

/**
 * Updates the current sphere hierarchy indices
 * @param newLevelXIndex - New X index for the level
 * @param y - Current Y index
 */
export const updateSphereHierarchyIndices = (newLevelXIndex, y) => {
  if (newLevelXIndex !== -1) {
    store.set(currentSphereHierarchyIndices, { x: newLevelXIndex, y });
  }
};

/**
 * Updates the breadth index based on the new level X index
 * @param setBreadthIndex - Function to set the breadth index
 * @param newLevelXIndex - New X index for the level
 * @param currentBreadthIndex - Current breadth index
 */
export const updateBreadthIndex = (setBreadthIndex, newLevelXIndex, currentBreadthIndex) => {
  setBreadthIndex(newLevelXIndex !== -1 ? newLevelXIndex : currentBreadthIndex);
};
