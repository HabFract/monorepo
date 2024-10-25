import { hierarchy, HierarchyNode, HierarchyPointNode, tree, TreeLayout } from "d3-hierarchy";
import { DefaultLinkObject, Link, linkVertical } from "d3-shape";
import {
  EventHandlers,
  Margins,
  ViewConfig,
  VisType,
} from "../types";
import {
  BASE_SCALE,
  FOCUS_MODE_SCALE,
  LG_TREE_PATH_OFFSET_X,
  LG_TREE_PATH_OFFSET_Y,
  LINK_COLOR,
  LINK_THICKNESS,
  NEGATIVE_ZOOM_Y_OFFSET_MD_LG,
  NEGATIVE_ZOOM_Y_OFFSET_SM_NONROOT,
  NEGATIVE_ZOOM_Y_OFFSET_SM_ROOT,
  NODE_RESCALE_FACTOR_MD_LG,
  NODE_RESCALE_FACTOR_SM,
  PLANNIT_ZOOM_TRANSITION_DURATION,
  XS_TREE_PATH_OFFSET_X,
  XS_TREE_PATH_OFFSET_Y,
} from "../constants";
import { BaseVisualization } from "./BaseVis";
import { select } from "d3-selection";
import { easeCubicOut } from "d3-ease";
import { link } from "d3-shape";
import { store } from "../../../state/store";
import { NodeContent, OrbitNodeDetails } from "../../../state/types";
import {
  ONE_CHILD,
  ONE_CHILD_XS,
  TWO_CHILDREN_LEFT,
  TWO_CHILDREN_RIGHT,
  TWO_CHILDREN_LEFT_XS,
  TWO_CHILDREN_RIGHT_XS,
  THREE_CHILDREN_LEFT,
  THREE_CHILDREN_RIGHT,
  THREE_CHILDREN_LEFT_XS,
  THREE_CHILDREN_RIGHT_XS,
  FOUR_CHILDREN_LEFT_1,
  FOUR_CHILDREN_LEFT_2,
  FOUR_CHILDREN_RIGHT_1,
  FOUR_CHILDREN_RIGHT_2,
  FOUR_CHILDREN_LEFT_1_XS,
  FOUR_CHILDREN_LEFT_2_XS,
  FOUR_CHILDREN_RIGHT_1_XS,
  FOUR_CHILDREN_RIGHT_2_XS,
  FIVE_CHILDREN_LEFT_1,
  FIVE_CHILDREN_LEFT_2,
  FIVE_CHILDREN_RIGHT_1,
  FIVE_CHILDREN_RIGHT_2,
  FIVE_CHILDREN_LEFT_1_XS,
  FIVE_CHILDREN_LEFT_2_XS,
  FIVE_CHILDREN_RIGHT_1_XS,
  FIVE_CHILDREN_RIGHT_2_XS,
  SIX_CHILDREN_LEFT_1,
  SIX_CHILDREN_LEFT_2,
  SIX_CHILDREN_LEFT_3,
  SIX_CHILDREN_RIGHT_1,
  SIX_CHILDREN_RIGHT_2,
  SIX_CHILDREN_RIGHT_3,
  SIX_CHILDREN_LEFT_1_XS,
  SIX_CHILDREN_LEFT_2_XS,
  SIX_CHILDREN_LEFT_3_XS,
  SIX_CHILDREN_RIGHT_1_XS,
  SIX_CHILDREN_RIGHT_2_XS,
  SIX_CHILDREN_RIGHT_3_XS,
} from "../links/paths";
import {
  chooseZoomScaleForOrbit,
  debounce,
  getInitialXTranslate,
  getInitialYTranslate,
  isSmallScreen,
  newXTranslate,
  newYTranslate,
} from "../helpers";
import { currentOrbitIdAtom, getOrbitNodeDetailsFromIdAtom, getOrbitIdFromEh } from "../../../state/orbit";
import { EntryHashB64 } from "@holochain/client";
import { getHierarchyAtom } from "../../../state/hierarchy";
import { AppMachine } from "../../../main";
import { NODE_ENV } from "../../../constants";
import { curves, getClassesForNodeVectorGroup, getScaleForPlanet } from "../tree-helpers";

export class TreeVisualization extends BaseVisualization {
  layout!: TreeLayout<unknown>;
  _lastOrbitId: EntryHashB64 | null = null;

  initializeViewConfig(
    canvasHeight: number,
    canvasWidth: number,
    margin: Margins,
    customScale?: number
  ): ViewConfig {
    return {
      scale: customScale || BASE_SCALE,
      margin: { ...margin },
      canvasHeight,
      canvasWidth,
      defaultView: "",

      defaultCanvasTranslateX: () => {
        const initialX = getInitialXTranslate.call(this, {
          defaultView: this._viewConfig.defaultView,
          levelsWide: this._viewConfig.levelsWide,
        });
        return customScale || typeof this._zoomConfig.previousRenderZoom?.node?.x !==
          "undefined"
          ? initialX +
          this._viewConfig.margin.left +
          (newXTranslate(
            this.type,
            this._viewConfig,
            this._zoomConfig,
          ) as number)
          : initialX +
          this._viewConfig.margin.left;
      },
      defaultCanvasTranslateY: () => {
        const initialY = getInitialYTranslate.call(this, this.type, {
          defaultView: this._viewConfig.defaultView,
          levelsHigh: this._viewConfig.levelsHigh,
        });
        return customScale || typeof this._zoomConfig.previousRenderZoom?.node?.y !==
          "undefined"
          ? (((this._viewConfig.margin.top as number) +
            initialY +
            newYTranslate(
              this.type,
              this._viewConfig,
              this._zoomConfig,
            )) as number)
          : initialY + this._viewConfig.margin.top;
      },
      isSmallScreen: function () {
        return this.canvasWidth < 440;
      },
    };
  }

  initializeEventHandlers(): EventHandlers {
    return {
      handlePrependNode: function ({ childOrbitEh }) {
        this.modalChildOrbitEh(childOrbitEh);
        this.modalOpen(true);
        this.modalIsOpen = true;
      },
      handleAppendNode: function ({parentOrbitEh}) {
        this.modalParentOrbitEh(parentOrbitEh);
        this.modalOpen(true);
        this.modalIsOpen = true;
      },
      //@ts-ignore
      handleNodeZoom: (event: any, node: HierarchyNode<NodeContent>) => {
        if (typeof node == undefined || Number.isNaN(node.x) || Number.isNaN(node.y)) return null;
        const id = store.get(getOrbitIdFromEh(node.data.content));
        const orbit = store.get(getOrbitNodeDetailsFromIdAtom(id));
        const isRootNode = orbit.eH == this._originalRootData?.data.content;

        const zoomOffsetY = -(this._viewConfig.isSmallScreen() ? (isRootNode ? NEGATIVE_ZOOM_Y_OFFSET_SM_ROOT : NEGATIVE_ZOOM_Y_OFFSET_SM_NONROOT) : NEGATIVE_ZOOM_Y_OFFSET_MD_LG)
        const scale = (this._viewConfig.isSmallScreen() ? NODE_RESCALE_FACTOR_SM: NODE_RESCALE_FACTOR_MD_LG) * chooseZoomScaleForOrbit(orbit);
        const x = -(node as any).x * scale + this._viewConfig.canvasWidth / 2;
        const y = -(node as any).y * scale + this._viewConfig.canvasHeight / 2 + zoomOffsetY;

        this._zoomConfig.globalZoomScale = scale;
        this._zoomConfig.focusMode = true;
        this._zoomConfig.previousRenderZoom = { event, node, scale };
        if (isRootNode) {
          this.initializeZoomer()
          // this.applyInitialTransform()
        } else {
          // this.resetZoomer()
        }

        return !!(NODE_ENV !== 'test' && !this.noCanvas()) && this._canvas!
          //@ts-expect-error
          .transition()
          .duration(this.startInFocusMode ? 0 : PLANNIT_ZOOM_TRANSITION_DURATION)
          .ease(easeCubicOut)
          .attr("transform", `translate(${x},${y}) scale(${scale})`)
          .on("end", () => {
            this._zoomConfig.focusMode = true;
          }) as any;
      },

      memoizedhandleNodeZoom(id: EntryHashB64, foundNode?: HierarchyNode<NodeContent>) {
        if (id === this._lastOrbitId) {
          console.log('Returned early from zoom... ');
          return select(null)
        }; // Memoization check
        this._lastOrbitId = id;

        const newId = foundNode?.data.content || id || store.get(currentOrbitIdAtom)?.id;
        if (!newId) return select(null);
        let node = foundNode
          || this.rootData.find(node => node.data.content == newId)
          || this._originalRootData.find(node => node.data.content == newId);

        // console.log('Actually zoomed to node: :>> ', node);
        if (node && (typeof node?.x !== undefined) && (typeof node?.y !== undefined)) {
          const e = {
            sourceEvent: {
              clientX: node.x,
              clientY: node.y
            },
            transform: {
              x: 0,
              y: 0,
              k: 1
            }
          };
          // console.log('Zoomed to focus node based on store sub to currentOrbitId... ');
          return this.eventHandlers.handleNodeZoom.call(this, e as any, node);
        } else {
          console.error("Tried to zoom to node that isn't in the hierarchy")
          return null
        }
      },

      handleZoomOut: () => {
        this.zoomOut();
      },

      handleNodeClick(e) {
        const target = e?.target as HTMLElement | undefined;
        const currentOrbitId = store.get(currentOrbitIdAtom)?.id;

        const isAppendNodeButtonTarget = !!(target && target.closest(".orbit-controls-container button:first-child"))
        const isEditNodeButtonTarget = !!(target && target.closest(".orbit-controls-container button:last-child"))

        this._enteringNodes.select(".tooltip foreignObject").html(this.appendLabelHtml);
        this._enteringNodes.select(".node-vector-group").attr("class", (d: any) => {
          const selected = currentOrbitId && currentOrbitId == d.data.content
          const cachedNode = this.nodeDetails[d.data.content];
          if(!cachedNode) return "node-vector-group";
          const { scale } = cachedNode;

          return "node-vector-group" + getClassesForNodeVectorGroup(selected, scale)
        });
    
        if(isAppendNodeButtonTarget) {
          const nodeEh = (target.closest(".orbit-controls-container") as HTMLElement).dataset?.nodeEntryHash;
          this.eventHandlers.handleAppendNode.call(this, {parentOrbitEh: nodeEh})
        }
        if(isEditNodeButtonTarget) {
          const nodeEh = (target.closest(".orbit-controls-container") as HTMLElement).dataset?.nodeEntryHash;
          this.eventHandlers.handlePrependNode.call(this, {childOrbitEh: nodeEh})

        }
      },
    };
  }

  setupLayout(): void {
    this.layout = tree().size([
      this._viewConfig.canvasWidth / 2,
      this._viewConfig.canvasHeight / 2,
    ]);
    this.layout.nodeSize([
      this._viewConfig.dx as number,
      this._viewConfig.dy as number,
    ]);
    this.layout(this.rootData);
  }

  getNextLayout(): HierarchyPointNode<unknown> | null {
    if (!this._nextRootData) return null
    const layout = tree().size([
      this._viewConfig.canvasWidth / 2,
      this._viewConfig.canvasHeight / 2,
    ]);
    layout.nodeSize([
      this._viewConfig.dx as number,
      this._viewConfig.dy as number,
    ]);
    return layout(this._nextRootData as HierarchyNode<unknown>);
  }

  handleZoom(event: any): void {
    if (this._zoomConfig.focusMode) {

      const currentScale = event.transform.k;
      if (currentScale < (this._zoomConfig.globalZoomScale as number)) {
        this.zoomOut();
      }
      this._zoomConfig.focusMode = false;
    } else {
      super.handleZoom(event);
    }

  }

  zoomOut(): void {
    super.zoomOut();
    if (!this._zoomConfig.focusMode) return;
  }

  appendLinkPath(): void {
    const rootNodeId = this.rootData.data.content;
    // @ts-ignore
    const cacheItem: OrbitNodeDetails = this.nodeDetails[rootNodeId];
    if (!cacheItem || !cacheItem?.path) return;
    console.log('Got cache item for path:', cacheItem)
    const newPath = select(".canvas")
      .selectAll("g.links")
      .append("path")
      .attr("d", cacheItem.path)
      .classed("link", true)
      .classed("appended-path", true)
      .attr("stroke-width", LINK_THICKNESS)
      .attr("stroke", LINK_COLOR)
      .attr("data-testid", getTestId(cacheItem.path));

    //@ts-ignore
    const pathElement = newPath?._groups?.[0]?.[0];
    if (!pathElement) return;
    const { height, width } = pathElement.getBoundingClientRect();
    select(pathElement).attr(
      "transform",
      `translate(${getPathXTranslation(
        cacheItem.path,
        width,
        (this._viewConfig.isSmallScreen()
          ? XS_TREE_PATH_OFFSET_X
          : LG_TREE_PATH_OFFSET_X) / this._viewConfig.scale,
      ) * this._viewConfig.scale
      },${-(
        (height +
          (this._viewConfig.isSmallScreen()
            ? XS_TREE_PATH_OFFSET_Y
            : LG_TREE_PATH_OFFSET_Y))
      )})`,
    );
    console.log('Finished appending link paths...')

    // Helper function to get exact x translation based on path
    function getPathXTranslation(
      path: string,
      width: number,
      offset: number,
    ): number {
      switch (path) {
        case ONE_CHILD:
          return 0;
        case ONE_CHILD_XS:
          return 0;
        case TWO_CHILDREN_LEFT:
          return width + offset * 1.7;
        case TWO_CHILDREN_RIGHT:
          return -(width + offset * 1.7);
        case TWO_CHILDREN_LEFT_XS:
          return width + offset;
        case TWO_CHILDREN_RIGHT_XS:
          return -(width + offset);
        case THREE_CHILDREN_LEFT:
          return width + offset * 2;
        case THREE_CHILDREN_RIGHT:
          return -(width + offset * 2);
        case THREE_CHILDREN_LEFT_XS:
          return width + offset * 2;
        case THREE_CHILDREN_RIGHT_XS:
          return -(width + offset * 2);
        case FOUR_CHILDREN_LEFT_1:
          return width + offset * 3.35;
        case FOUR_CHILDREN_LEFT_2:
          return width + offset * 1.1;
        case FOUR_CHILDREN_RIGHT_1:
          return -(width + offset * 1.1);
        case FOUR_CHILDREN_RIGHT_2:
          return -(width + offset * 3.45);
        case FOUR_CHILDREN_LEFT_1_XS:
          return width + offset * 3;
        case FOUR_CHILDREN_LEFT_2_XS:
          return width + offset;
        case FOUR_CHILDREN_RIGHT_1_XS:
          return -(width + offset);
        case FOUR_CHILDREN_RIGHT_2_XS:
          return -(width + offset * 3);
        case FIVE_CHILDREN_LEFT_1:
          return width + offset * 4;
        case FIVE_CHILDREN_LEFT_2:
          return width + offset * 2;
        case FIVE_CHILDREN_RIGHT_1:
          return -(width + offset * 2);
        case FIVE_CHILDREN_RIGHT_2:
          return -(width + offset * 4);
        case FIVE_CHILDREN_LEFT_1_XS:
          return width + offset * 4;
        case FIVE_CHILDREN_LEFT_2_XS:
          return width + offset * 2;
        case FIVE_CHILDREN_RIGHT_1_XS:
          return -(width + offset * 2);
        case FIVE_CHILDREN_RIGHT_2_XS:
          return -(width + offset * 4);
        case SIX_CHILDREN_LEFT_1:
          return width + offset * 5;
        case SIX_CHILDREN_LEFT_2:
          return width + offset * 2;
        case SIX_CHILDREN_LEFT_3:
          return width + offset * 2;
        case SIX_CHILDREN_RIGHT_1:
          return -(width + offset * 2);
        case SIX_CHILDREN_RIGHT_2:
          return -(width + offset * 2);
        case SIX_CHILDREN_RIGHT_3:
          return -(width + offset * 5);
        case SIX_CHILDREN_LEFT_1_XS:
          return width + offset * 5;
        case SIX_CHILDREN_LEFT_2_XS:
          return width + offset * 2;
        case SIX_CHILDREN_LEFT_3_XS:
          return width + offset * 2;
        case SIX_CHILDREN_RIGHT_1_XS:
          return -(width + offset * 2);
        case SIX_CHILDREN_RIGHT_2_XS:
          return -(width + offset * 2);
        case SIX_CHILDREN_RIGHT_3_XS:
          return -(width + offset * 5);
        default:
          return 0;
      }
    }
    // Helper function to fetch path testId based on path
    function getTestId(path: string): string {
      switch (path) {
        case ONE_CHILD:
          return "path-parent-one-child";
        case ONE_CHILD_XS:
          return "path-parent-one-child";
        case TWO_CHILDREN_LEFT_XS:
          return "path-parent-two-children-0";
        case TWO_CHILDREN_RIGHT_XS:
          return "path-parent-two-children-1";
        case THREE_CHILDREN_LEFT_XS:
          return "path-parent-three-children-0";
        case THREE_CHILDREN_RIGHT_XS:
          return "path-parent-three-children-2";
        default:
          return "none";
      }
    }
  }

  getLinkPathGenerator(): Link<any, DefaultLinkObject, [number, number]> {
    return link(curves.curveCustomBezier)
    .x((d) => d.x)
    .y((d) => d.y);
  }

  setNodeAndLinkEnterSelections(): void {
    const nodes = this._gNode!.selectAll("g.node").data(
      // Remove habits that weren't being tracked then
      this.rootData.descendants().reverse().filter((d) => {
        // const outOfBounds = outOfBoundsNode(d, this.rootData);
        // // Set new active node when this one is out of bounds
        // if (outOfBounds && this.activeNode?.data.name == d.data.name) {
        //   this.rootData.isNew = true;
        //   let newActive = this.rootData.find((n) => {
        //     return !n.data.content.match(/OOB/);
        //   });
        //   this.setActiveNode(newActive || this.rootData);
        //   this._zoomConfig.previousRenderZoom = { node: newActive };
        // }

        // return !outOfBounds;
        return true;
      }),
    );

    // Node enter selection
    this._enteringNodes = nodes
      .enter()
      .append("g")
      .attr("class", (d) => {
        return this.activeNode &&
          d.data.content === this.activeNode.data.content
          ? "the-node solid active"
          : "the-node solid";
      })
      .attr("data-testid", (d, i) => "test-node")
      .attr("transform", (d) => {
        return this.type == VisType.Cluster
          ? `translate(${d.y},${d.x})`
          : `translate(${d.x},${d.y})`;
      })
      .call(this.bindEventHandlers.bind(this));

    // Links enter selection
    const links = this._gLink!.selectAll("line.link")
      .data( this.rootData.links(), // .filter(
        //   ({ source, target }) =>
        //     !outOfBoundsNode(source, this.rootData) &&
        //     !outOfBoundsNode(target, this.rootData)
        // ) // Remove habits that weren't being tracked then
      );
    this._enteringLinks = links
      .enter()
      .append("path")
      .classed("link", true)
      // .attr("style", (d) => {
      //   console.log('d :>> ', d);
      //   return `transform: scaleY(${d.source.depth !== 0 ? 0.3 : 1}) translate(0px,${d.source.depth !== 0 ? 100 : 650}px)`
      // })
      .attr("stroke-width", LINK_THICKNESS)
      .attr("stroke", LINK_COLOR)
      .attr("d", this.getLinkPathGenerator() as any);
  }

  bindEventHandlers(selection) {
    selection.on("click", (e, d) => {
      store.set(currentOrbitIdAtom, d.data.content);
      this.eventHandlers.handleNodeClick!.call(this, e, d);
      this.eventHandlers.handleNodeZoom.call(this, e, d);
    });

    const debouncedZoom = debounce(() => Promise.resolve(this.eventHandlers.memoizedhandleNodeZoom.call(this, )), 1000)
    store.sub(currentOrbitIdAtom, () => {
      if (AppMachine.state.currentState !== "Vis") return;
      console.log("TRIGGERED ZOOM because of orbit id change")
      debouncedZoom();
      (this.eventHandlers as any).handleNodeClick.call(this, {} as any, {} as any);
    })
  }

  setNodeAndLabelGroups(): void {
    this._gCircle = this._enteringNodes!.append("g")
      .classed("node-subgroup", true)
      .attr("stroke-width", "0")
      .classed("checked", (d): boolean => {
        // if (!d?.data?.content || !this.nodeDetails[d.data.content])
        return false;
        // return store.get(currentOrbitIdAtom).id == d.data.content;
      });
  }

  appendNodeVectors(): void {
    this._gCircle!
    .append('foreignObject')
    .attr("transform", (d) => {
      const cachedNode = this.nodeDetails[d.data.content];
      const { scale } = cachedNode;

      return `scale(${this._viewConfig.isSmallScreen() ? getScaleForPlanet(scale) : 0.75})`;
    })
    .attr("width", "100")  
    .attr("height", "100") 
    .attr("x", "-50")      
    //@ts-expect-error
    .attr("y", (d: any) => {
      if (!d?.data?.content || !this.nodeDetails[d.data.content]) return "";
      const { scale } = this.nodeDetails[d.data.content];
      switch (scale) {
        case "Astro":
          return "-5";
        case "Sub":
          return "30";
        case "Atom":
          return "100";
        }
    })      
    .append("xhtml:div")
    .classed("node-vector-group", true)
    .append("xhtml:div")
    .classed("node-vector", true)
    .attr("xmlns", "http://www.w3.org/1999/xhtml")
    //@ts-expect-error
    .attr("style", (d: any) => {
      if (!d?.data?.content || !this.nodeDetails[d.data.content]) return "";
      const { scale } = this.nodeDetails[d.data.content];
      switch (scale) {
        case "Atom":
          return "background: url(/assets/moon.svg);background-position: bottom;background-size: cover;background-repeat: no-repeat;width: 100%;height: 100%;";
        case "Astro":
          return "background: url(/assets/sun.svg);background-position: bottom;background-size: cover;background-repeat: no-repeat;width: 100%;height: 100%;";
        case "Sub":
          return "background: url(/assets/planet.svg);background-position: bottom;background-size: cover;background-repeat: no-repeat;width: 100%;height: 100%;";
      }
    });
  }
}
