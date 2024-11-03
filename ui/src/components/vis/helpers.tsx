import { IVisualization, Margins, ViewConfig, VisProps, VisType, ZoomConfig } from "./types";
import { ReactNode } from "react";
import { withVisCanvas } from "../HOC/withVisCanvas";
import { BASE_SCALE, DEFAULT_MARGINS, FOCUS_MODE_SCALE, NODE_RESCALE_FACTOR_SM, PLANNIT_SPECIFIC_ZOOM_RESCALE_FACTOR_ASTRO, PLANNIT_SPECIFIC_ZOOM_RESCALE_FACTOR_ATOM, PLANNIT_SPECIFIC_ZOOM_RESCALE_FACTOR_SUB } from "./constants";
import { store } from "../../state/store";
import { getCurrentOrbitStartTimeFromEh } from "../../state/orbit";
import { newTraversalLevelIndexId, NodeContent, OrbitNodeDetails } from "../../state";
import { HierarchyNode } from "d3-hierarchy";
import { Frequency, Scale } from "../..//graphql/generated";
import { select } from "d3-selection";

export function getDisplayName(scale: Scale) {
  switch (scale) {
    case Scale.Astro:
      return "Astronomic";
    case Scale.Sub:
      return "Sub-astronomic";
    case Scale.Atom:
      return "Atomic";
  }
}

export function getFrequencyDisplayName(freq: Frequency) {
  switch (freq) {
    case Frequency.OneShot:
      return "Once";
    case Frequency.DailyOrMore_1d:
      return "Daily";
    case Frequency.DailyOrMore_2d:
      return "2/day";
    case Frequency.DailyOrMore_3d:
      return "3/day";
    case Frequency.DailyOrMore_4d:
      return "4/day";
    case Frequency.DailyOrMore_5d:
      return "5/day";
    case Frequency.DailyOrMore_6d:
      return "6/day";
    case Frequency.DailyOrMore_7d:
      return "7/day";
    case Frequency.DailyOrMore_8d:
      return "8/day";
    case Frequency.DailyOrMore_9d:
      return "9/day";
    case Frequency.DailyOrMore_10d:
      return "10/day";
    case Frequency.LessThanDaily_1w:
      return "Weekly";
    case Frequency.LessThanDaily_1m:
      return "Monthly";
    case Frequency.LessThanDaily_1q:
      return "Quarterly";
    default:
      return freq;
  }
}

export const getCanvasDimensions = () => {
  const { height, width } = document.body.getBoundingClientRect();
  const canvasHeight = height - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom;
  const canvasWidth = width - DEFAULT_MARGINS.right - DEFAULT_MARGINS.left;
  return { canvasHeight, canvasWidth };
};

export const appendSvg = (mountingDivId: string, divId: string) => {
  return (
    select(`#${divId}`).empty() &&
    select(`#${mountingDivId}`)
      .append("svg")
      .attr("id", `${divId}`)
      .attr("width", "100vw")
      .attr("data-testid", "svg")
      .attr("height", "100vh")
      .attr("style", "pointer-events: all")
  );
};

// Helper function to return a ReactNode that is a combination of the Vis component, wrapped by the withCanvas higher order component, contained by a mounting div
export const renderVis = (
  visComponent: React.ComponentType<VisProps<IVisualization>>,
): ReactNode => (
  <>
    <div id="vis-root" className="h-full"></div>
    {withVisCanvas(visComponent)}
  </>
);

/**
 * Sorting function for ensuring both an array of hierarchies and the hierarchies themselves can be sorted by startTime and we get a deterministic layout
 * @param a First node
 * @param b Second node
 * @returns number indicating whether the items should be swapped in the sortBy
 */
export function byStartTime(
  a: HierarchyNode<NodeContent> | NodeContent, // d3 node - has gone through the hierarchy function already || an element of an array of trees from the source chain
  b: HierarchyNode<NodeContent> | NodeContent,
) {
  const getStartTime = store.get(getCurrentOrbitStartTimeFromEh);

  const getStartTimeFromNode = (node: HierarchyNode<NodeContent> | NodeContent) => {
    if ('data' in node && node.data.content) {
      return getStartTime(node.data.content);
    } else if ('content' in node) {
      return getStartTime(node.content);
    }
    return 0;
  };

  const startTimeA = getStartTimeFromNode(a) ?? 0;
  const startTimeB = getStartTimeFromNode(b) ?? 0;

  if (startTimeA === startTimeB) {
    console.warn("Sorting was equal between nodes. This is likely an error!");
    return 0;
  }
  return startTimeA - startTimeB;
}

// Helper to distinguish focus zoom level per orbit scale
export function chooseZoomScaleForOrbit(orbit: OrbitNodeDetails) {
  switch (orbit.scale) {
    case Scale.Astro:
      return PLANNIT_SPECIFIC_ZOOM_RESCALE_FACTOR_ASTRO
    case Scale.Sub:
      return PLANNIT_SPECIFIC_ZOOM_RESCALE_FACTOR_SUB
    case Scale.Atom:
      return PLANNIT_SPECIFIC_ZOOM_RESCALE_FACTOR_ATOM
    default:
      return FOCUS_MODE_SCALE;
  }
}

// Helper to ensure the tree returned from the source chain is ready for d3 hierarchy
export const parseAndSortTrees = (data: string) => {
  let parsedData = JSON.parse(data);
  while (typeof parsedData === "string") {
    parsedData = JSON.parse(parsedData);
  }
  const trees = parsedData?.result?.level_trees;
  if (!trees) console.error("Could not get an array of trees from parsed data")
  return trees.sort(byStartTime);
};

// Find the index in the level_trees array of the node that we will be traversing to in the new render.
export const determineNewLevelIndex = (sortedTrees: any[]): number | null => {
  const isNewLevelXIndex = store.get(newTraversalLevelIndexId);
  if (!isNewLevelXIndex?.id) return null;

  let newLevelXIndex =
    isNewLevelXIndex &&
    sortedTrees
      .map((d) => d.content)
      .findIndex((id) => id == isNewLevelXIndex.id);
  console.log('isNewLevelXIndex :>> ', newLevelXIndex);
  if (newLevelXIndex == -1) console.error("Could't pass forward new node index after traversal")

  return newLevelXIndex;
};

export const isTouchDevice = () => {
  return (
    "ontouchstart" in window || navigator.maxTouchPoints > 0 //||
    // navigator.msMaxTouchPoints > 0
  );
};

export const isSmallScreen = () => {
  return document.body.getBoundingClientRect().width < 768;
};

export const isSuperSmallScreen = () => {
  return document.body.getBoundingClientRect().width < 340;
};

export const debounce = function <T extends (...args: any[]) => Promise<any>>(func: T, delay: number) {
  let timeout: NodeJS.Timeout | null = null;
  let isExecuting = false;

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!isExecuting) {
      isExecuting = true;
      try {
        const result = await func(...args);
        isExecuting = false;
        return result;
      } catch (error) {
        isExecuting = false;
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        timeout = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    }
  };
};
// General helpers

export const getTransform = (node, xScale) => {
  if (typeof node === "undefined") return;
  var x = node.__data__ ? node.__data__.x : node.x;
  var y = node.__data__ ? node.__data__.y : node.y;
  var bx = x * xScale;
  var by = y * xScale;
  var tx = -bx;
  var ty = -by;
  return { translate: [tx, ty], scale: xScale };
};

const concatenateHierarchyNodeValues = (hierarchy) =>
  hierarchy?.descendants && hierarchy.descendants().map((n) => n.value).join``;

const checkAndResetCollapsed = (visObject) => {
  if (visObject.isCollapsed) {
    visObject.isCollapsed = false;
    return true;
  }
  return false;
};

export const hierarchyStateHasChanged = (currentHierarchy, visObject) => {
  const compareString = JSON.stringify(currentHierarchy.data);
  const currentHierNodeValueString =
    concatenateHierarchyNodeValues(currentHierarchy);

  return (
    JSON.stringify(visObject.rootData.data) !== compareString ||
    concatenateHierarchyNodeValues(visObject.rootData) !==
    currentHierNodeValueString
  );
};

export const updateVisRootData = (visObject, currentHierarchy) => {
  const visHasRenders =
    typeof visObject == "object" && !visObject.firstRender();
  // Check if the hierarchy in the store is a new one (a new tree needs rendering)
  // either because of a different node set/relationships
  // or because node values changed

  if (
    visHasRenders &&
    (visObject.firstRender() ||
      hierarchyStateHasChanged(currentHierarchy, visObject) ||
      checkAndResetCollapsed(visObject))
  ) {
    visObject._nextRootData = currentHierarchy;

    visObject.render();
    console.log("Rendered from component & updated ", {}, "!");
    return visObject;
  }
};

export const getInitialXTranslate = ({ levelsWide, defaultView }) => {
  const [_x, _y, w, _h] = defaultView.split` `;
  return w / levelsWide / (BASE_SCALE * 2);
};

export const getInitialYTranslate = (
  type: VisType,
  { levelsHigh, defaultView },
) => {
  const [_x, _y, _w, h] = defaultView.split` `;
  switch (type) {
    default:
      return h / levelsHigh / 3.5;
  }
};

export const newXTranslate = (
  type: VisType,
  viewConfig: ViewConfig,
  zoomConfig: ZoomConfig,
) => {
  const scale = zoomConfig.globalZoomScale || viewConfig.scale;
  switch (type) {
    // case "cluster":
    //   return -zoomConfig.previousRenderZoom?.node?.y * scale;
    // case "radial":
    //   return 0; // -radialTranslation(zoomConfig).x * scale;
    case VisType.Tree:
      return -(zoomConfig.previousRenderZoom?.node?.x!) * scale;
  }
};

export const newYTranslate = (
  type: VisType,
  viewConfig: ViewConfig,
  zoomConfig: ZoomConfig,
): number => {
  const scale = viewConfig.scale;
  switch (type) {
    // case "cluster":
    //   return -zoomConfig.previousRenderZoom?.node?.x * scale;
    // case "radial":
    //   return 0; //-radialTranslation(zoomConfig).y * scale;
    case VisType.Tree:
      return -(zoomConfig.previousRenderZoom?.node?.y!) * scale;
    default:
      return 1;
  }
};

// Node Status helpers

// export const sumChildrenValues = (node, hidden = false) => {
//   let children = node?._children || node?.children || node?.data?.children;
//   children = children.filter(notOOB);
//   return children.reduce((sum, n) => sum + n.value, 0);
// };

// const allOOB = (nodes) =>
//   nodes.every((d) => parseTreeValues(d.data.content)!.status === "OOB");

// export const isALeaf = (node) => {
//   return (
//     (node?.height === 0 || (node?.children && allOOB(node.children))) &&
//     !node?._children
//   );
// };

// Node/tree manipulation helpers

export function expand(d) {
  var children = d.children ? d.children : d._children;
  if (d._children) {
    d.children = d._children;
    d._children = null;
  }
  if (children) children.forEach(expand);
}

export function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

export const cousins = (node, root) => {
  return root.descendants().filter((n) => n.depth == node.depth && n !== node);
};

export const greatAunts = (node, root) =>
  root.descendants().filter((n) => !n.ancestors().includes(node?.parent));

export const nodesForCollapse = function (
  node,
  { cousinCollapse = true, auntCollapse = true },
) {
  let minExpandedDepth = node.depth + 2;
  // For collapsing the nodes 'two levels lower' than selected
  let descendantsToCollapse = node
    .descendants()
    .filter((n) => n.depth >= minExpandedDepth);
  // For collapsing cousin nodes (saving width)
  let nodeCousins = [];
  if (cousinCollapse) {
    nodeCousins = cousins(node, this.rootData);
  }
  // For collapsing cousin nodes (saving width)
  let aunts = [];
  if (node.depth > 1 && auntCollapse && this.rootData.children) {
    aunts = greatAunts(node, this.rootData).filter(
      (n) => !node.ancestors().includes(n),
    );
  }
  return descendantsToCollapse.concat(nodeCousins).concat(aunts);
};
