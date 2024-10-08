import { hierarchy, HierarchyNode, tree, TreeLayout } from "d3-hierarchy";
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
  XS_TREE_PATH_OFFSET_X,
  XS_TREE_PATH_OFFSET_Y,
} from "../constants";
import { BaseVisualization } from "./BaseVis";
import { select } from "d3-selection";
import { store } from "../../../state/jotaiKeyValueStore";
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
  byStartTime,
  chooseZoomScaleForOrbit,
  getInitialXTranslate,
  getInitialYTranslate,
  isSmallScreen,
  newXTranslate,
  newYTranslate,
} from "../helpers";
import { currentOrbitIdAtom, getOrbitAtom, getOrbitIdFromEh } from "../../../state/orbit";
import { EntryHashB64 } from "@holochain/client";
import { getHierarchyAtom } from "../../../state/hierarchy";
import { AppMachine } from "../../../main";

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
      margin: { ...margin, top: isSmallScreen() ? -150 : -400, left: isSmallScreen() ? 0 : -600 },
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
        this.modalOpen(true);
        this.modalIsOpen = true;
        this.modalChildOrbitEh(childOrbitEh);
      },
      handleAppendNode: function ({ parentOrbitEh }) {
        this.modalOpen(true);
        this.modalIsOpen = true;
        this.modalParentOrbitEh(parentOrbitEh);
      },
      //@ts-ignore
      handleNodeZoom: (event: any, node: HierarchyNode<NodeContent>) => {
        if (typeof node == undefined || Number.isNaN(node.x) || Number.isNaN(node.y)) return null;
        const id = store.get(getOrbitIdFromEh(node.data.content));
        const orbit = store.get(getOrbitAtom(id));

        const scale = (this._viewConfig.isSmallScreen() ? 0.5 : 1) * chooseZoomScaleForOrbit(orbit);
        const x = -(node as any).x * scale + this._viewConfig.canvasWidth / 2;
        const y = -(node as any).y * scale + this._viewConfig.canvasHeight / 2 - (this._viewConfig.isSmallScreen() ? 300 : 0);

        this._zoomConfig.globalZoomScale = scale;
        this._zoomConfig.focusMode = true;
        this._zoomConfig.previousRenderZoom = { event, node, scale };
        const isRootNode = store.get(getHierarchyAtom(node.data.content)) !== null
        isRootNode
          ? this.initializeZoomer()
          : this.resetZoomer();

        return this._canvas!
          //@ts-expect-error
          .transition()
          .duration(this.startInFocusMode ? 0 : 900)
          .attr("transform", `translate(${x},${y}) scale(${scale})`)
          .on("end", () => {
            this._zoomConfig.focusMode = true;
          }) as any;
      },

      memoizedhandleNodeZoom(id: EntryHashB64, foundNode?: HierarchyNode<NodeContent>) {
        if (id === this._lastOrbitId) {
          // console.log('Returned early from zoom... ');
          return select(null)
        }; // Memoization check
        this._lastOrbitId = id;

        const newId = foundNode?.data.content || id || store.get(currentOrbitIdAtom)?.id;
        if (!newId) return select(null);
        // TODO: figure out why nextRootData is needed, maybe calculate new layout information for this purpose
        const node = foundNode || this.rootData.find(node => node.data.content == newId) || (hierarchy(this._nextRootData).sort(byStartTime).find(node => node.data.content == newId));
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
      handleNodeClick() {
        this._enteringNodes.select("foreignObject").html(this.appendLabelHtml);
        this._gCircle.classed("checked", (d): boolean => {
          // if (!d?.data?.content || !this.nodeDetails[d.data.content])
          return false;
          // return store.get(currentOrbitIdAtom) == d.data.content;
        });
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
      .attr("stroke-width", "3")
      .attr("stroke", "#fefefe")
      .attr("stroke-opacity", "0.3")
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
    return linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);
  }

  setNodeAndLinkEnterSelections(): void {
    const nodes = this._gNode!.selectAll("g.node").data(
      // Remove habits that weren't being tracked then
      this.rootData.descendants().filter((d) => {
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
    const links = this._gLink!.selectAll("line.link").data(
      this.rootData.links(),
      // .filter(
      //   ({ source, target }) =>
      //     !outOfBoundsNode(source, this.rootData) &&
      //     !outOfBoundsNode(target, this.rootData)
      // ) // Remove habits that weren't being tracked then
    );
    this._enteringLinks = links
      .enter()
      .append("path")
      .classed("link", true)
      .attr("stroke", "#fefefe")
      .attr("stroke-width", "3")
      .attr("stroke-opacity", (d): number => {
        const parent = d.source?.data?.content;
        const child = d.target?.data?.content;
        if (
          !parent ||
          !this.nodeDetails[parent] ||
          !child ||
          !this.nodeDetails[child]
        )
          return 0;
        const cachedNodeParent = Object.values(this.nodeDetails).find(
          (n) => n.eH == parent,
        );
        const cachedNodeChild = Object.values(this.nodeDetails).find(
          (n) => n.eH == child,
        );
        // TODO: wire up to wins
        // if (cachedNodeChild?.checked && cachedNodeParent?.checked) return 1;
        return 0.5;
      })
      .attr("d", this.getLinkPathGenerator() as any);
  }

  bindEventHandlers(selection) {
    selection.on("click", (e, d) => {
      store.set(currentOrbitIdAtom, d.data.content);
      this.eventHandlers.handleNodeClick!.call(this, e, d);
      this.eventHandlers.handleNodeZoom.call(this, e, d);
    });

    store.sub(currentOrbitIdAtom, () => {
      if (AppMachine.state.currentState !== "Vis") return;
      this.eventHandlers.memoizedhandleNodeZoom.call(this, store.get(currentOrbitIdAtom)?.id);
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
    this._gTooltip = this.clearAndRedrawLabels();
  }

  appendNodeVectors(): void {
    this._gCircle!.html((d): string => {
      if (!d?.data?.content || !this.nodeDetails[d.data.content]) return "";
      const { scale } = this.nodeDetails[d.data.content];
      switch (scale) {
        case "Atom":
          return `<g transform="scale(0.5), translate(${60},${56.75 / 2})"><ellipse id="circle1244" cx="59.97" cy="56.75" rx="54.09" ry="51.72" transform="translate(2.76 116.29) rotate(-89.56)" fill="#fff" stroke="currentColor" stroke-miterlimit="50" stroke-width="5.31"/><ellipse id="circle1246" cx="59.97" cy="56.68" rx="43.22" ry="45.42" fill="#997ae8" stroke="#37383a" stroke-miterlimit="50" stroke-width="4.79"/><path id="path1255" d="M42.92,27.11a2.23,2.23,0,0,0-3.47-1.79A38.23,38.23,0,0,0,24.81,47.56a2.29,2.29,0,0,0,2.47,2.85,2.55,2.55,0,0,0,2.14-2A33.34,33.34,0,0,1,41.83,29.56a2.71,2.71,0,0,0,1.09-2.45ZM63.76,94.52h0Z" fill="#fff" fill-rule="evenodd"/><ellipse id="circle1257" cx="25.28" cy="56.19" rx="2.34" ry="2.46" fill="#fff"/><path id="path1259" d="M98.21,17.16c-.46-3.73-1.73-6.12-3.41-7.55s-4.16-2.23-7.73-1.93-8,1.73-13,4.4q-1.94,1-3.94,2.3a2.17,2.17,0,0,1-1.63.29c-2-.45-2.67-3.28-.94-4.39C80,2.42,91.24.26,97.74,5.8c11.46,9.75,3.8,39.65-17.11,66.78S33.49,113.81,22,104.06c-6-5.1-6.75-15.7-3.13-28.54a2.28,2.28,0,0,1,4.28-.1,2.44,2.44,0,0,1,.14,1.7L23,78.47A39.54,39.54,0,0,0,21.57,92.7c.45,3.73,1.72,6.12,3.4,7.55s4.17,2.24,7.73,1.93,8-1.73,13-4.39C55.56,92.47,66.86,82.66,77,69.5S93.92,42.68,96.81,31.4a39.58,39.58,0,0,0,1.4-14.23Z" fill="#37383a" fill-rule="evenodd"/><path id="path1261" d="M46.79,82.53a2.26,2.26,0,0,1-2.29,1.33C19,81.05.22,70.53,0,57.64c-.14-8.27,7.42-15.85,19.56-21.21,1.86-.82,3.62,1.39,2.83,3.34A2.37,2.37,0,0,1,21.19,41c-.66.29-1.3.59-1.93.9A35.92,35.92,0,0,0,8,50c-2.42,2.76-3.34,5.32-3.31,7.59s1,4.79,3.56,7.47a35.8,35.8,0,0,0,11.54,7.6A86.42,86.42,0,0,0,44.9,79a2.49,2.49,0,0,1,1.89,3.55ZM52.7,81a2.38,2.38,0,0,1,2.2-1.39c1.85,0,3.73.06,5.63,0C76.64,79.38,91,76.06,101,71.14a36,36,0,0,0,11.27-8c2.42-2.76,3.35-5.32,3.31-7.59s-1.05-4.79-3.56-7.47a35.69,35.69,0,0,0-11.53-7.6c-.57-.26-1.16-.5-1.76-.75a4.19,4.19,0,0,1-2.16-2.09c-.79-1.69.69-3.71,2.37-3.07,12.92,4.91,21.17,12.38,21.31,20.89C120.55,70.92,93.83,84,60.61,84.58q-3,.06-5.92,0a2.43,2.43,0,0,1-2-3.52Z" fill="#37383a" fill-rule="evenodd"/><ellipse id="circle1263" cx="12.29" cy="14.42" rx="4.09" ry="4.3" fill="#fbc82b"/><ellipse id="circle1265" cx="20.58" cy="9.19" rx="1.75" ry="1.84" fill="#f7931b"/><ellipse id="circle1267" cx="101.91" cy="100.18" rx="2.92" ry="3.07" fill="#f7931b"/><ellipse id="circle1273" cx="58.57" cy="66.09" rx="2.34" ry="2.46" fill="#37383a"/><ellipse id="circle1275" cx="52.15" cy="60.63" rx="2.92" ry="3.07" fill="#37383a"/><ellipse id="circle1277" cx="51.26" cy="69.37" rx="1.17" ry="1.23" fill="#37383a"/></g>`;
        case "Astro":
          return '<g transform="scale(1)"><circle cx="60.91" cy="60.1" r="54.18" fill="#fff" stroke="currentColor" stroke-miterlimit="0" stroke-width="4.87"></circle><circle cx="60.91" cy="60.1" r="45.09" fill="#92a8d4" stroke="#3c3c3c" stroke-miterlimit="19.5" stroke-width="5"></circle><path d="M43.35,30.73a2.34,2.34,0,0,0-3.63-1.79A37.86,37.86,0,0,0,24.45,51,2.33,2.33,0,0,0,27,53.86a2.64,2.64,0,0,0,2.23-2,33,33,0,0,1,13-18.73A2.65,2.65,0,0,0,43.35,30.73Z" fill="#fff" fill-rule="evenodd"></path><circle cx="24.93" cy="59.59" r="2.44" fill="#fff"></circle><path d="M17.81,55.53A2.37,2.37,0,0,0,18.7,54c.3-2.08-2-3.74-3.71-2.45C4,60-1.79,69.4.49,77.35c4.24,14.78,34.69,19,68,9.47s56.9-29.28,52.66-44.07a14.94,14.94,0,0,0-6.15-8,2.26,2.26,0,0,0-3.31.95l-.88,1.77a.36.36,0,0,0,.14.47c3.22,1.89,4.89,4,5.51,6.2s.35,4.87-1.39,8.17-4.84,7-9.29,10.74c-8.9,7.44-22.47,14.49-38.63,19.13S35.75,88,24.26,86.38a37.51,37.51,0,0,1-13.57-4.17c-3.22-1.89-4.89-4-5.51-6.2s-.35-4.87,1.38-8.18a37.57,37.57,0,0,1,9.3-10.74q.95-.78,1.95-1.56Zm89.35-21.72a2.58,2.58,0,0,1-3,1.3,50.06,50.06,0,0,0-6.75-1.39c-.75-.1-1.51-.19-2.29-.27a2.38,2.38,0,0,1-1.56-.84c-1.36-1.61-.24-4.24,1.85-4a57.69,57.69,0,0,1,10.39,1.94A2.33,2.33,0,0,1,107.16,33.81Z" fill="#37383a" fill-rule="evenodd"></path><circle cx="76.96" cy="101.65" r="6.09" fill="#e83962" stroke="#37383a" stroke-miterlimit="19.5" stroke-width="2.8"></circle><circle cx="91.02" cy="8.53" r="6.09" fill="#e83962" stroke="#37383a" stroke-miterlimit="19.5" stroke-width="2.8"></circle><circle cx="62.6" cy="70.33" r="2.44" fill="#37383a"></circle><circle cx="33.89" cy="77.03" r="4.27" fill="#d2e1fb" stroke="#37383a" stroke-miterlimit="19.5" stroke-width="2.8"></circle><path d="M53.58,48.61a6.71,6.71,0,1,1-7.37-6,6.61,6.61,0,0,1,4.06.87,2.46,2.46,0,0,0,2.09.26,1.65,1.65,0,0,0,.57-2.89,10.35,10.35,0,1,0,4.28,7.34,1.41,1.41,0,0,0-2-1.09l-1.05.4A1,1,0,0,0,53.58,48.61Z" fill="#37383a" fill-rule="evenodd"></path></g>';
        case "Sub":
          return `<g transform="scale(0.75), translate(${20},${56.75 / 3})"><path id="circle1184" d="M110.83,51.07a54.37,54.37,0,0,1-48.39,59.76h0A54.37,54.37,0,0,1,2.68,62.44h0A54.37,54.37,0,0,1,51.07,2.68h0a54.37,54.37,0,0,1,59.76,48.39Z" fill="#fff" stroke="currentColor" stroke-miterlimit="37.8" stroke-width="4.75" style="stroke-opacity:1" /> <path id="circle1201" d="M102.75,51.92a46.25,46.25,0,1,1-92,9.67h0A46.25,46.25,0,0,1,51.92,10.76h0A46.25,46.25,0,0,1,102.75,51.92Z" fill="#7599ea" /> <path id="circle1203" d="M24.89,28.68a10.62,10.62,0,1,1-11.67-9.45h0a10.61,10.61,0,0,1,11.67,9.45Z" fill="#8b67e5" stroke="#37383a" stroke-miterlimit="37.8" stroke-width="5" style="stroke-width:3;stroke-miterlimit:37.79999924;stroke-dasharray:none" /> <path id="path1205" d="M100.26,52.18a43.73,43.73,0,1,1-22.94-34,2.64,2.64,0,0,0,3.18-.5,2.42,2.42,0,0,0-.57-3.78A48.67,48.67,0,1,0,99.84,33.93a2.41,2.41,0,0,0-3.93-.44,2.63,2.63,0,0,0-.36,3,43.76,43.76,0,0,1,4.71,15.68Z" fill="#37383a" fill-rule="evenodd" /> <path id="circle1210" d="M98.2,52.66a43.21,43.21,0,0,1-85.95,9h0A43.21,43.21,0,0,1,50.71,14.21h0A43.2,43.2,0,0,1,98.2,52.66Z" fill="#5380e5" /> <path id="path1214" d="M38.74,26.63A2.4,2.4,0,0,0,35,24.8,38.87,38.87,0,0,0,19.35,47.45,2.4,2.4,0,0,0,22,50.36a2.7,2.7,0,0,0,2.29-2A33.86,33.86,0,0,1,37.58,29.11,2.71,2.71,0,0,0,38.74,26.63Z" fill="#fff" fill-rule="evenodd" /> <path id="circle1226" d="M22.34,56a2.5,2.5,0,1,1-2.75-2.22h0A2.49,2.49,0,0,1,22.34,56Z" fill="#fff" /> <path id="circle1228" d="M25.58,65.06a1.87,1.87,0,0,1-1.67,2.06h0a1.87,1.87,0,0,1-2.06-1.67h0a1.87,1.87,0,0,1,1.67-2.06h0a1.87,1.87,0,0,1,2.06,1.67Z" fill="#37383a" /> <path id="circle1230" d="M68.2,58.06a1.88,1.88,0,0,1-1.67,2.07h0a1.88,1.88,0,0,1-2.06-1.67h0a1.87,1.87,0,0,1,1.67-2.06h0a1.87,1.87,0,0,1,2.06,1.66Z" fill="#37383a" /> <path id="circle1232" d="M38.3,60.58a3.12,3.12,0,1,1-3.43-2.78A3.12,3.12,0,0,1,38.3,60.58Z" fill="#37383a" /> <path id="circle1234" d="M105,100.7a3.12,3.12,0,1,1-3.43-2.78h0A3.13,3.13,0,0,1,105,100.7Z" fill="#8b67e5" /> <path id="circle1238" d="M92.45,19.7a6.87,6.87,0,1,1-7.55-6.12A6.87,6.87,0,0,1,92.45,19.7Z" fill="#fbc82b" stroke="#37383a" stroke-miterlimit="37.8" stroke-width="5" style="stroke-width:3;stroke-miterlimit:37.79999924;stroke-dasharray:none" /></g>`;
        default:
          return "";
      }
    });
  }
}
