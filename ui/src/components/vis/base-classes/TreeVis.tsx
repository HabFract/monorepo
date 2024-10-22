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
  XS_TREE_PATH_OFFSET_X,
  XS_TREE_PATH_OFFSET_Y,
} from "../constants";
import { BaseVisualization } from "./BaseVis";
import { select } from "d3-selection";
import { easeCubicOut } from "d3-ease";
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
        const orbit = store.get(getOrbitNodeDetailsFromIdAtom(id));
        const isRootNode = store.get(getHierarchyAtom(node.data.content)) !== null
        const zoomOffsetY = -(this._viewConfig.isSmallScreen() ? isRootNode ? 300 : 100 : 0)
        const scale = (this._viewConfig.isSmallScreen() ? 0.5 : 1) * chooseZoomScaleForOrbit(orbit);
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

        return this._canvas! && NODE_ENV !== 'test'
          //@ts-expect-error
          .transition()
          .duration(this.startInFocusMode ? 0 : 750)
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

    const debouncedZoom = debounce(() => Promise.resolve(this.eventHandlers.memoizedhandleNodeZoom.call(this, store.get(currentOrbitIdAtom)?.id)), 1000)
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
    this._gTooltip = this.clearAndRedrawLabels();
  }

  appendNodeVectors(): void {
    this._gCircle!.html((d): string => {
      if (!d?.data?.content || !this.nodeDetails[d.data.content]) return "";
      const { scale } = this.nodeDetails[d.data.content];
      switch (scale) {
        case "Atom":
          return `<g clip-path="url(#C)"><mask id="A" maskUnits="userSpaceOnUse" x="25" y="-1" width="93" height="93"><path d="M113.932 62.982c9.622-23.29-1.503-49.951-24.849-59.551S39.009 4.93 29.387 28.22s1.503 49.951 24.849 59.551 50.073-1.499 59.696-24.789z" fill="#fff"/></mask><g mask="url(#A)"><path d="M113.932 62.982c9.622-23.29-1.503-49.951-24.849-59.551S39.009 4.93 29.387 28.22s1.503 49.951 24.849 59.551 50.073-1.499 59.696-24.789z" fill="url(#B)"/><g style="mix-blend-mode:overlay"><path d="M97.25 30.133c-.437-1.924.169-4.105 1.7-5.354.318-.258.636-.446.964-.575-1.173-.535-2.485-.526-3.707.466-1.531 1.249-2.127 3.431-1.7 5.354.437 1.924 1.799 3.56 3.499 4.581.875.526 1.908.902 2.902.704.209-.04.408-.119.607-.208a7.87 7.87 0 0 1-.766-.387c-1.699-1.011-3.061-2.657-3.498-4.581z" fill="#f15b60"/><path d="M103.999 30.916c.01-1.577-.617-3.094-1.491-4.402-.656-.982-1.581-1.854-2.594-2.31-.328.129-.646.317-.964.575-1.531 1.249-2.127 3.431-1.7 5.354s1.799 3.56 3.498 4.581c.249.149.507.278.766.387l.377-.188c1.352-.803 2.098-2.429 2.108-3.996z" fill="#f8a283"/></g><path opacity=".59" d="M94.864 64.57c-2.763 1.418-4.463 4.74-3.817 7.774s3.688 5.414 6.789 5.166c2.982-.238 5.367-2.578 7.057-5.047 1.272-1.864 2.336-3.996 2.266-6.247-.079-2.39-1.829-5.126-4.433-4.541-1.232.278-2.445 1.14-3.677 1.527-1.401.446-2.863.694-4.185 1.368z" fill="#f8a283"/><g style="mix-blend-mode:overlay"><path d="M66.695 27.743c1.362 4.69.904 9.896 3.111 14.258 1.113 2.191 2.823 4.016 4.662 5.642 6.699 5.939 15.486 9.995 19.82 17.818.785 1.418 1.412 2.975 1.451 4.601.05 2.29-1.083 4.462-2.564 6.207-5.069 5.989-13.727 7.566-21.569 7.169-3.529-.178-7.067-.674-10.377-1.884-7.316-2.677-13.051-8.696-16.719-15.547-3.668-6.861-6.938-14.377-8.26-22.042-.984-5.721-.229-11.879 1.521-17.411 1.759-5.563 8.3-12.603 14.711-12.057 6.511.555 12.504 7.367 14.214 13.257v-.01z" fill="#f8a283"/></g><g style="mix-blend-mode:overlay"><path d="M42.949 61.436c12.663 2.836 25.704-1.329 38.218-4.769s26.36-6.068 38.079-.516c1.302.615 2.674 2.4 1.491 3.223-24.899-8.964-52.312 9.192-78.374 4.551-3.24-.575-23.656-7.189-20.615-11.323 1.948-2.647 17.524 8.002 21.201 8.825v.01z" fill="#ee3372"/></g><g style="mix-blend-mode:overlay"><path d="M58.574 73.712c4.632-.258 9.184-1.269 13.816-1.507 9.83-.506 19.452 2.469 29.083 4.531 4.94 1.061 10.755 1.666 14.423-1.805 2.862-2.707 3.389-7 3.657-10.927.07-.972.12-1.983-.288-2.866-.477-1.021-1.491-1.676-2.485-2.221-8.021-4.393-17.911-5.235-26.559-2.261-1.998.684-3.936 1.567-5.964 2.172-2.197.654-4.473.962-6.739 1.279l-17.394 2.39c-5.119.704-10.357 1.408-15.436.416-6.56-1.269-12.216-5.573-18.756-6.723-5.208-.922-4.036 2.162-1.481 5.344 7.475 9.301 22.762 12.831 34.143 12.186l-.02-.01z" fill="#ef4683"/></g><g style="mix-blend-mode:overlay"><path d="M21.996 34.228c5.487 7.466 13.637 13.852 22.921 13.941 9.612.099 17.852-6.366 25.644-11.978 7.355-5.305 15.198-10.193 23.905-12.741 8.718-2.548 18.468-2.558 26.539 1.596" stroke="#ef4683" stroke-width="3" stroke-miterlimit="10"/></g><g style="mix-blend-mode:overlay"><path d="M33.745 51.233c4.781 3.213 10.437 5.424 16.202 5.156 10.069-.466 18.13-8.071 27.185-12.474a44.9 44.9 0 0 1 24.551-4.204c5.268.595 10.585 2.132 15.794 1.12.825-.159 1.719-.436 2.177-1.14.367-.555.387-1.269.397-1.944.04-3.698.03-7.635-1.958-10.748-2.405-3.778-7.157-5.414-11.629-5.622-9.095-.416-17.703 3.956-25.257 9.023-7.544 5.077-14.621 11.036-23.03 14.526-8.399 3.49-18.756 4.065-26.052-1.358-1.978-1.477-7.862-8.061-7.902-2.162-.03 3.937 6.669 7.922 9.512 9.836l.01-.01z" fill="#ee3372"/></g><g style="mix-blend-mode:overlay"><path d="M71.049 9.935c.547-1.834 1.759-3.51 3.469-4.383 1.56-.793 3.528-.823 5.039.04-.219-.526-.596-1.001-1.163-1.418-1.541-1.13-3.747-1.17-5.457-.297s-2.922 2.548-3.469 4.383c-.278.942-.388 2.003.04 2.885.149.307.358.585.606.823.268.258.566.476.885.644-.328-.843-.219-1.805.04-2.677h.01z" fill="#f15b60"/><path d="M78.175 10.52c1.242-1.378 2.047-3.332 1.372-4.918-1.511-.863-3.479-.833-5.039-.04-1.71.873-2.922 2.548-3.469 4.383-.258.873-.368 1.844-.04 2.677 1.014.535 2.256.644 3.379.367 1.481-.367 2.763-1.329 3.787-2.459l.01-.01z" fill="#f8a283"/></g><g style="mix-blend-mode:overlay"><path d="M103.214 48.487a1 1 0 0 1 .019-.962c.169-.278.507-.496.885-.555a.96.96 0 0 0-.398-.059c-.417.02-.815.258-.994.565s-.168.664-.019.962c.079.159.198.307.397.377.07.02.139.04.219.04l.238-.01a.75.75 0 0 1-.347-.357z" fill="#f15b60"/><path d="M104.545 47.773c.03-.317-.089-.664-.417-.803-.378.05-.716.278-.885.555-.179.307-.169.664-.02.962a.68.68 0 0 0 .348.357c.249-.04.477-.169.646-.327.209-.218.309-.486.338-.744h-.01z" fill="#f8a283"/></g><g style="mix-blend-mode:multiply"><path d="M56.716 21.457c-1.998 1.715-4.085 3.48-6.63 4.174-2.544.684-5.675-.04-6.938-2.36-.407-.744-.566-1.547-.586-2.37-.517 1.785-.716 3.619.139 5.206 1.252 2.31 4.393 3.044 6.938 2.36s4.632-2.449 6.63-4.174c2.117-1.825 4.264-3.679 5.795-6.019.905-1.398 1.59-2.995 1.581-4.66 0-.129 0-.248-.02-.377-.278.773-.676 1.507-1.123 2.201-1.521 2.34-3.668 4.194-5.795 6.019h.01z" fill="#dc4a9a"/></g><g style="mix-blend-mode:overlay"><path d="M52.909 9.529c-2.634.545-5.178 1.824-6.878 3.897-1.272 1.557-2.018 3.47-2.733 5.354l-.736 2.122c.01.823.179 1.626.587 2.37 1.252 2.31 4.393 3.044 6.938 2.36s4.632-2.459 6.63-4.174c2.117-1.824 4.264-3.679 5.795-6.019.447-.684.845-1.428 1.123-2.201-.338-5.196-6.948-4.512-10.715-3.718l-.01.01z" fill="#ee3372"/></g><g style="mix-blend-mode:overlay"><path d="M68.037 27.327a5.67 5.67 0 0 0 2.217.724c.964.099 1.978-.069 2.763-.635.417-.307.755-.704 1.093-1.11l.358-.476c-.08-.892-.368-1.755-.646-2.608-.219-.655-.457-1.339-.974-1.805-.636-.565-1.58-.674-2.405-.466s-1.551.694-2.227 1.21c-.537.406-1.074.853-1.382 1.448-.547 1.041-.507 2.023-.109 2.875.378-.069.994.654 1.332.843h-.02z" fill="#ee3372"/></g><g style="mix-blend-mode:multiply"><path d="M70.681 29.389c.845.188 1.779.139 2.505-.337.885-.585 1.302-1.695 1.302-2.746l-.02-.476a4.27 4.27 0 0 1-.358.476c-.328.397-.666.803-1.093 1.11-.785.565-1.799.734-2.763.635a5.46 5.46 0 0 1-2.216-.724c-.328-.188-.954-.912-1.332-.843.686 1.467 2.415 2.558 3.976 2.915v-.01z" fill="#dc4a9a"/></g><g style="mix-blend-mode:overlay"><path d="M89.507 47.009c-.268.526-.418 1.111-.447 1.696-.03.724.139 1.487.596 2.052.249.307.567.536.885.773.119.089.239.178.378.248.666-.099 1.312-.347 1.938-.605.487-.198.994-.407 1.322-.813.398-.506.447-1.22.249-1.834-.189-.615-.586-1.14-1.004-1.626-.328-.387-.686-.773-1.153-.982-.815-.367-1.551-.297-2.177.04.07.278-.447.773-.576 1.031l-.01.02z" fill="#ee3372"/></g><g style="mix-blend-mode:multiply"><path d="M88.065 49.082c-.109.645-.03 1.349.358 1.864.477.645 1.332.902 2.137.863.119 0 .239-.02.358-.04-.129-.069-.258-.159-.378-.248-.318-.228-.636-.466-.885-.773-.457-.565-.626-1.329-.596-2.053.03-.595.189-1.17.447-1.696.129-.258.646-.764.577-1.031-1.083.575-1.829 1.924-2.028 3.113h.01z" fill="#dc4a9a"/></g><path d="M88.811 12.414c-.129.575.03 1.18.239 1.735.368.982.974 1.993 1.968 2.31.646.198 1.342.079 2.008.188.457.069.914.258 1.382.198.944-.119 1.511-1.249 1.302-2.181s-.954-1.646-1.759-2.171c-1.203-.783-4.582-2.499-5.139-.079zm-7.107 2.677c-.278-.149-.606-.139-.914-.109-.547.059-1.143.228-1.441.694-.189.298-.219.674-.358.992-.099.228-.249.436-.278.674-.07.496.437.932.944.952s.964-.268 1.342-.605c.557-.506 1.879-2.003.716-2.608l-.01.01z" fill="#f8a283"/></g><path d="M112.626 94.98c-7.991.416-15.108-5.87-17.603-12.652-1.63-4.452-1.759-9.41-.477-13.981-11.908.714-22.99 4.551-31.24 8.319-5.069 2.31-12.007 5.483-17.444 2.251-1.64-.972-2.843-2.39-3.698-3.976l-1.59.704-2.753 1.23c-6.332 2.885-14.661 5.999-23.06 4.393C7.226 79.819-.547 73.077.03 64.698c.199-2.885 1.372-5.87 3.479-8.855 4.861-6.881 15.287-11.413 22.454-12.176l-.03 1.081c-7.047.754-17.086 5.275-21.609 11.671-2.008 2.836-3.111 5.652-3.3 8.359-.547 7.833 6.809 14.159 13.926 15.518 8.121 1.547 16.261-1.497 22.454-4.323l2.763-1.23 1.561-.694c-.915-2.102-1.282-4.422-1.272-6.445.04-4.978 2.554-11.066 7.962-12.652 2.525-.744 5.497.744 7.067 3.52 1.431 2.519 1.71 6.346-1.779 9.569-3.071 2.836-6.849 4.759-10.655 6.485.765 1.418 1.849 2.677 3.3 3.53 4.99 2.965 11.391.049 16.52-2.3 11.053-5.047 21.857-7.873 31.956-8.418a22.21 22.21 0 0 1 2.545-5.265c4.105-6.207 10.854-9.866 17.375-13.406l4.095-2.261a99.84 99.84 0 0 0 20.654-15.647c2.108-2.072 4.095-4.373 4.433-7.08.279-2.221-.616-4.74-2.494-7.109-3.996-5.007-15.546-11.274-36.698-2.419l-.914-.882c6.739-2.826 13.965-4.333 20.376-4.373 8.071-.04 14.293 2.4 18.011 7.05 2.057 2.578 3.012 5.364 2.703 7.843-.377 3.014-2.484 5.463-4.721 7.665-6.232 6.148-13.249 11.462-20.863 15.805-1.352.773-2.724 1.517-4.115 2.271-6.411 3.48-13.051 7.08-17.017 13.088a20.85 20.85 0 0 0-2.306 4.67c5.596-.218 10.963.278 16.033 1.487 6.023 1.438 9.979 3.817 12.086 7.288 1.879 3.084 1.958 6.99.219 10.729-1.988 4.283-5.854 7.357-10.099 8.031-.507.079-1.014.129-1.52.159h.019zM95.59 68.288c-1.322 4.452-1.233 9.331.368 13.693 2.505 6.832 9.929 13.128 18.03 11.859 3.916-.625 7.505-3.48 9.353-7.466 1.591-3.431 1.531-7-.169-9.796-1.968-3.233-5.715-5.463-11.47-6.842-5.407-1.289-10.844-1.686-16.122-1.448h.01zM49.579 55.755c-.288.02-.577.059-.865.149-4.93 1.448-7.216 7.08-7.256 11.71-.02 1.894.328 4.075 1.173 6.029 3.747-1.696 7.435-3.589 10.417-6.326 2.604-2.4 3.2-5.513 1.59-8.349-1.173-2.062-3.191-3.302-5.069-3.203l.01-.01z" fill="#ffd981"/></g><defs><radialGradient id="B" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(46.5367 98.5207) rotate(-2.9528) scale(152.076 151.707)"><stop offset=".31" stop-color="#ef4e87"/><stop offset=".52" stop-color="#f3735d"/><stop offset=".72" stop-color="#f7923d"/><stop offset=".89" stop-color="#faa429"/><stop offset="1" stop-color="#fbab22"/></radialGradient><clipPath id="C"><path fill="#fff" d="M0 0h145v95H0z"/></clipPath></defs>`;
        case "Astro":
          return '<g clip-path="url(#g)"><path d="M114.9 4.22a3.04 3.04 0 0 0 .29 2.76c.28.42.67.77 1.09 1.06.48.32 1.01.58 1.59.62 1.14.08 2.16-.67 3.05-1.39.32-.26.66-.53.82-.91.13-.3.13-.65.09-.98-.14-1.02-.74-1.96-1.61-2.51-1.71-1.07-4.51-.66-5.32 1.35z" fill="url(#A)"/><path d="M37.47 142.36c.42 1.09 1.39 1.94 2.52 2.22.6.15 1.23.14 1.84.04.69-.1 1.38-.32 1.92-.75 1.08-.86 1.37-2.37 1.57-3.74.07-.49.15-1.01-.02-1.48-.13-.38-.41-.69-.72-.94a4.31 4.31 0 0 0-3.49-.91c-2.4.45-4.56 3.11-3.62 5.56z" fill="url(#B)"/><path d="M116.39 16.32c-.38.96-.26 2.1.31 2.95.3.45.72.82 1.17 1.13.51.35 1.09.62 1.7.66 1.22.09 2.31-.72 3.26-1.49.34-.28.7-.57.88-.98.14-.33.14-.69.1-1.04-.15-1.09-.8-2.1-1.73-2.68-1.83-1.15-4.83-.71-5.69 1.45z" fill="url(#C)"/><path d="M106.89 143.32c-.38.96-.26 2.1.31 2.95.3.45.72.82 1.17 1.13.51.35 1.09.62 1.7.66 1.22.09 2.31-.72 3.26-1.49.34-.28.7-.57.88-.98.14-.33.14-.69.1-1.04-.15-1.09-.8-2.1-1.73-2.68-1.83-1.15-4.83-.71-5.69 1.45z" fill="url(#D)"/><path d="M135.74 35.21c-.42.06-.8.34-.99.72-.1.2-.15.43-.16.65-.02.25 0 .51.12.74.22.45.73.67 1.21.85.17.07.35.13.53.11.14-.02.28-.09.39-.18.36-.28.58-.72.6-1.17.03-.89-.74-1.87-1.69-1.73l-.01.01z" fill="url(#E)"/><path d="M158.74 87.48c-.42.06-.8.34-.99.72-.1.2-.15.43-.16.65-.02.25 0 .51.12.74.22.45.73.67 1.21.85.17.07.35.13.53.11.14-.02.28-.09.39-.18.36-.28.58-.72.6-1.17.03-.89-.74-1.87-1.69-1.73l-.01.01z" fill="url(#F)"/><path d="M155.64 75.15c-.42.06-.8.34-.99.72-.1.2-.15.43-.16.65-.02.25 0 .51.12.74.22.45.73.67 1.21.85.17.07.35.13.53.11.14-.02.28-.09.39-.18.36-.28.58-.72.6-1.17.03-.89-.74-1.87-1.69-1.73l-.01.01z" fill="url(#G)"/><path d="M144.82 31.16c-.42.06-.8.34-.99.72-.1.2-.15.43-.16.65-.02.25 0 .51.12.74.22.45.73.67 1.21.85.17.07.35.13.53.11.14-.02.28-.09.39-.18.36-.28.58-.72.6-1.17.03-.89-.74-1.87-1.69-1.73l-.01.01z" fill="url(#H)"/><path d="M147.83 104.38c-.42.06-.8.34-.99.72-.1.2-.15.43-.16.65-.02.25 0 .51.12.74.22.45.73.67 1.21.85.17.07.35.13.53.11.14-.02.28-.09.39-.18.36-.28.58-.72.6-1.17.03-.89-.74-1.87-1.69-1.73l-.01.01z" fill="url(#I)"/><path d="M152.53 35.13a1.35 1.35 0 0 0 .21 1.21c.14.18.32.32.51.43a1.53 1.53 0 0 0 .72.23c.5 0 .93-.36 1.3-.7.13-.12.27-.25.33-.43.05-.14.04-.29.01-.43a1.55 1.55 0 0 0-.78-1.05c-.78-.42-2-.16-2.3.75v-.01z" fill="url(#J)"/><path d="M7.57 68.61a2.36 2.36 0 0 0-1.74 1.27c-.17.35-.25.75-.28 1.14-.03.44 0 .9.2 1.3.39.8 1.29 1.18 2.12 1.5.3.12.61.23.93.19.25-.03.49-.16.69-.32.63-.49 1.02-1.26 1.05-2.05.05-1.56-1.31-3.28-2.97-3.03z" fill="url(#K)"/><path d="M20.03 116.67a2.36 2.36 0 0 0-1.74 1.27c-.17.35-.25.75-.28 1.14-.03.44 0 .9.2 1.3.39.8 1.29 1.18 2.12 1.5.3.12.61.23.93.19.25-.03.49-.16.69-.32.63-.49 1.02-1.26 1.05-2.05.05-1.56-1.31-3.28-2.97-3.03z" fill="url(#L)"/><path d="M19.65 62.67a2.36 2.36 0 0 0-1.74 1.27c-.17.35-.25.75-.28 1.14-.03.44 0 .9.2 1.3.39.8 1.29 1.18 2.12 1.5.3.12.61.23.93.19.25-.03.49-.16.69-.32.63-.49 1.02-1.26 1.05-2.05.05-1.56-1.31-3.28-2.97-3.03z" fill="url(#M)"/><path d="M142.79 122.03c-.48.07-.92.39-1.13.83-.11.23-.17.49-.18.74-.02.29 0 .59.13.85.25.52.84.77 1.38.98.19.08.4.15.61.13.17-.02.32-.11.45-.21a1.81 1.81 0 0 0 .69-1.34c.03-1.02-.85-2.14-1.94-1.98h-.01z" fill="url(#N)"/><path d="M147.57 41.61a2.36 2.36 0 0 0-1.74 1.27c-.17.35-.25.75-.28 1.14-.03.44 0 .9.2 1.3.39.8 1.29 1.18 2.12 1.5.3.12.61.23.93.19.25-.03.49-.16.69-.32.63-.49 1.02-1.26 1.05-2.05.05-1.56-1.31-3.28-2.97-3.03z" fill="url(#O)"/><path d="M151.15 86.67a2.36 2.36 0 0 0-1.74 1.27c-.17.35-.25.75-.28 1.14-.03.44 0 .9.2 1.3.39.8 1.29 1.18 2.12 1.5.3.12.61.23.93.19.25-.03.49-.16.69-.32.63-.49 1.02-1.26 1.05-2.05.05-1.56-1.31-3.28-2.97-3.03z" fill="url(#P)"/><path d="M162.6 66.33a1.34 1.34 0 0 0-.94-.79 1.68 1.68 0 0 0-.67 0 1.42 1.42 0 0 0-.69.29c-.39.32-.48.87-.54 1.38-.02.18-.04.37.02.54.05.14.16.25.27.34.35.28.84.39 1.28.3.87-.19 1.63-1.17 1.27-2.06z" fill="url(#Q)"/><path d="M155.24 53.78a1.34 1.34 0 0 0-.94-.79 1.68 1.68 0 0 0-.67 0 1.42 1.42 0 0 0-.69.29c-.39.32-.48.87-.54 1.38-.02.18-.04.37.02.54.05.14.16.25.27.34.35.28.84.39 1.28.3.87-.18 1.63-1.17 1.27-2.06z" fill="url(#R)"/><path d="M151.97 64.44a1.52 1.52 0 0 0-1.07-.9c-.25-.05-.51-.04-.77 0-.29.05-.57.15-.79.33-.44.37-.55 1-.62 1.58-.03.21-.05.42.02.62.06.16.18.28.31.39a1.8 1.8 0 0 0 1.47.34c1-.21 1.87-1.34 1.46-2.36h-.01z" fill="url(#S)"/><path d="M161.56 58.76a2.35 2.35 0 0 0-1.65-1.38 3.07 3.07 0 0 0-1.17 0c-.44.08-.88.22-1.22.51-.68.57-.84 1.54-.95 2.42-.04.32-.08.65.04.95.09.24.27.43.47.59.62.49 1.47.69 2.25.53 1.53-.33 2.87-2.06 2.23-3.61v-.01z" fill="url(#T)"/><path d="M11.6 106.73c.16.31.52.56.93.63a2.15 2.15 0 0 0 .67 0c.25-.03.5-.1.7-.23.39-.25.48-.69.55-1.09.02-.14.05-.29-.02-.43-.05-.11-.15-.2-.27-.27-.35-.22-.83-.32-1.28-.25-.87.14-1.64.92-1.29 1.62l.01.02z" fill="url(#U)"/><path d="M7.54 112.97c.16.31.52.56.93.63a2.15 2.15 0 0 0 .67 0c.25-.03.5-.1.7-.23.39-.25.48-.69.55-1.09.02-.14.05-.29-.02-.43-.05-.11-.15-.2-.27-.27-.35-.23-.83-.32-1.28-.25-.87.14-1.64.92-1.29 1.62l.01.02z" fill="url(#V)"/><path d="M19.98 106.98c.14.27.45.49.82.55.19.03.39.03.59 0 .22-.03.44-.09.61-.2.34-.22.43-.61.48-.96.02-.13.04-.26-.01-.38-.04-.1-.14-.17-.23-.24-.31-.2-.73-.28-1.12-.22-.77.12-1.44.81-1.13 1.43l-.01.02z" fill="url(#W)"/><path d="M7.62 93.79c.42.03.86-.12 1.12-.38.14-.14.24-.3.3-.47.07-.19.11-.4.05-.59-.11-.39-.57-.65-.98-.87-.15-.08-.31-.16-.49-.18-.14-.01-.29.02-.42.07-.41.15-.73.45-.84.8-.23.68.31 1.58 1.26 1.63v-.01z" fill="url(#X)"/><path d="M18.33 94.38c.28.55.91.98 1.63 1.11.38.07.79.06 1.18 0 .44-.06.88-.17 1.22-.4.69-.45.85-1.21.97-1.91.04-.25.08-.52-.03-.75-.09-.19-.27-.35-.47-.47-.62-.4-1.46-.56-2.24-.43-1.53.25-2.89 1.61-2.26 2.85z" fill="url(#Y)"/><path d="M11.36 128.34a2.36 2.36 0 0 0-1.74 1.27c-.17.35-.25.75-.28 1.14-.03.44 0 .9.2 1.3.39.8 1.29 1.18 2.12 1.5.3.12.61.23.93.19.25-.03.49-.16.69-.32.63-.49 1.02-1.26 1.05-2.05.05-1.56-1.31-3.28-2.97-3.03z" fill="url(#Z)"/><path d="M5.83 56.88c-.3.04-.58.25-.71.52a1.55 1.55 0 0 0-.12.47c-.01.18 0 .37.08.54.16.33.53.48.87.62.12.05.25.1.38.08.1-.01.2-.07.28-.13.26-.2.42-.52.43-.84.02-.64-.54-1.35-1.22-1.25l.01-.01z" fill="url(#a)"/><path d="M30.71 127.74c-.3.04-.58.25-.71.52a1.55 1.55 0 0 0-.12.47c-.01.18 0 .37.08.54.16.33.53.49.87.62.12.05.25.1.38.08.1-.01.2-.07.28-.13.26-.2.42-.52.43-.84.02-.64-.54-1.35-1.22-1.25l.01-.01z" fill="url(#b)"/><path d="M96.64 15.68c2.15.65 4.52.46 6.59-.41 2.63-1.11 4.89-3.7 4.57-6.54-.1-.9-.45-1.76-.89-2.56C104.8 2.35 99.87-.62 95.42.12c-4.51.75-5.53 5.87-4.5 9.7.75 2.82 2.93 5.02 5.72 5.87v-.01z" fill="url(#c)"/><path d="M132 137.54c-1.74.07-3.44.81-4.73 1.98-1.64 1.48-2.65 3.96-1.69 5.96.3.64.78 1.18 1.3 1.65 2.52 2.27 6.89 3.19 9.97 1.52 3.12-1.69 2.57-5.71.84-8.26a6.56 6.56 0 0 0-5.69-2.85z" fill="url(#d)"/><path d="M46.56 147.75c-.41 1.87-.1 3.87.78 5.56 1.12 2.15 3.46 3.9 5.84 3.45.76-.14 1.47-.5 2.11-.92 3.1-2.04 5.29-6.42 4.38-10.14-.93-3.78-5.34-4.31-8.52-3.18-2.34.82-4.07 2.82-4.6 5.24l.01-.01z" fill="url(#e)"/><path d="M84.03 141.15c33.894 0 61.37-27.476 61.37-61.37s-27.476-61.37-61.37-61.37-61.37 27.476-61.37 61.37 27.476 61.37 61.37 61.37z" fill="url(#f)"/><path d="M70.47 119.25c-.9 3.85 2.9 7.24 6.64 8.53 2.99 1.03 7.08.94 8.41-1.93 1.27-2.73-.94-5.73-3.01-7.91-2.35-2.47-5.81-5.11-8.82-3.5-1.74.93-2.53 2.97-3.18 4.84" class="B"/><path d="M82.01 119.65l-.42-.45c-1.75-1.83-4.31-3.79-6.54-2.6-1.29.69-1.87 2.2-2.35 3.59l-.03-.02a3.7 3.7 0 0 0-.08 1.14c.16-.51.38-.99.73-1.42 1.97-2.43 5.8-1.48 8.7-.24h-.01z" class="D"/><path d="M77.59 126.5c2.22.77 5.25.69 6.24-1.43.85-1.84-.42-3.85-1.82-5.42-2.9-1.24-6.73-2.19-8.7.24-.34.43-.57.91-.73 1.42.18 2.37 2.61 4.36 5.01 5.19z" class="C"/><path d="M50.82 90.42c-1.08-2.24-4.27-2.4-6.61-1.56-1.87.67-3.84 2.33-3.36 4.26.46 1.83 2.72 2.44 4.59 2.69 2.13.28 4.86.21 5.7-1.76.49-1.14.07-2.45-.35-3.62" class="B"/><path d="M45.01 94.78l.38.06c1.58.21 3.6.16 4.23-1.31.36-.85.05-1.82-.26-2.68h.02a2.3 2.3 0 0 0-.41-.59c.12.31.2.64.2.98 0 1.97-2.26 3.01-4.16 3.55v-.01z" class="D"/><g class="C"><path d="M44.48 89.68c-1.39.5-2.84 1.73-2.49 3.16.31 1.24 1.72 1.72 3.02 1.93 1.91-.53 4.16-1.58 4.16-3.55 0-.34-.08-.67-.2-.98-1.02-1.09-3-1.11-4.5-.57l.01.01zm76.3-21.54c7.04-3.47 13.02 2.9 12.67 9.3 2.89-7.15-3.84-16.32-12-12.31-2.41 1.19-4.8 3.9-4.54 6.7.85-1.6 2.35-2.95 3.87-3.69z"/></g><path d="M121.79 76.66c1.71 1.4 2.9 3.96 4.72 5.05 1.77 1.06 4.08-.13 5.41-1.71a9.5 9.5 0 0 0 1.53-2.55c.36-6.41-5.62-12.77-12.67-9.3-1.52.75-3.02 2.1-3.87 3.69.04.45.15.91.34 1.36.85 1.99 3.03 2.23 4.54 3.46z" class="B"/><path d="M127.62 99.11c.09 3.55-3.65 4.8-6.21 3.44 2.39 2.54 7.42 1.51 7.32-2.6-.03-1.21-.69-2.71-1.89-3.13a4.05 4.05 0 0 1 .78 2.29z" class="C"/><path d="M123.93 97.92c-.9.43-2.17.44-2.96.98-.77.53-.72 1.7-.32 2.54.2.43.46.79.76 1.11 2.56 1.36 6.3.1 6.21-3.44-.02-.76-.29-1.64-.78-2.29a2.07 2.07 0 0 0-.62-.12c-.98-.03-1.49.82-2.28 1.21l-.01.01z" class="B"/><path d="M90.51 88.45c1.85-1.45 3.99.04 4.29 1.94.4-2.27-2.14-4.54-4.28-2.86-.63.5-1.16 1.44-.91 2.24.15-.52.51-1.01.9-1.32z" class="C"/><path d="M91.33 90.88c.59.3 1.09.98 1.69 1.19.58.2 1.19-.29 1.48-.84a2.8 2.8 0 0 0 .29-.84c-.29-1.9-2.44-3.39-4.29-1.94a2.68 2.68 0 0 0-.9 1.32c.04.13.1.26.18.38.37.53 1.03.46 1.54.73h.01z" class="B"/><path d="M51.7 76.12c-.43-2.31 1.88-3.52 3.7-2.9-1.83-1.41-5.01-.21-4.51 2.47.15.79.74 1.7 1.56 1.85-.39-.37-.66-.92-.75-1.41v-.01z" class="C"/><path d="M54.23 76.52c.54-.38 1.38-.52 1.83-.95s.29-1.19-.06-1.7a2.92 2.92 0 0 0-.61-.65c-1.82-.62-4.13.59-3.7 2.9a2.67 2.67 0 0 0 .75 1.41 1.46 1.46 0 0 0 .42.01c.64-.09.89-.69 1.36-1.03l.01.01z" class="B"/><path d="M117.25 106.98c1.76.45 1.85 2.47.82 3.54 1.58-.82 1.78-3.44-.25-3.96-.6-.16-1.43-.04-1.8.49a2.08 2.08 0 0 1 1.23-.06v-.01z" class="C"/><path d="M116.14 108.62c.09.5-.09 1.13.07 1.59.15.45.74.59 1.21.52a1.92 1.92 0 0 0 .65-.22c1.03-1.07.94-3.08-.82-3.54-.38-.1-.85-.09-1.23.06-.06.09-.11.18-.14.29-.15.48.2.85.27 1.29l-.01.01z" class="B"/><path d="M101.48 65.24c-1.13-3.36 2.08-5.66 4.93-5.11-3.03-1.72-7.54.74-6.23 4.63.39 1.15 1.45 2.38 2.72 2.43-.66-.48-1.18-1.23-1.42-1.95z" class="C"/><path d="M105.35 65.3c.73-.68 1.95-1.06 2.54-1.81.58-.73.19-1.84-.44-2.53a4.13 4.13 0 0 0-1.05-.84c-2.85-.55-6.06 1.75-4.93 5.11.24.72.76 1.48 1.42 1.95a2.34 2.34 0 0 0 .63-.07c.94-.26 1.18-1.22 1.82-1.82l.01.01z" class="B"/><path d="M127.1 45.47c1.37-2.48 4.47-.85 5.7 1.78-.63-3.31-4.53-5.95-6.13-3.08-.47.85-.62 2.3.04 3.38-.08-.77.09-1.55.38-2.08h.01z" class="C"/><g class="B"><path d="M129.17 48.73c.8.3 1.69 1.14 2.45 1.3.75.15 1.19-.68 1.25-1.52.03-.42 0-.85-.07-1.26-1.23-2.62-4.33-4.25-5.7-1.78-.3.53-.46 1.31-.38 2.08a2.93 2.93 0 0 0 .38.49c.67.67 1.36.43 2.07.69zM92.13 35.92c2.38.66 5.01.91 6.88 2.53 2.92 2.53 2.66 7.2 4.86 10.37 2.34 3.38 7.59 4.26 10.9 1.82 3.16-2.32 4.08-6.92 2.79-10.62s-4.42-6.54-7.92-8.31c-3.5-1.78-7.38-2.63-11.21-3.46-2.91-.63-8.54-1.69-10.36 1.76-1.65 3.14 1.21 5.11 4.06 5.9v.01z"/></g><path d="M98.43 31.26c3.83.83 7.71 1.68 11.21 3.46s6.62 4.61 7.92 8.31c.21.6.34 1.24.43 1.87.24-1.63.11-3.33-.43-4.88-1.29-3.7-4.42-6.54-7.92-8.31-3.5-1.78-7.38-2.63-11.21-3.46-2.91-.63-8.54-1.69-10.36 1.76-.66 1.26-.59 2.33-.09 3.21l.09-.21c1.82-3.46 7.45-2.39 10.36-1.76v.01z" class="C"/><path d="M92.13 35.92c2.38.66 5.01.91 6.88 2.53 2.92 2.53 2.66 7.2 4.86 10.37 2.34 3.38 7.59 4.26 10.9 1.82 1.84-1.35 2.9-3.48 3.23-5.75-.09-.64-.22-1.27-.43-1.87-1.29-3.7-4.42-6.54-7.92-8.31-3.5-1.78-7.38-2.63-11.21-3.46-2.91-.63-8.54-1.69-10.36 1.76-.04.07-.06.14-.09.21.74 1.32 2.44 2.22 4.15 2.69l-.01.01z" class="B"/><path d="M46.39 53.82c4.01 1.52 5.7 7.19 3.19 10.66-1.55 2.13-4.2 3.27-5.7 5.44-1.15 1.65-1.66 3.91-3.43 4.87-2.48 1.34-5.46-.9-6.78-3.39-2.18-4.11-2.16-9.23-.33-13.51 2.67-6.23 7.53-6.17 13.05-4.08v.01z" class="C"/><path d="M34.45 61.01c2.67-6.23 7.53-6.17 13.05-4.08 1.35.51 2.43 1.5 3.18 2.71-.34-2.52-1.9-4.91-4.29-5.82-5.53-2.09-10.39-2.16-13.05 4.08-1.78 4.16-1.83 9.1.17 13.15-.76-3.31-.4-6.9.94-10.04z" class="D"/><path d="M40.45 74.79c1.77-.96 2.28-3.22 3.43-4.87 1.5-2.16 4.16-3.3 5.7-5.44 1.01-1.39 1.33-3.14 1.11-4.84-.75-1.21-1.83-2.2-3.18-2.71-5.53-2.09-10.39-2.16-13.05 4.08-1.34 3.14-1.7 6.73-.94 10.04.06.12.1.24.16.35 1.32 2.49 4.3 4.73 6.78 3.39h-.01z" class="C"/><path d="M39.07 112.82c1.06 2.62 2.91 4.99 5.41 6.29 1.11.58 2.37.95 3.61.81 1.45-.15 2.76-.97 3.86-1.94 2.29-2.03 3.89-4.92 4.04-7.98.16-3.06-1.26-6.23-3.83-7.89-1.82-1.18-4.05-1.55-6.21-1.64-8.31-.35-9.59 5.66-6.89 12.35h.01z" class="B"/><path d="M41.37 112.05c.75 1.85 2.06 3.52 3.83 4.45.79.41 1.67.67 2.56.58 1.03-.11 1.95-.69 2.73-1.37 1.62-1.44 2.75-3.48 2.86-5.64s-.89-4.41-2.71-5.58c-1.29-.83-2.86-1.09-4.39-1.16-5.88-.24-6.78 4-4.87 8.73l-.01-.01z" class="C"/><path d="M47.02 105.81c1.65.07 3.35.35 4.74 1.25.56.36 1.05.83 1.46 1.36-.32-1.59-1.22-3.06-2.58-3.94-1.29-.83-2.86-1.09-4.39-1.16-5.19-.22-6.5 3.07-5.42 7.1.16-2.83 1.99-4.79 6.2-4.62l-.01.01z" class="D"/><path d="M45.19 116.5c.79.41 1.67.67 2.56.58 1.03-.11 1.95-.69 2.73-1.37 1.62-1.44 2.75-3.48 2.86-5.64.03-.55-.02-1.1-.13-1.65a5.91 5.91 0 0 0-1.46-1.36c-1.39-.9-3.08-1.18-4.74-1.25-4.2-.18-6.04 1.79-6.2 4.62.14.53.32 1.08.55 1.63.75 1.85 2.06 3.52 3.83 4.45v-.01z" class="C"/><g style="mix-blend-mode:multiply" opacity=".19"><path d="M100.44 125.59c-32.4 0-58.67-26.27-58.67-58.67 0-14.08 4.96-26.99 13.23-37.1-17.26 10.21-28.84 29.01-28.84 50.51 0 32.4 26.27 58.67 58.67 58.67 18.32 0 34.68-8.4 45.44-21.57-8.74 5.17-18.94 8.15-29.83 8.15v.01z" fill="#f15f32"/></g><path d="M105.61 106.34c1.54 1.26 2.72 2.9 3.88 4.52 2.42 3.37 4.95 7.16 4.51 11.28-.51 4.78-5 8.28-9.64 9.51-1.42.37-3 .58-4.32-.07-.75-.37-1.35-.98-1.85-1.65-1.46-1.93-2.17-4.41-1.96-6.82.14-1.66.69-3.42 0-4.93-2.07-4.48-10.56-2.19-7.21-9.26 2.87-6.06 11.94-6.38 16.59-2.57v-.01z" class="B"/><path d="M99.89 110.59c3.37-.26 6.88 1.93 9.65 4.66-2.13-3.37-6.54-7.7-10.7-7.38-3.57.28-3.66 2.48-2.85 4.94.42-1.2 1.56-2.03 3.9-2.21v-.01z" class="D"/><g class="C"><path d="M99.41 124.32c-.14-.62-.44-1.37-.81-2.2-.1 1.86-.23 3.7.85 5.14.05.07.12.12.17.18.03-1.07.01-2.12-.21-3.13v.01z"/><path d="M105.69 128.63c1.34-.4 2.63-1.07 3.61-2.06 2.72-2.75 2.51-7.42.58-10.77-.1-.18-.22-.37-.34-.55-2.78-2.72-6.28-4.92-9.65-4.66-2.33.18-3.48 1.02-3.9 2.21.72 2.19 2.14 4.59 2.47 6.05.24 1.05.2 2.16.14 3.27.37.83.67 1.58.81 2.2.23 1 .25 2.06.21 3.13 1.4 1.63 3.98 1.8 6.07 1.18z"/></g><path d="M61.82 102.6c.87.72 1.77 1.46 2.86 1.75 1.96.51 3.94-.56 5.93-.87 2.91-.45 5.99.71 8.78-.23 3.19-1.08 4.96-4.82 4.55-8.17s-2.58-6.26-5.18-8.41c-5.69-4.69-15.18-6.26-21.33-1.33-6.54 5.24-.22 13.43 4.39 17.26z" class="B"/><path d="M81.35 94.17c-.25-1.35-1.07-2.52-2.01-3.51-2.53-2.68-5.85-4.09-9.35-4.5-1.15.32-2.21 1.02-3.15 1.78-2.09 1.71-3.75 5.49-5.94 6.79.42.87.89 1.75 1.33 2.59.71 1.35 1.04 3.07 2.37 3.82 1.76 1 3.84-.38 5.72-1.12a9.29 9.29 0 0 1 6.22-.2c1.11.36 2.44.89 3.32.13.33-.29.52-.71.68-1.12.59-1.48 1.11-3.08.82-4.65l-.01-.01z" class="C"/><path d="M66.85 87.94c.94-.77 1.99-1.46 3.15-1.78-2.02-.24-4.1-.15-6.13.22-5.65 1.05-4.74 4.69-2.96 8.36 2.2-1.3 3.85-5.08 5.94-6.79v-.01z" class="D"/><path d="M107.43 91.93c-.42-.08-.85-.16-1.26-.06-.74.18-1.2.89-1.8 1.36-.88.67-2.1.84-2.85 1.66-.86.93-.77 2.48-.03 3.51s1.98 1.6 3.22 1.84c2.72.52 6.13-.67 7.27-3.4 1.21-2.9-2.35-4.47-4.56-4.9l.01-.01z" class="B"/><path d="M102.5 98.23c.32.4.81.64 1.3.79 1.32.43 2.66.3 3.89-.2.32-.31.55-.73.72-1.16.38-.94.25-2.49.74-3.31l-.91-.61c-.48-.32-.9-.82-1.47-.83-.76-.01-1.2.82-1.68 1.4a3.51 3.51 0 0 1-2.01 1.19c-.43.08-.96.15-1.12.55-.06.16-.04.33-.02.49.07.6.19 1.22.57 1.68l-.01.01z" class="C"/><path d="M108.41 97.67c-.17.42-.39.84-.72 1.16.71-.28 1.38-.69 1.98-1.18 1.67-1.36.72-2.4-.53-3.29-.49.82-.35 2.37-.74 3.31h.01z" class="D"/><path d="M51.84 37.85c-.95 2.74-.37 5.96 1.48 8.2.45.55.99 1.05 1.64 1.33 1.54.68 3.35.04 5.01.32 1.21.21 2.3.9 3.51 1.12 2.81.52 5.4-1.51 7.54-3.41.56-.49 1.12-1 1.53-1.62 1.35-2.04.72-4.84-.59-6.9-4.49-7.08-17.02-8-20.12.95v.01z" fill="#f47b53"/><path d="M68.63 37.87c-3.72-1.44-7.94-1.55-11.75-.37-.56.17-1.1.4-1.56.56-.82 1.8-1.08 3.85-.21 5.38 1.05 1.84 2.85 1.09 4.65 1.8 1.71.67 3.01 2.26 4.99 2.21 1.04-.02 2.03-.56 2.79-1.27 2.68-2.48 2.59-5.74 1.08-8.31h.01z" class="B"/><path d="M68.63 37.87c-1.96-3.32-6.29-5.51-10.16-3.46-1.24.66-2.42 2.06-3.15 3.65.46-.16 1-.38 1.56-.56 3.81-1.18 8.02-1.07 11.75.37z" fill="#f04e2b"/><g style="mix-blend-mode:overlay" opacity=".34"><path d="M98.31 58.43c7.02 6.39 15.86 11.11 25.32 11.87 2.25.18 4.69.09 6.53-1.22 2.77-1.98 3.18-5.89 3.16-9.3-.03-5.55-.56-11.27-3.08-16.22-2.5-4.9-6.77-8.65-11.18-11.94-8.83-6.6-21.45-13.92-32.99-12.27-13.48 1.93-5.74 15.49-1.31 22.43 3.86 6.04 8.23 11.81 13.55 16.65z" fill="#f5eb00"/></g><g style="mix-blend-mode:overlay" opacity=".34"><path d="M71.05 32.9c-.66 6.16 1.55 12.28 4.36 17.81 7.62 14.98 19.94 27.43 34.53 35.77 4.02 2.3 8.31 4.33 12.91 4.93s9.58-.39 13-3.51c3.6-3.28 4.99-8.39 5.21-13.26.32-7.29-1.68-14.67-5.64-20.8-2.36-3.66-5.38-6.86-8.49-9.92-9.66-9.49-52.59-41.45-55.87-11.03l-.01.01z" fill="#faa21b"/></g><g style="mix-blend-mode:multiply" opacity=".41" class="B"><path d="M34.77 58.48c-4.14 12.46-3.96 26.3.49 38.66 2.38 6.62 6.2 13.07 12.22 16.72 5.67 3.44 12.59 4.02 18.82 6.31 5.08 1.87 9.69 4.88 14.77 6.74 4.63 1.7 9.62 2.41 14.54 2.08 5.76-.38 12.36-3.23 13.29-8.92.82-5.02-3.21-9.45-7.2-12.6-6.25-4.92-13.24-8.86-19.43-13.85-6.19-5-11.72-11.36-13.61-19.08-1.68-6.84-.33-14.11 2.14-20.7 1.96-5.24 4.68-10.64 3.68-16.15-1.87-10.23-13.66-12.28-20.73-6.57-8.74 7.06-15.43 16.7-18.97 27.37l-.01-.01z"/></g></g><defs><radialGradient id="A" cx="0" cy="0" r="1" gradientTransform="translate(125.72 1.79999) scale(20.16 20.16)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="B" cx="0" cy="0" r="1" gradientTransform="translate(45.1193 131.33) rotate(-42.65) scale(24.38 24.38)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="C" cx="0" cy="0" r="1" gradientTransform="translate(127.97 13.73) scale(21.56)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="D" cx="0" cy="0" r="1" gradientTransform="translate(118.47 140.73) scale(21.56 21.56)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="E" cx="0" cy="0" r="1" gradientTransform="translate(139.077 38.7914) rotate(59.8699) scale(8.88 8.88001)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="F" cx="0" cy="0" r="1" gradientTransform="translate(162.08 91.0563) rotate(59.87) scale(8.88001 8.88001)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="G" cx="0" cy="0" r="1" gradientTransform="translate(158.982 78.7255) rotate(59.8701) scale(8.88 8.87998)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="H" cx="0" cy="0" r="1" gradientTransform="translate(148.158 34.7351) rotate(59.8699) scale(8.88 8.88001)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="I" cx="0" cy="0" r="1" gradientTransform="translate(151.169 107.957) rotate(59.8699) scale(8.87999 8.88001)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="J" cx="0" cy="0" r="1" gradientTransform="translate(157.214 33.7473) rotate(-3.84) scale(8.88001 8.88)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="K" cx="0" cy="0" r="1" gradientTransform="translate(13.4127 74.8987) rotate(59.87) scale(15.59 15.59)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="L" cx="0" cy="0" r="1" gradientTransform="translate(25.8791 122.954) rotate(59.87) scale(15.59 15.59)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="M" cx="0" cy="0" r="1" gradientTransform="translate(25.4901 68.953) rotate(59.87) scale(15.59)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="N" cx="0" cy="0" r="1" gradientTransform="translate(146.615 126.128) rotate(59.8699) scale(10.18 10.18)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="O" cx="0" cy="0" r="1" gradientTransform="translate(153.418 47.9035) rotate(59.87) scale(15.59 15.59)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="P" cx="0" cy="0" r="1" gradientTransform="translate(156.996 92.9547) rotate(59.8701) scale(15.59 15.59)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="Q" cx="0" cy="0" r="1" gradientTransform="translate(159.937 70.378) rotate(135.95) scale(8.88001 8.88001)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="R" cx="0" cy="0" r="1" gradientTransform="translate(152.578 57.8233) rotate(135.95) scale(8.88001 8.88001)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="S" cx="0" cy="0" r="1" gradientTransform="translate(148.912 69.0919) rotate(135.95) scale(10.18)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="T" cx="0" cy="0" r="1" gradientTransform="translate(156.871 65.9) rotate(135.95) scale(15.6)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="U" cx="0" cy="0" r="1" gradientTransform="translate(-15.1772 124.793) rotate(-37.0101) scale(8.08081 7.72561)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="V" cx="0" cy="0" r="1" gradientTransform="translate(-19.7282 131.394) rotate(-37.01) scale(8.0808 7.72559)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="W" cx="0" cy="0" r="1" gradientTransform="translate(-8.13014 126.16) rotate(-37.01) scale(7.098 6.786)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="X" cx="0" cy="0" r="1" gradientTransform="translate(-38.7198 -35.3608) rotate(-111.39) scale(7.1928 8.7024)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="Y" cx="0" cy="0" r="1" gradientTransform="translate(-5.11968 109.095) rotate(-37.01) scale(14.1869 13.5633)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="Z" cx="0" cy="0" r="1" gradientTransform="translate(17.2104 134.633) rotate(59.87) scale(15.59 15.59)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="translate(8.25195 59.4523) rotate(59.87) scale(6.4)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="b" cx="0" cy="0" r="1" gradientTransform="translate(33.1215 130.313) rotate(59.87) scale(6.40001 6.4)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="c" cx="0" cy="0" r="1" gradientTransform="translate(109.86 9.37) scale(26.83 26.83)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="d" cx="0" cy="0" r="1" gradientTransform="translate(123.883 145.471) rotate(160.9) scale(20.84 20.84)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="e" cx="0" cy="0" r="1" gradientTransform="translate(52.7343 158.586) rotate(85.58) scale(22.82 22.82)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><radialGradient id="f" cx="0" cy="0" r="1" gradientTransform="translate(55.35 122.47) scale(117.06)" href="#h"><stop offset=".17" stop-color="#f78f2f"/><stop offset=".67" stop-color="#fbab22"/></radialGradient><clipPath id="g"><path fill="#fff" d="M0 0h169v158H0z"/></clipPath><linearGradient id="h" gradientUnits="userSpaceOnUse"/></defs>';
        case "Sub":
          return `<g clip-path="url(#C)"><mask id="A" maskUnits="userSpaceOnUse" x="0" y="2" width="69" height="68"><path d="M34.007 69.738c18.778 0 34-15.017 34-33.542s-15.222-33.542-34-33.542-34 15.017-34 33.542 15.222 33.542 34 33.542z" fill="#fff"/></mask><g mask="url(#A)"><path d="M34.007 69.738c18.778 0 34-15.017 34-33.542s-15.222-33.542-34-33.542-34 15.017-34 33.542 15.222 33.542 34 33.542z" fill="url(#B)"/><path d="M34.37 15.655c3.348 3.821 8.286 6.322 10.621 10.813 2.047 3.938 2.099 9.312 5.92 11.638 2.387 1.451 5.603 1.065 7.983-.408s4.028-3.857 5.263-6.351c4.679-9.465 3.77-21.394-2.299-30.056-5.13-7.335-17.015-13.789-26.076-9.26-8.714 4.36-6.822 17.449-1.412 23.625z" fill="#9469ad"/><path d="M24.28 18.222a2.44 2.44 0 0 1-1.131-.839c-.244-.328-.399-.773-.458-1.24-.17.707-.037 1.531.34 2.034.236.321.576.569.953.707.369.131.806.153 1.153-.037.296-.16.495-.452.65-.751l-.14.088c-.414.219-.924.197-1.367.037z" fill="#775ea9"/><path d="M26.099 17.092c.044-1.05-1.286-2.581-2.439-2.151-.525.197-.835.664-.968 1.21.059.474.214.919.458 1.239.281.379.68.678 1.131.839.444.16.954.182 1.367-.037l.14-.087c.015-.022.022-.044.037-.066.148-.299.266-.613.281-.941l-.007-.007z" fill="#986eb0"/><path d="M8.766 34.329c-2.077 1.473-3.252 4.419-2.025 6.636.606 1.086 1.752 2.093 1.486 3.303-.096.452-.384.831-.613 1.232-1.648 2.895-.111 6.482 1.523 9.384.902 1.604 1.87 3.23 3.333 4.346s3.563 1.626 5.211.78c.717-.372 1.301-.977 2.018-1.349 2.565-1.327 5.543.612 7.864 2.319 2.299 1.692 4.893 3.325 7.761 3.303s5.876-2.421 5.433-5.221c-.052-.335-.163-.685-.429-.897-.347-.284-.85-.262-1.301-.262-3.082 0-6.061-2.034-7.155-4.878 1.981-1.436 4.058-2.982 4.649-5.469.325-1.385-.022-2.895-1.123-3.806-3.208-2.661-8.293 2.399-11.087-.263-.82-.78-.998-1.874-.887-3.019.222-2.246-2.254-3.894-4.25-2.807l-.044.022c1.072-.598-2.336-4.55-3.126-4.885-2.07-.868-5.558.343-7.229 1.531h-.007z" fill="#7159a6"/><path d="M39.544 30.414c-.17-.109-.318-.226-.458-.357.148.386.392.744.717 1.006.569.459 1.338.656 2.069.569.599-.073 1.19-.328 1.589-.78.066-.073.111-.153.163-.233-.421.204-.917.328-1.412.372-.946.088-1.937-.109-2.676-.569l.007-.007z" fill="#775ea9"/><path d="M43.328 27.84c-1.367-1.407-4.22-.809-4.368 1.32-.022.313.037.62.148.911a3.18 3.18 0 0 0 .458.357c.739.452 1.737.642 2.683.547.495-.051.983-.175 1.404-.387.525-.838.377-2.027-.318-2.749h-.007z" fill="#9469ad"/><path d="M45.545 15.407c.451-.022.917-.102 1.271-.379.362-.277.569-.722.665-1.167.251-1.13-.103-2.362-.865-3.245-1.419-1.633-5.174-2.406-6.068.168-.983 2.815 2.668 4.725 4.996 4.616v.007zm8.596 10.53c.081.233.207.474.407.62.214.153.488.19.746.168.658-.044 1.279-.43 1.641-.977.673-1.021.495-3.143-1.064-3.216-1.7-.073-2.166 2.18-1.73 3.405zm6.209 6.832c.044.197.118.394.266.525.155.139.37.19.577.197a1.74 1.74 0 0 0 1.382-.627c.621-.744.673-2.435-.547-2.625-1.338-.212-1.907 1.531-1.678 2.53zm-3.526-14.343c.126.037.259.051.377.015.126-.044.222-.139.288-.255a1.07 1.07 0 0 0 .067-.948c-.229-.562-1.16-1.108-1.641-.496-.525.663.281 1.502.909 1.684zm-6.829-1.611c.007.35.222.729.576.78.192.022.384-.051.569-.022.177.029.34.16.51.124.074-.015.14-.066.207-.109a1.24 1.24 0 0 0 .436-.693c.059-.27 0-.569-.192-.773-.17-.19-.429-.284-.68-.343-.754-.153-1.441.219-1.419 1.035h-.007zm-15.359-5.681a1.39 1.39 0 0 0 1.471-.496c.473-.656.325-1.823-.155-2.45s-1.493-.664-2.232-.605c-1.301.109-2.786 1.138-1.87 2.559.362.562.784.452 1.375.496.547.044.902.335 1.412.489v.007zm5.891-3.23c-.103.16-.296.233-.473.306l-.532.204c-.037.015-.066.029-.103.029-.747.051-.953-1.152-.31-1.451.517-.241 1.922.153 1.419.919v-.007z" fill="#ab84bc"/><path d="M49.995 11.856c.022.379.067.802.37 1.035.185.146.436.182.665.248.754.197 1.404.664 2.084 1.043.177.102.377.204.584.182.34-.029.576-.379.584-.715 0-.335-.163-.649-.355-.926-.732-1.072-4.11-3.777-3.932-.86v-.007zm-2.018 10.267c.118.43.362.817.606 1.188.126.19.266.387.466.51.259.16.584.175.887.153a1.81 1.81 0 0 0 .399-.058c.251-.073.458-.241.658-.401.288-.226.577-.459.798-.751s.37-.649.34-1.014c-.214-2.377-4.856-2.239-4.154.365v.007z" fill="#ab84bc"/><path d="M52.486 43.138c-1.515.7-2.823 1.947-3.304 3.529-.207.671-.259 1.386-.466 2.056-.54 1.772-2.225 3.15-4.095 3.347-1.234.131-2.764-.095-3.467.919-.562.817-.17 1.918.281 2.8a27.25 27.25 0 0 0 2.04 3.347c.207.284.436.583.776.685.916.263 1.589-1.05 2.535-1.094.791-.036 1.301.78 1.936 1.239.769.562 1.892.612 2.713.109s1.271-1.517 1.094-2.45c-.2-1.05-1.064-1.837-1.501-2.815s-.066-2.501 1.013-2.494c.325 1.021.857 1.969 1.567 2.778 1.101-.416 1.885-1.538 1.877-2.698 1.205.08 2.336.868 2.809 1.962.089.197.155.408.325.547.355.292.894.066 1.264-.204 2.203-1.582 3.282-4.236 4.25-6.752.303-.78.606-1.597.51-2.428s-.732-1.663-1.574-1.692c-.71-.022-1.301.496-1.892.882s-1.441.649-1.966.175c-.458-.416-.377-1.13-.488-1.735-.37-2.071-5.107-.554-6.253-.022l.015.007z" fill="#8369ae"/><path d="M14.398 21.372c-.199.569-.199 1.298.281 1.67.473.372 1.257.263 1.619.744.296.394.133.941 0 1.407-.303 1.028-.214 2.443.813 2.785.584.19 1.205-.073 1.818-.139 1.013-.102 2.062.43 2.572 1.305.436.744.473 1.648.82 2.435s1.249 1.488 2.033 1.116c.347-.16.569-.496.769-.817.517-.831.99-1.684 1.412-2.567.273-.569.525-1.181.458-1.808-.089-.868-.776-1.575-1.545-1.991-.776-.423-1.648-.62-2.469-.933-.273-.102-.569-.241-.695-.503-.096-.204-.074-.445-.067-.671.17-4.258-6.216-6.555-7.813-2.034h-.007z" fill="#7159a6"/><path opacity=".51" d="M57.615 57.349c-16.083 8.072-35.759 1.757-43.949-14.109-6.105-11.827-4.095-25.623 3.991-35.226C2.639 16.494-3.149 35.212 4.79 50.597c8.182 15.867 27.858 22.188 43.949 14.109 4.095-2.056 7.554-4.849 10.318-8.123-.473.262-.946.518-1.434.766h-.007z" fill="#6d55a4"/></g></g><defs><radialGradient id="B" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(51.2512 13.3511) scale(66.4774 65.5813)"><stop stop-color="#8b5fa8"/><stop offset=".29" stop-color="#8660a8"/><stop offset=".58" stop-color="#7a63ab"/><stop offset=".82" stop-color="#6b67af"/></radialGradient><clipPath id="C"><path fill="#fff" d="M0 0h68v70H0z"/></clipPath></defs>`;
        default:
          return "";
      }
    });
  }
}
