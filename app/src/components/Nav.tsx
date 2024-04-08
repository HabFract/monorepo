import "./style.css";
import TreeVisIcon from "./TreeVisIcon";

import { DashboardFilled, UnorderedListOutlined, PieChartFilled, PlusCircleFilled, ArrowsAltOutlined, AppstoreAddOutlined, PlusCircleOutlined } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useEffect, useRef, useState } from "react";
import { Sphere, SphereConnection, SphereEdge, useGetSpheresQuery } from "../graphql/generated";
import { Button, DarkThemeToggle, Spinner } from "flowbite-react";
import { currentOrbitCoords, currentSphere } from "../state/currentSphereHierarchyAtom";
import { SphereNodeDetailsCache, SphereOrbitNodes, nodeCache, store } from "../state/jotaiKeyValueStore";
import { extractEdges } from "../graphql/utils";
import { ActionHashB64 } from "@holochain/client";

type MenuItem = Required<MenuProps>['items'][number];

const TOOLTIP_TIMEOUT = 2500; // milliseconds

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  onClick?: any
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem;
}

export interface INav {
  transition: (newState: string, params?: object) => void;
  setSideNavExpanded: Function;
  sideNavExpanded: boolean;
}

const Nav: React.FC<INav> = ({ transition, sideNavExpanded, setSideNavExpanded } : INav) => {
  const ref = useRef(null);
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  const [_, setSelectedItemName] = useState<string>();
  const [collapsed, setCollapsed] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [sphereBtnsTooltipVisible, setSphereBtnsTooltipVisible] = useState<string>("");

  useEffect(() => {
    const handleClick = (event) => setTimeout(() => {
      if(event.target.isConnected && !(ref as any).current.contains(event.target)){
        closeMenu();
      } 
      const iconBtn = !!event.target.closest('.toggle-expanded-menu');
      const subMenuSelected = event.target.closest('.ant-menu-sub')?.classList?.contains('ant-menu-vertical');
      const bottomMenuSelected = !!event.target.closest('.main-actions-menu');
      const plusSelected = !!event.target.closest('.ant-menu-item:last-of-type');
      if(!iconBtn && (subMenuSelected || bottomMenuSelected || plusSelected)) {
        removeOtherActiveNavItemStates()
      } 
    }, 10); // Let other state changes clear first

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  const selectedSphere = store.get(currentSphere);
  const currentSphereId = selectedSphere?.actionHash as ActionHashB64;
  const sphereNodes = currentSphereId && store.get(nodeCache.items) && store.get(nodeCache.items)![currentSphereId as keyof SphereNodeDetailsCache] as SphereOrbitNodes;

  // Main routing logic for menus
  const onClick: MenuProps['onClick'] = (e) => {
    removeOtherActiveNavItemStates()
    setSelectedItemName(e.key)

    switch (true) {
      case e.key == 'vis':
        store.set(currentOrbitCoords, {x: 0, y: 0});
        
        if(!selectedSphere.actionHash || !sphereNodes) {
          // Activate tooltip to encourage current Sphere selection
          if(collapsed && !sideNavExpanded) {
            setCollapsed(false);
            setSideNavExpanded(true)
          }
          setTooltipVisible(true);
          setTimeout(() => {
            setTooltipVisible(false);
          }, TOOLTIP_TIMEOUT);
          return;
        }
        transition('Vis', {currentSphereEhB64: selectedSphere.entryHash, currentSphereAhB64: selectedSphere.actionHash})
        break;
      case e.key == 'add-sphere':
        transition('CreateSphere')
        break;

      case e.key == 'list-spheres':
        transition('ListSpheres')
        break;

      default:
        // Set current sphere from action hash of sphere clicked
        store.set(currentSphere, {entryHash: e.key, actionHash: e.key})
        break;
    }
  };

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
    document.querySelectorAll(".ant-menu-item-selected")?.forEach(item => item.classList.remove("ant-menu-item-selected"))
  };

  // Helpers for creating menu items
  function createFixedMenuItems() {
    return [
      getItem('List Spheres', 'list-spheres', <UnorderedListOutlined />),
      // getItem('Dashboard', 'dash', <DashboardFilled />),
      getItem('Dashboard', 'vis', <>
        <PieChartFilled  data-tooltip-target="tooltip-left" data-tooltip-placement="left" />
          <div id="tooltip-left" role="tooltip" className={tooltipVisible ? "" : "invisible"}>
            You need to { spheresArray.length == 0 ? "create" : "select"} a sphere to start visualising!
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div></>),
    ]  
  }
  function createSphereMenuItems({ spheres }: { spheres: Sphere[], onClick: () => void}) {
    console.log('currentSphereId :>> ', currentSphereId);
    return [    
      getItem('New Sphere', 'add-sphere', <PlusCircleFilled />),
      ...spheres!.map((sphere: Sphere, _idx: number) => {
        return getItem(`${sphere.name}`, sphere.id, <img className={currentSphereId == sphere.id ? 'selected' : ''} src={sphere.metadata!.image as string} />)
    })] 
  }

  // Small single use components:
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
  const msg = `You need to ${ spheresArray.length == 0 ? "create" : "select"} a Sphere to `;

  function withTooltip(type: string, msg: string) {
    console.log('Object.values(sphereNodes) :>> ', typeof sphereNodes == 'object' && Object.values(sphereNodes));
    const noSphereOrbits = !!(type == 'secondary' && !sphereNodes || (!!sphereNodes && !(Object.values(sphereNodes)?.length > 0)))
    return <Button type="button" onClick={(_e) => {goToPage(type)}} data-button-id={type} data-tooltip-target="tooltip-left" data-tooltip-placement="left" disabled={spheresArray.length == 0 || !currentSphereId ||noSphereOrbits } className={`btn btn-sq btn-${type}`}>
          <div id="tooltip-left" role="tooltip" className={sphereBtnsTooltipVisible == type ? "z-50 top-0 transition-all" : "invisible transition-all"} style={{width: "12rem"}}>
              {msg}
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          { getIcon(type)}
    </Button>
    function goToPage(type: string) {
      switch (type) {
        case 'neutral': transition('ListOrbits', {sphereAh: currentSphereId})   
        return
        case 'secondary': transition('Vis', {currentSphereEhB64: selectedSphere.entryHash, currentSphereAhB64: selectedSphere.actionHash})   
        return
        console.log('{sphereAh: currentSphereId} :>> ', {sphereAh: currentSphereId});
        case 'primary': transition('CreateOrbit', {sphereAh: currentSphereId})   
        return
      }
    }
    function getIcon(type: string) {
      switch (type) {
        case 'neutral': return (<UnorderedListOutlined />)
        case 'secondary': return (<TreeVisIcon />)
        case 'primary': return (<PlusCircleOutlined />)
        return
      }
    }
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
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={createSphereMenuItems({spheres: spheresArray, onClick: () => {closeMenu(); setSideNavExpanded(false)}})}
          />
          <div className={"main-actions-menu"}>
            {!collapsed && 
              <div className="sphere-context-actions">
                {withTooltip('neutral', msg + 'list Orbits')}
                {withTooltip('secondary', msg + 'list Orbits')}
                {withTooltip('primary', msg + 'create an Orbit')}
              </div>
            }
            <Menu
              inlineCollapsed={collapsed}
              onClick={(e) => onClick(e)}
              style={{ width: collapsed ? 72 : 256 }}
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
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
