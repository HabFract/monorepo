import { zoom } from "d3-zoom";

export default class BaseVisualization implements IVisualization {
  type: VisType;
  _svgId: string;
  _canvas: any;
  _manager: any;
  zoomer: any;
  rootData: any;
  nodeDetails: SphereOrbitNodes;
  sphereEh: EntryHashB64;
  sphereAh: ActionHashB64;
  globalStateTransition: Function;
  modalIsOpen?: boolean;
  modalParentOrbitEh?: Function;
  modalChildOrbitEh?: Function;
  _nextRootData: any;
  layout!: TreeLayout<unknown>;
  _viewConfig: ViewConfig;
  _zoomConfig: ZoomConfig;
  eventHandlers: EventHandlers;
  _hasRendered: boolean = false;
  skipMainRender: boolean = false;
  isNewActiveNode?: boolean;
  activeNode: any;
  _enteringNodes: any;
  isCollapsed: boolean = false;
  isExpanded: boolean = false;

  currentEventTimestamp!: number;

  _gLink: any;
  _gNode: any;
  _gCircle: any;
  gCirclePulse: any;
  _gTooltip: any;
  _gButton: any;
  _enteringLinks: any;





  zoomBase() {
    return select(`#${this._svgId}`);
  }

  hasSummedData(): boolean {
    return !!this.rootData?.value;
  }

  setActiveNode(clickedNodeContent, event: any = null) {
    this?.isNewActiveNode && delete this.isNewActiveNode;

    this.activeNode = this.findNodeByContent(clickedNodeContent);

    const currentActiveG = document.querySelector(".the-node.active");
    if (currentActiveG) currentActiveG.classList.toggle("active");
    event && event.target?.closest(".the-node")?.classList?.toggle("active");

    // this.render();
    // this.activateNodeAnimation();
    return this.activeNode;
  }

  findNodeByContent(node) {
    if (node === undefined || node.content === undefined) return;
    let found;
    this.rootData.each((n) => {
      if (contentEqual(n.data, node)) {
        found = n;
      }
    });
    return found;
  }


  setLevelsHighAndWide(): void {
    if (this._viewConfig.isSmallScreen()) {
      this._viewConfig.levelsHigh = XS_LEVELS_HIGH;
      this._viewConfig.levelsWide = XS_LEVELS_WIDE;
    } else {
      this._viewConfig.levelsHigh = LG_LEVELS_HIGH;
      this._viewConfig.levelsWide = LG_LEVELS_WIDE;
    }
  }

  setdXdY(): void {
    this._viewConfig.dx =
      this._viewConfig.canvasWidth / (this._viewConfig.levelsHigh as number * 2) - // Adjust for tree horizontal spacing on different screens
      +(this.type == VisType.Tree && this._viewConfig.isSmallScreen()) * 250 -
      +(this.type == VisType.Cluster && this._viewConfig.isSmallScreen()) * 210;
    this._viewConfig.dy =
      this._viewConfig.canvasHeight / (this._viewConfig.levelsWide as number * 4);
    //adjust for taller aspect ratio
    this._viewConfig.dx *= this._viewConfig.isSmallScreen() ? 4.25 : 2;
    this._viewConfig.dy *= this._viewConfig.isSmallScreen() ? 3.25 : 2;
  }

  setNodeRadius(): void {
    this._viewConfig.nodeRadius =
      (this._viewConfig.isSmallScreen() ? XS_NODE_RADIUS : LG_NODE_RADIUS) * BASE_SCALE;
  }

  setZoomBehaviour(): void {
    const zooms = function (e) {
      let t = { ...e.transform };
      let scale;
      let x, y;
      if (
        false //e?.sourceEvent &&
        // this.type == "radial" && // If it's the first zoom, just zoom in a little programatically, not out to scale 1
        // ((Math.abs(t.k < 1.1) &&
        //   e.sourceEvent?.deltaY < 0 &&
        //   e.sourceEvent?.deltaY > -60) ||
        //   (t.k == 1 && t.x < 150 && t.y < 150))
      ) {
        // Radial needs an initial zoom in
        // t.k = this._viewConfig.clickScale;
        // this.zoomBase().call(
        //   this.zoomer.transform,
        //   Object.assign(e.transform, t)
        // );
        // return;
      }
      if (this._zoomConfig.focusMode) {
        this.resetForExpandedMenu({ justTranslation: true });
        this._zoomConfig.focusMode = false;
        return;
      } else {
        scale = t.k;
        x = t.x + this._viewConfig.defaultCanvasTranslateX(scale) * scale;
        y = t.y + this._viewConfig.defaultCanvasTranslateY(scale) * scale;
      }
      select(".canvas")
        .transition()
        .ease(easeLinear)
        .duration(200)
        .attr("transform", `translate(${x},${y}), scale(${scale})`);
      this._zoomConfig.focusMode = false;
    };

    this.zoomer = zoom().scaleExtent([0.1, 1.5]).on("zoom", zooms.bind(this));
    this.zoomBase().call(this.zoomer);
  }

  calibrateViewPortAttrs(): void {
    this._viewConfig.viewportW =
      this._viewConfig.canvasWidth * (this._viewConfig.levelsWide as number);
    this._viewConfig.viewportH =
      this._viewConfig.canvasHeight * (this._viewConfig.levelsHigh as number);

    this._viewConfig.viewportX = 0;
    this._viewConfig.viewportY = 0;

    this._viewConfig.defaultView = `${this._viewConfig.viewportX} ${this._viewConfig.viewportY} ${this._viewConfig.viewportW} ${this._viewConfig.viewportH}`;
  }

  calibrateViewBox(): void {
    this.zoomBase()
      .attr("viewBox", this._viewConfig.defaultView)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .on("dblclick.zoom", null);
  }



  async refetchOrbits() {
    const variables = { sphereEntryHashB64: this.sphereEh };
    let data;
    try {
      const gql = await client;
      data = await gql.query({ query: GetOrbitsDocument, variables, fetchPolicy: 'network-only' })
      if (data?.data?.orbits) {
        const orbits = (extractEdges(data.data.orbits) as Orbit[]);
        const indexedOrbitData: Array<[ActionHashB64, OrbitNodeDetails]> = Object.entries(orbits.map(mapToCacheObject))
          .map(([_idx, value]) => [value.id, value]);
        this.cacheOrbits(indexedOrbitData);
      }
      console.log('refetched orbits :>> ', data);
    } catch (error) {
      console.error(error);
    }
  }

  async cacheOrbits(orbitEntries: Array<[ActionHashB64, OrbitNodeDetails]>) {
    try {
      store.set(nodeCache.setMany, orbitEntries)
      this.nodeDetails = Object.entries(orbitEntries);
      console.log('Sphere orbits fetched and cached!')
    } catch (error) {
      console.error('error :>> ', error);
    }
  }

  bindEventHandlers(selection) {
    selection
      .on("contextmenu", this.eventHandlers.rgtClickOrDoubleTap)
      .on("click", (e, d) => {
        if (!["BUTTON", 'IMG'].includes(e.target.tagName)) return;
        if(e.target.tagName == "IMG" && !e.target.dataset.button) return;

        this.eventHandlers.handleNodeFocus.call(this, e, d);
        switch (true) {
          case e.target.classList.contains('checkbox-button'):
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.nodeDetails[d.data.content].checked = !(this.nodeDetails[d.data.content].checked);
            e.target.classList.toggle('checked');
            e.target.closest('.the-node').firstChild.classList.toggle('checked');

            const parentAndChildChecked = (d: any) => {
              const parent = d.source?.data?.content;
              const child = d.target?.data?.content;
              if (!parent || !this.nodeDetails[parent] || !child || !this.nodeDetails[child]) return
              const cachedNodeParent = Object.values(this.nodeDetails).find(n => n.eH == parent);
              const cachedNodeChild = Object.values(this.nodeDetails).find(n => n.eH == child);
              return cachedNodeChild?.checked && cachedNodeParent?.checked
            };
            this._enteringLinks
              .attr("stroke", (d) => {
                return parentAndChildChecked(d) ? 'rgba(11,254,184, 1)' : '#fefefe'
              })
              .attr("stroke-opacity", (d) => {
                return parentAndChildChecked(d) ? 1 : 0.35
              }
            )
            if(false){ //TODO: Add condition to stop tearing
              this._gTooltip.select(".tooltip-inner foreignObject").html((d) => {
                if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
                const { checked, scale, parentEh } = this.nodeDetails[d.data.content];
                return `<div class="buttons">
                  <button class="tooltip-action-button higher-button ${!parentEh && scale !== 'Astro' ? 'hide' : 'hide'}"></button>
                  <img data-button="true" class="tooltip-action-button checkbox-button" src=${checked ? "assets/checkbox-checked.svg" : "assets/checkbox-empty.svg"} />
                  <button class="tooltip-action-button lower-button"></button>
                </div>`
              });
            }
            this.render();
            break;

          case e.target.classList.contains('higher-button'): // Prepend
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.eventHandlers.handlePrependNode.call(this, { childOrbitEh: this.nodeDetails[d.data.content].eH as string })
            break;

          case e.target.classList.contains('lower-button'): // Append
            if (!d?.data?.content || !this.nodeDetails[d.data.content]) return
            this.eventHandlers.handleAppendNode.call(this, { parentOrbitEh: this.nodeDetails[d.data.content].eH as string })
            break;

          default:
            break;
        }
        // if (!this._gLink.attr("transform"))
        //   // If it is not a radial vis
        //   this.eventHandlers.handleNodeZoom.call(this, e, d, false);
      })
    }
  render() {
    if (this.skipMainRender) return this.skipMainRender = false;
    if (this.noCanvas()) {
      this._canvas = select(`#${this._svgId}`)
        .append("g")
        .classed("canvas", true);
    }

    if (this.firstRender()) {
      this.setNodeRadius();
      this.setLevelsHighAndWide();
      this.calibrateViewPortAttrs();
      this.calibrateViewBox();
      this.setdXdY();
      this.setZoomBehaviour();
    }

    if (
      this.firstRender() ||
      this.hasNewHierarchyData()
    ) {
      // First render OR New hierarchy needs to be rendered

      if (this.noCanvas()) return;
      this.clearCanvas();

      // Update the current day's rootData
      if (this.hasNextData()) {
        this.rootData = this._nextRootData;
        delete this._nextRootData
      }

      this.setLayout();

      this.setNodeAndLinkGroups();
      this.setNodeAndLinkEnterSelections();
      this.setCircleAndLabelGroups();

      this.appendNodeDetailsAndControls();
      // this.appendLinkPath();

      this.appendCirclesAndLabels();

      this.eventHandlers.handleNodeZoom.call(this, null, this.activeNode);

      // this._viewConfig.isSmallScreen() &&
      //   this.bindMobileEventHandlers(this._enteringNodes);

      this._canvas.attr(
        "transform",
        `scale(${BASE_SCALE}), translate(${this._viewConfig.defaultCanvasTranslateX()}, ${this._viewConfig.defaultCanvasTranslateY()})`
      );

      console.log("BaseVis render complete... :>>");
      this._hasRendered = true;
    }

    if (!select("svg.legend-svg").empty() && select("svg .legend").empty()) {
      console.log("Added legend :>> ");
      // this.addLegend();
      // this.bindLegendEventHandler();
    }
  }
}