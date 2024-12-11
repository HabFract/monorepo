import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { ActionHashB64, EntryHashB64 } from "@state/types";
import { hierarchy } from "d3-hierarchy";
import { OrbitHierarchyQueryParams, GetOrbitHierarchyDocument, Scale } from "../../graphql/generated";
import { SphereOrbitNodeDetails, store, currentSphereHierarchyIndices, Frequency } from "../../state";
import { TreeVisualization } from "./base-classes/TreeVis";
import { byStartTime, parseAndSortTrees } from "./helpers";
import { VisCoverage, VisType } from "./types";
import { NODE_ENV } from "../../constants";

export const toYearDotMonth = (date: string) => date.split("/").slice(1).reverse().join(".");

export const isMoreThenDaily = (frequency: Frequency.Rationals): boolean => frequency > 1;

// Lazy loading of the biggest d3 deps
export const loadD3Dependencies = async () => {
  const [d3Hierarchy, d3Selection] = await Promise.all([
    import('d3-hierarchy'),
    import('d3-selection')
  ]);
  return {
    hierarchy: d3Hierarchy.hierarchy,
    select: d3Selection.select
  };
};

function CustomBezier(context) {
  this._context = context;
}
CustomBezier.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function () {
    if (this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    if (this._line >= 0) this._line = 1 - this._line;
  },
  point: function (x, y) {
    (x = +x), (y = +y);

    switch (this._point) {
      case 0:
        this._point = 1;
        this._context.moveTo(x, y);
        break;
      //@ts-expect-error
      case 1:
        this._point = 2;
        // falls through

      default: {
        const dx = x - this._x;
        const dy = y - this._y;

        if (Math.abs(dx) > 1e-6) {

        // To create a shape like a curly brace:
        // - Start with steep vertical rise/fall at the anchors
        // - Flatten quickly into horizontal
        // - Steepen back into vertical to meet the next anchor
        
        // Control points to create a quick approach and departure in y, long horizontal stretch
        const x1 = this._x + (dx * 0.0002);  // Start control: quick horizontal shift
        const y1 = this._y + (dy * 0.9999);  // Strong vertical pull down near initial point
        const x2 = x - (dx * 0.0002);        // End control: quick horizontal shift
        const y2 = y - (dy * 0.9999);        // Strong vertical pull down near final point

        this._context.bezierCurveTo(x1, y1, x2, y2, x, y);
      } else {
        // Close to vertical line, straight line segment
        this._context.lineTo(x, y);
      }
      break;
    }
  }
  (this._x = x), (this._y = y);
}
};



export const curves = {
  curveCustomBezier: function(context) {
    return new CustomBezier(context);
  }
};

export const getScaleForPlanet = (scale) => {
  switch (scale) {
    case Scale.Astro:
      return 2;
    case Scale.Sub:
      return 1.75;
    case Scale.Atom:
      return 0.8;
  }
};

export const getClassesForNodeVectorGroup = (selected: boolean, scale): string => {
  return `${selected ? " selected" : ""} ${scale.toString().toLowerCase()}`
};

export const getLabelScale = (scale) => {
  switch (scale) {
    case Scale.Astro:
      return 1.2;
    case Scale.Sub:
      return 0.86;
    case Scale.Atom:
      return 0.6;
  }
};

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
