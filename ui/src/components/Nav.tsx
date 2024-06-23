import "./style.css";
import TreeVisIcon from "./TreeVisIcon";

import { UnorderedListOutlined, PieChartFilled, PlusCircleFilled, ArrowsAltOutlined, PlusCircleOutlined } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useEffect, useRef, useState } from "react";
import { Sphere, useGetSpheresQuery } from "../graphql/generated";
import { Button, DarkThemeToggle, Spinner } from "flowbite-react";
import { currentOrbitCoords, currentSphere } from "../state/currentSphereHierarchyAtom";
import { SphereNodeDetailsCache, nodeCache, store } from "../state/jotaiKeyValueStore";
import { extractEdges } from "../graphql/utils";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";

type MenuItem = Required<MenuProps>['items'][number];

const TOOLTIP_TIMEOUT = 2500; // milliseconds

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  disabled?
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    disabled
  } as MenuItem;
}

enum Page {
  CreateSphere = 'CreateSphere',
  ListSpheres = 'ListSpheres',
  CreateOrbit = 'CreateOrbit',
  ListOrbits = 'ListOrbits',
  Dashboard = 'Dashboard',
  Vis = 'Vis',
  Home = 'Home',
}

export interface INav {
  transition: (newState: string, params?: object) => void;
  setSideNavExpanded: Function;
  sideNavExpanded: boolean;
}

const Nav: React.FC<INav> = ({ transition, sideNavExpanded, setSideNavExpanded } : INav) => {
  const ref = useRef(null);
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  const tooltipRef = useRef(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [collapsed, setCollapsed] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState<string>("");

  // Nav open, close, selected states handler bound and unbound by useEffect:
  useEffect(() => {
    const handleClick = (event) => {
      if(event.target.isConnected && !(ref as any).current.contains(event.target)){
        closeMenu();
      } 
      const iconBtn = !!event.target.closest('.toggle-expanded-menu');
      const subMenuSelected = event.target.closest('.ant-menu-sub')?.classList?.contains('ant-menu-vertical');
      const bottomMenuSelected = !!event.target.closest('.main-actions-menu');
      const plusSelected = !!event.target.closest('.side-nav > .ant-menu-root .ant-menu-item:first-of-type');
      if(!iconBtn && (subMenuSelected || bottomMenuSelected || plusSelected)) {
        removeOtherActiveNavItemStates()
      } 
    }
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  const selectedSphere = store.get(currentSphere);
  const currentSphereId = selectedSphere?.actionHash as ActionHashB64;
  // Menu state/dom helpers
  function closeMenu () {
    setCollapsed(true);
    setSideNavExpanded(false)
  };
  function openMenu () {
    setCollapsed(false);
    setSideNavExpanded(true)
  };
  function removeOtherActiveNavItemStates() {
    [...document.querySelectorAll(".ant-menu-item-selected")]?.forEach(item => item.classList.remove("ant-menu-item-selected"))
  };

  // Helpers for creating menu items
  function createFixedMenuItems() {
    return [
      getItem('List Spheres', 'list-spheres', <UnorderedListOutlined />),
      // getItem('Dashboard', 'db', <PieChartFilled />, undefined, undefined, true),
    ]  
  }
  function createSphereMenuItems({ spheres }: { spheres: Sphere[] }) {
    return [    
      getItem(
        'New Sphere',
        'add-sphere',
        <PlusCircleFilled />,
        undefined,
        undefined,
        (() => !!(typeof spheresArray == 'object' && spheresArray.length >= 4))() // Disable when we have 4 already),
      ),
      ...spheres!.map((sphere: Sphere, _idx: number) => {
      return getItem(
        `${sphere.name}`,
        sphere.id,
        <img className={currentSphereId == sphere.id ? 'selected' : ''} src={sphere.metadata!.image as string}/>,
      )})
    ] 
  }

  // Small single use component:
  const ToggleMenuExpand = () => {
    return (
      <div className={!sideNavExpanded ? "flex flex-col gap-1 w-full " : "flex flex-col gap-1 w-full items-start"} >
        <button className="toggle-expanded-menu" onClick={() => {sideNavExpanded ? closeMenu() : openMenu()}}>
          <ArrowsAltOutlined className={!sideNavExpanded ? "collapsed" : "expanded"}/>
        </button>
      </div>
    )
  }

  const loading = loadingSpheres || !spheres;
  const spheresArray = loading ? [] : extractEdges(spheres.spheres); 
  const tooltipMsg = `You need to ${ spheresArray.length == 0 ? "create" : spheresArray.length == 4 ? "delete" : "select"} a Sphere `;
  

  const sphere = (sphereAh?: EntryHashB64) => extractEdges(spheres?.spheres as any).find((sphere: any) => (sphereAh || sphere.id) == currentSphereId) as Sphere & {id: ActionHashB64};
  const noSphereOrbits = (sphereAh?: EntryHashB64) =>  {
    const cacheId = (sphereAh || sphere()?.id);
    if(!cacheId) return true;
    const sphereNodes =  store.get(nodeCache.items)?.[cacheId as keyof SphereNodeDetailsCache];
    return (!sphereNodes || (typeof sphereNodes == 'object' && !(Object.values(sphereNodes).length > 0)));
  }
  // Main routing logic for menus
  const onClick: MenuProps['onClick'] = (e) => {
    switch (true) {
      case e.key == 'db':
        return // TEMP
        setCurrentPage(Page.Dashboard)
        transition('Dashboard', {})
        break;

      case e.key == 'add-sphere':
        if(spheresArray.length >= 4) {
          setTooltipText(tooltipMsg + "before you can add another Sphere. These are the 4 burners of your habit life!")
          if(tooltipRef.current) {(tooltipRef.current as HTMLElement).style.top = "0rem"}
          activatePageContextTooltip()
        }
        store.set(currentSphere, {});
        setCurrentPage(Page.CreateSphere)
        closeMenu()
        transition('CreateSphere')
        break;

      case e.key == 'list-spheres':
        if(spheresArray.length == 0) {
          // If there is a problem, just show a tooltip

          setTooltipText(tooltipMsg + "before you can view the Spheres list")
          if(tooltipRef.current) {(tooltipRef.current as HTMLElement).style.top = "0rem"}
          activatePageContextTooltip()
          openMenu()
          return;
        }
        setCurrentPage(Page.ListSpheres)
        transition('ListSpheres')
        
        if(!collapsed && sideNavExpanded) closeMenu();
        break;

      default:
        // Falls through to any Sphere context icon
        // Check conditions where the current page would cause errors for the new Sphere selection
        if([Page.Vis].includes(currentPage as Page) && noSphereOrbits(e.key)) {
          // If there is a problem, just show a tooltip
          setTooltipText("Select a Sphere with existing Orbits to enable Visualisation")
          openMenu()
          activatePageContextTooltip()
        } else {
          setTooltipVisible(false)
          // Set current sphere from action hash of sphere clicked
          store.set(currentSphere, {entryHash: sphere()?.eH, actionHash: e.key})
          // expand menu for action buttons
          if(collapsed && !sideNavExpanded) openMenu();

          const pageString = currentPage as string;
          if(currentPage== Page.Home) return
          // Reload the current page with a new sphere context
          transition(pageString, pageString == "ListOrbits" ? {sphereAh: e.key} : pageString == "CreateOrbit" ?  {sphereEh: sphere().eH} : {currentSphereEhB64: selectedSphere.entryHash, currentSphereAhB64: e.key})
        }
        break;
    }
  };

  // Helper for buttons that may require menu tooltip state to change
  function buttonWithTooltipHandling(type: string) {
    return <Button
      type="button"
      onClick={(_e) => {goToPage(type)}}
      disabled={spheresArray.length == 0 || !currentSphereId || (currentPage == Page.Vis && noSphereOrbits())}
      className={`btn btn-sq btn-${type} ` +  (isCurrentPage(type) ? "nohover" : "")}
      style={{cursor: isCurrentPage(type) ? "initial" : "pointer", outlineOffset: "-4px", borderColor: "transparent", outline: isCurrentPage(type) ? "3px solid rgba(251,200,43, 1)" : ""}}
    >
      {getIcon(type)}
    </Button>

    function goToPage(type: string) {
      switch (type) {
        case 'neutral': 
          setTooltipVisible(false);
          setCurrentPage(Page.ListOrbits)
          transition('ListOrbits', {sphereAh: sphere().id})
          closeMenu()
          return
        case 'primary':
          if(noSphereOrbits()) {
            setTooltipText("Select a Sphere with existing Orbits to enable Visualisation")
            if(tooltipRef.current) {(tooltipRef.current as HTMLElement).style.top = "0rem"}
            activatePageContextTooltip()
            return
          }
          store.set(currentOrbitCoords, {x: 0, y: 0});
          setCurrentPage(Page.Vis)       
          transition('Vis', {currentSphereEhB64: sphere().eH, currentSphereAhB64: sphere().id})   
          closeMenu()
          return
        case 'secondary': 
          setTooltipVisible(false);
          setCurrentPage(Page.CreateOrbit)
          transition('CreateOrbit', {sphereEh: sphere().eH})   
          closeMenu()
        return
      }
    }
    function isCurrentPage(type: string) {
      switch (type) {
        case 'neutral': return currentPage == Page.ListOrbits
        case 'primary': return currentPage == Page.Vis
        case 'secondary': return currentPage == Page.CreateOrbit
      }
    }
    function getIcon(type: string) {
      switch (type) {
        case 'neutral': return (<UnorderedListOutlined />)
        case 'primary': return (<TreeVisIcon />)
        case 'secondary': return (<PlusCircleOutlined />)
      }
    }
  }

  function activatePageContextTooltip() {
    setTooltipVisible(true);
    setTimeout(() => {
      setTooltipVisible(false);
      if(tooltipRef.current) (tooltipRef.current as HTMLElement).style.top = "initial"
    }, TOOLTIP_TIMEOUT);
  }
  
  return (
    <nav ref={ref} className={sideNavExpanded ? "side-nav expanded" : "side-nav"}>
      { loading
        ? <Spinner aria-label="Loading!" className='menu-spinner' size="xl" />
        : <>
          <Menu
            inlineCollapsed={collapsed}
            onClick={onClick}
            style={{ width: collapsed ? 72 : 256 }}
            mode="inline"
            items={createSphereMenuItems({spheres: spheresArray})}
          />
          <div className={"main-actions-menu"}>
            <div style={{ display: collapsed ? "none" : "flex" }} className={"sphere-context-actions"} data-tooltip-target="tooltip-left" data-tooltip-placement="left" >
              <div ref={tooltipRef} id="tooltip-left" role="tooltip" className={tooltipVisible ? "" : "invisible"}>
                {`${tooltipText}`}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              {buttonWithTooltipHandling('neutral')}
              {buttonWithTooltipHandling('secondary')}
              {buttonWithTooltipHandling('primary')}
            </div>
            <Menu
              inlineCollapsed={collapsed}
              onClick={(e) => onClick(e)}
              style={{ width: collapsed ? 72 : 256 }}
              mode="inline"
              items={createFixedMenuItems()}
            />
            {<ToggleMenuExpand></ToggleMenuExpand>}
          </div>
        </>
      }
    </nav>
  );
};

export default Nav;
