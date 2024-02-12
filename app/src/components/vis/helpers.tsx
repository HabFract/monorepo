import {
  positiveCol,
  negativeCol,
  positiveColLighter,
  neutralCol,
  noNodeCol,
} from "./constants";

// Helper function to return a ReactNode that is a combination of the Vis component, wrapped by the withCanvas higher order component, contained by a mounting div
export const renderVis = (visComponent: React.ComponentType<VisProps>) : ReactNode => <>
  <div id="vis-root" className="h-full"></div>{(withVisCanvas(visComponent))}
</>

export const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 //||
    // navigator.msMaxTouchPoints > 0
  );
};

export const isSmallScreen = () => {
  return document.body.getBoundingClientRect().width < 768;
};

export const isSuperSmallScreen = () => {
  return document.body.getBoundingClientRect().width < 340;
};

export const debounce = function (func, delay) {
  let timeout;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func.apply(null, args), delay);
  };
};


import { select } from "d3-selection";
// import { selectInUnpersisted } from "features/habitDate/selectors";
import { ViewConfig, VisProps, VisType, ZoomConfig } from "./types";
import { ReactNode } from "react";
import { withVisCanvas } from "./HOC/withVisCanvas";

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

export const updateVisRootData = (
  visObject,
  currentHierarchy,
) => {
  const visHasRenders = typeof visObject == 'object' && !visObject.firstRender();
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
  return w / levelsWide / 1.5 ;
};

export const getInitialYTranslate = (
  type: VisType,
  { levelsHigh, defaultView },
) => {
  const [_x, _y, _w, h] = defaultView.split` `;
  switch (type) {
    default:
      return (h / levelsHigh);
  }
};

export const newXTranslate = (type: VisType, viewConfig: ViewConfig, zoomConfig: ZoomConfig) => {
  const scale = zoomConfig.globalZoomScale || viewConfig.scale;
  switch (type) {
    // case "cluster":
    //   return -zoomConfig.previousRenderZoom?.node?.y * scale;
    // case "radial":
    //   return 0; // -radialTranslation(zoomConfig).x * scale;
    case VisType.Tree:
      return -zoomConfig.previousRenderZoom?.node?.x * scale;
  }
};

export const newYTranslate = (type: VisType, viewConfig: ViewConfig, zoomConfig: ZoomConfig) : number => {
  const scale = viewConfig.scale;
  switch (type) {
    // case "cluster":
    //   return -zoomConfig.previousRenderZoom?.node?.x * scale;
    // case "radial":
    //   return 0; //-radialTranslation(zoomConfig).y * scale;
    case VisType.Tree:
      return -zoomConfig.previousRenderZoom?.node?.y * scale;
    default: return 1;
  }
};

// Node Status helpers

export const oppositeStatus = (current) =>
  [undefined, "false", "incomplete", ""].includes(current) ? "true" : "false";

export const notOOB = (node) =>
  parseTreeValues(node.data.content)!.status !== "OOB";

export const sumChildrenValues = (node, hidden = false) => {
  let children = node?._children || node?.children || node?.data?.children;
  children = children.filter(notOOB);
  return children.reduce((sum, n) => sum + n.value, 0);
};

export const nodeWithoutHabitDate = (data, store) =>
  habitDateNotPersisted(data) //&& !selectInUnpersisted(data)(store.getState());

const allOOB = (nodes) =>
  nodes.every((d) => parseTreeValues(d.data.content)!.status === "OOB");

export const isALeaf = (node) => {
  return (
    (node?.height === 0 || (node?.children && allOOB(node.children))) &&
    !node?._children
  );
};

export function getColor(completedStatus) {
  switch (completedStatus) {
    case true:
      return positiveCol;
    case false:
      return negativeCol;
    case "OOB":
      return noNodeCol;
    case "noHabitDate":
      return negativeCol;
    case "parentCompleted":
      return positiveColLighter;
    default:
      return noNodeCol;
  }
}

export const parseTreeValues = (valueString) => {
  if (typeof valueString === "undefined") return;
  let splitValues, status, left, right;
  try {
    [splitValues, status] = valueString.split("-");
    [, left, right] = splitValues.split(/\D/);

    return { left, right, status };
  } catch {
    console.log(valueString, "Error Parsing");
  }
};

export const outOfBoundsNode = (d, rootData) => {
  return nodeStatusColours(d) == noNodeCol;
};

export const areSomeDescendantsIncomplete = (descendants) =>
  descendants &&
  !!(
    descendants
      .map((n) => n.value)
      .join("")
      .match(/0/) ||
    descendants.some(
      (descendant) =>
        !["true", "OOB"].includes(
          parseTreeValues(descendant.data.content)!.status
        )
    )
  );

export const areAllChildrenIncomplete = (children) =>
  children &&
  !children
    .map((n) => n.value)
    .join("")
    .match(/1/);

export const areAllChildrenComplete = (children) =>
  children &&
  !children
    .map((n) => n.value)
    .join("")
    .match(/0/);

export const habitDateNotPersisted = (node) => {
  return node?.data?.content
    ? ["", "false"].includes(parseTreeValues(node.data.content)!.status)
    : ["", "false"].includes(parseTreeValues(node?.content)!.status);
};

export const cumulativeValue = (node) => {
  let content;
  try {
    content = parseTreeValues(node.content || node?.data.content)?.status;
  } catch (error) {
    console.log("error accumulating values :>> ", error);
    console.log("content, node :>> ", content, node);
  }
  try {
    // if collapsed
    if (!!node?._children) {
      const notOOBChildren = node._children.filter(notOOB);
      return +(
        // return 1 or 0
        (
          sumChildrenValues(node, true) >= notOOBChildren.length &&
          notOOBChildren.every((n) => cumulativeValue(n) === 1)
        ) // All children have accumulated value 1
      );
    }
    // if expanded
    if (content === "true" || node.value > 0) {
      if (!!node?.children && node?.children?.length > 0) {
        const notOOBChildren = node.children.filter(notOOB);
        return +(
          // Were all descendant nodes accumulated to have a 1 value each?
          (
            sumChildrenValues(node) >= notOOBChildren.length &&
            notOOBChildren.every((n) => cumulativeValue(n) === 1)
          )
        );
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  } catch (err) {
    console.log("Could not accumulate.");
  }
};

export const contentEqual = (node, other) =>
  node.content.split("-").slice(0, 1)[0] ==
  other.content.split("-").slice(0, 1)[0];

export const nodeStatusColours = (d) => {
  // Guard clause for 'no record'
  if (typeof d === "undefined" || typeof d.data.content === "undefined")
    return noNodeCol;
  const cumulativeVal = cumulativeValue(d);
  let decidingVal =
    d?.value && d.value == cumulativeVal ? d.value : cumulativeVal;
  const status = parseTreeValues(d.data.content)!.status;

  if (
    d.height === 0 ||
    d?._children?.every(
      (d) => parseTreeValues(d.data.content)!.status === "OOB"
    ) ||
    d?.children?.every((d) => parseTreeValues(d.data.content)!.status === "OOB")
  ) {
    if (status == "true") return positiveCol;
    if (status == "false") return negativeCol;
  }
  if (status == "OOB") return noNodeCol; // Untracked (out of bounds) nodes are neutral

  const childColors = d?.children?.map(nodeStatusColours);
  if (!decidingVal && childColors?.every((c) => c === positiveCol))
    return positiveCol;
  const ghostChildColors = d?._children?.map(nodeStatusColours);
  if (!decidingVal && ghostChildColors?.every((c) => c === positiveCol))
    return positiveCol;

  switch (decidingVal) {
    case 1: // All descendants are positive
      return positiveCol;
    case 0: // Not all descendants are positive
      const descendantsColors = d
        ?.descendants()
        ?.slice(1)
        .map(nodeStatusColours);
      if (
        // We first exclude sub-incomplete nodes as they have a different colour
        status == "true" ||
        d?.value ||
        (descendantsColors?.length &&
          descendantsColors.includes(positiveColLighter)) ||
        (childColors?.length &&
          childColors.includes(positiveCol) &&
          childColors.includes(negativeCol))
      ) {
        return positiveColLighter;
      } // Node is complete but some of its descendants are not.
      return negativeCol;
    default:
      return neutralCol;
  }
};

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
  { cousinCollapse = true, auntCollapse = true }
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
      (n) => !node.ancestors().includes(n)
    );
  }
  return descendantsToCollapse.concat(nodeCousins).concat(aunts);
};
