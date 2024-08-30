import "./style.css";
import TreeVisIcon from "./icons/TreeVisIcon";

import { UnorderedListOutlined, AppstoreOutlined, PlusCircleFilled, ArrowsAltOutlined, PlusCircleOutlined, SettingFilled, WarningOutlined } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useEffect, useRef, useState } from "react";
import { Sphere, useGetSpheresQuery } from "../graphql/generated";
import { Button, DarkThemeToggle, Spinner, Toast } from "flowbite-react";
import { currentOrbitCoords, currentSphere } from "../state/currentSphereHierarchyAtom";
import { SphereNodeDetailsCache, nodeCache, store } from "../state/jotaiKeyValueStore";
import { extractEdges } from "../graphql/utils";
import { ActionHashB64, EntryHashB64 } from "@holochain/client";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { AppMachine } from "../main";

type MenuItem = Required<MenuProps>['items'][number];

const TOOLTIP_TIMEOUT = 4500; // milliseconds

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
  setSettingsOpen: Function;
  sideNavExpanded: boolean;
}

const Nav: React.FC<INav> = ({ transition, sideNavExpanded, setSettingsOpen, setSideNavExpanded } : INav) => {
  const ref = useRef(null);
  const { loading: loadingSpheres, error, data: spheres } = useGetSpheresQuery();
  
  const [_, setCurrentPage] = useState<Page>(Page.Home);
  const [collapsed, setCollapsed] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState<string>("");
  const currentPage = AppMachine.state.currentState; // This is more reliable than the hook for tracking updated page state

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

  // Menu state/dom helpers
  function closeMenu () {
    setCollapsed(true);
    setSideNavExpanded(false)
    return true;
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
      getItem('List Spheres', 'list-spheres', <AppstoreOutlined />),
      getItem('Settings', 'settings', <SettingFilled />),
      // getItem('Dashboard', 'db', <PieChartFilled />, undefined, undefined, true),
    ]  
  }
  function createSphereMenuItems({ spheres }: { spheres: Sphere[] }) {
    return [    
      getItem(
        'New Sphere',
        'add-sphere',
        <PlusCircleFilled className={spheresArray.length >= 4 ? "grayed" : ""} />,
        undefined,
        undefined,
        false
      ),
      ...spheres!.map((sphere: Sphere, _idx: number) => {
      return getItem(
        `${sphere.name}`,
        sphere.id,
        <img className={store.get(currentSphere)?.actionHash == sphere.id ? 'selected' : ''} src={sphere.metadata!.image as string}/>,
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

  let loading = loadingSpheres || !spheres;

  const spheresArray = loading ? [] : extractEdges(spheres!.spheres);
  const [menuItems, setMenuItems] = useState<ItemType[]>(createSphereMenuItems({spheres: spheresArray}));

  useEffect(() => {
    spheresArray && setMenuItems(createSphereMenuItems({spheres: spheresArray}))
  }, [spheres, currentPage]);

  store.sub(currentSphere, () => {
    spheresArray && setMenuItems(createSphereMenuItems({spheres: spheresArray}))
  })
  const tooltipMsg = `You need to ${ spheresArray.length == 0 ? "create" : spheresArray.length == 4 ? "delete" : "select"} a Sphere `;

  const sphere = (sphereAh?: EntryHashB64) => spheresArray.find((sphere: any) => (sphereAh || store.get(currentSphere)?.actionHash) == sphere.id) as Sphere & {id: ActionHashB64};
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
      case e.key == 'settings':
        setSettingsOpen(true)
        break;

      case e.key == 'add-sphere':
        if(spheresArray.length >= 4) {
          setToastText(tooltipMsg + "before you can add another Sphere. These are the 4 burners of your habit life!")
          openMenu()
          activatePageContextTooltip()
          return;
        }
        store.set(currentSphere, {});
        setCurrentPage(Page.CreateSphere)
        closeMenu()
        transition('CreateSphere')
        break;

      case e.key == 'list-spheres':
        if(spheresArray.length == 0) {
          // If there is a problem, just show a toast

          setToastText(tooltipMsg + "before you can view the Spheres list")
          activatePageContextTooltip()
          openMenu()
          return;
        }
        setCurrentPage(Page.ListSpheres)
        transition('ListSpheres')
        
        if(!collapsed && sideNavExpanded) closeMenu();
        break;

      default:
        // Falls through to current Sphere selection context
        // Check conditions where the current page would cause errors for the new Sphere selection
        if([Page.Vis].includes(currentPage as Page) && noSphereOrbits(e.key)) {
          // If there is a problem, just show a tooltip
          setToastText("Ensure you have Orbits before attempting to Visualise another Sphere")
          openMenu()
          activatePageContextTooltip()
        } else if([Page.ListSpheres].includes(currentPage as Page)) {
          if(!(e.key == store.get(currentSphere).actionHash)) {
            store.set(currentSphere, {entryHash: sphere(e.key)?.eH, actionHash: e.key})
            openMenu()
          }
        } else if([Page.Vis].includes(currentPage as Page)) {
          (e.key == store.get(currentSphere).actionHash)
            ? closeMenu()
            : closeMenu() && transition('PreloadAndCache', {landingSphereEh: sphere(e.key)?.eH, landingSphereId: e.key })
        } else {
          setShowToast(false)
          if(store.get(currentSphere)?.actionHash == e.key) openMenu();
          // Set current sphere from action hash of sphere clicked
          store.set(currentSphere, {entryHash: sphere(e.key)?.eH, actionHash: e.key})

          const pageString = currentPage as string;
          if(currentPage== Page.Home) return
          // Reload the current page with a new sphere context
          transition(
              pageString, 
              pageString == "ListOrbits" 
                ? {sphereAh: e.key} 
                : pageString == "CreateOrbit" 
                  ? {sphereEh: sphere(e.key).eH}
                  : {currentSphereEhB64: store.get(currentSphere).entryHash, currentSphereAhB64: e.key}
          )
        }
        break;
    }
  };

  // Helper for buttons that may require menu tooltip state to change
  function buttonWithTooltipHandling(type: string) {
    return <Button
      type="button"
      onClick={(_e) => {goToPage(type)}}
      disabled={spheresArray.length == 0 || !store.get(currentSphere)?.actionHash || (currentPage == Page.Vis && noSphereOrbits())}
      className={`btn btn-sq btn-${type} ` +  (isCurrentPage(type) ? "nohover" : "")}
      style={{cursor: isCurrentPage(type) ? "initial" : "pointer", borderColor: "transparent", outlineOffset: "1px", outline: isCurrentPage(type) ? "3px solid rgb(17 24 39 / 1)" : ""}}
    >
      {getIcon(type)}
    </Button>

    function goToPage(type: string) {
      switch (type) {
        case 'neutral': 
          setShowToast(false);
          setCurrentPage(Page.ListOrbits)
          transition('ListOrbits', {sphereAh: sphere().id})
          closeMenu()
          return
        case 'primary':
          if(noSphereOrbits()) {
            setToastText("Select a Sphere with existing Orbits to enable Visualisation")
            activatePageContextTooltip()
            return
          }
          store.set(currentOrbitCoords, {x: 0, y: 0});

          setCurrentPage(Page.Vis)
          transition('Vis', {currentSphereEhB64: sphere().eH, currentSphereAhB64: sphere().id})   
          closeMenu()
          return
        case 'secondary': 
          setShowToast(false);
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

  function activatePageContextTooltip(customTimeout?: number) {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, customTimeout || TOOLTIP_TIMEOUT);
  }
  
  return (
    <>
      {showToast && (
        <Toast className="mt-2 fixed bottom-2 bg-menu-bg">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-title">
            <WarningOutlined className="h-5 w-5" />
          </div>
          <div className="toast-text">{toastText}</div>
          <Toast.Toggle onDismiss={() => setShowToast(false)} />
        </Toast>
      )}
      <nav ref={ref} className={sideNavExpanded ? "side-nav expanded" : "side-nav"}>
        { loading
          ? <Spinner aria-label="Loading!" className='menu-spinner' size="xl" />
          : <>
            <Menu
              inlineCollapsed={collapsed}
              onClick={onClick}
              style={{ width: collapsed ? 72 : 256 }}
              mode="inline"
              items={menuItems}
            />
            <div className={"main-actions-menu"}>
              <div style={{ display: collapsed ? "none" : "flex" }} className={"sphere-context-actions"} data-tooltip-target="tooltip-left" data-tooltip-placement="left" >
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
    </>
  );
};

export default Nav;
