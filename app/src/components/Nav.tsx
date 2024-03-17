import "./style.css";

import { DashboardFilled, UnorderedListOutlined, PieChartFilled, PlusCircleFilled, ArrowsAltOutlined } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useEffect, useRef, useState } from "react";
import { Sphere, SphereConnection, SphereEdge, useGetSpheresQuery } from "../graphql/generated";
import { DarkThemeToggle } from "flowbite-react";
import { currentOrbitCoords, currentSphere } from "../state/currentSphereHierarchyAtom";
import { store } from "../state/jotaiKeyValueStore";
import { extractEdges } from "../graphql/utils";
import { ActionHashB64 } from "@holochain/client";

type MenuItem = Required<MenuProps>['items'][number];

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
  toggleVerticalCollapse: () => void;
  expandedMenu: boolean;
}

const Nav: React.FC<INav> = ({ transition, expandedMenu, toggleVerticalCollapse } : INav) => {
  const ref = useRef(null);
  const { loading, error, data: spheres } = useGetSpheresQuery();
  
  const [_, setSelectedItemName] = useState<string>();
  const [collapsed, setCollapsed] = useState(true);
  const closeMenu = () => {
    setCollapsed(true);
  };
  const openMenu = () => {
    setCollapsed(false);
  };
  const removeOtherActiveNavItemStates = () => {
    console.log('removed other active nav item states :>> ', );
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if(!(ref as any).current.contains(event.target)) {
        toggleVerticalCollapse()
        closeMenu();
      }
      const subMenuSelected = event.target.closest('.ant-menu-sub')?.classList?.contains('ant-menu-vertical');
      const bottomMenuSelected = !!event.target.closest('.main-actions-menu');
      const plusSelected = !!event.target.closest('.ant-menu-item:last-of-type');
      if(subMenuSelected || bottomMenuSelected || plusSelected) {
        removeOtherActiveNavItemStates()
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const selectedSphere = store.get(currentSphere);

  const onClick: MenuProps['onClick'] = (e) => {
    setSelectedItemName(e.key)

    if(e.key.match(/list\-orbits\-|add\-orbit\-/)) { // Add any nav change conditions that should select a sphere
      const id = e.key.split(/list\-orbits\-|add\-orbit\-/)[1];
      const sphere = extractEdges(spheres?.spheres as any).find((sphere: any) => sphere.id == id) as Sphere & {id: ActionHashB64};
      sphere && store.set(currentSphere, {entryHash: sphere.eH, actionHash: sphere.id})
    }

    switch (true) {
      case e.key == 'vis':
        store.set(currentOrbitCoords, {x: 0, y: 0})
        transition('Vis', {currentSphereEhB64: selectedSphere.entryHash, currentSphereAhB64: selectedSphere.actionHash})
        break;

      case e.key == 'add-sphere':
        transition('CreateSphere')
        break;

      case e.key == 'list-spheres':
        transition('ListSpheres')
        break;

      case !!e.key.match(/add\-orbit/):
        const addOrbitSphereEh = e.key.split('add-orbit-')[1];
        transition('CreateOrbit', { sphereEh: addOrbitSphereEh })
        break;

      case !!e.key.match(/list\-orbits/):
        const sphereId = e.key.split('list-orbits-')[1];
        transition('ListOrbits', { sphereAh: sphereId })
        break;

      default:
        transition('Home')
        break;
    }
  };

  function createFixedMenuItems() {
    return [
      getItem('List Spheres', 'list-spheres', <UnorderedListOutlined />),
      getItem('Dashboard', 'dash', <DashboardFilled />),
      getItem('Visualise', 'vis', <PieChartFilled />),
    ]  
  }
  
  function createSphereMenuItems({ spheres, onClick }: { spheres: SphereConnection, onClick: () => void}) {
    return [...spheres.edges!.map((sphere: SphereEdge, _idx: number) => {
      return getItem(`${sphere.node.name}`, sphere.node.id, <img className={selectedSphere.actionHash == sphere.node.id ? 'selected' : ''} src={sphere.node.metadata!.image as string} />,
      [ 
        getItem('Orbit List', 'list-orbits-' + sphere.node.id, null),
          getItem('Create Orbit', 'add-orbit-' + sphere.node.eH, null),//, [getItem('Option 3', '1c'), getItem('Option 4', '1d')], 'group'
        ])
    }),
    getItem('New Sphere', 'add-sphere', <PlusCircleFilled />)] 
  }

  return (
    <nav ref={ref} className={expandedMenu ? "side-nav expanded" : "side-nav"}>
      {loading || !spheres ? "Loading" :
        <Menu
          inlineCollapsed={collapsed}
          onClick={onClick}
          style={{ width: collapsed ? 72 : 256 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={createSphereMenuItems({spheres: spheres.spheres as any, onClick: () => {closeMenu(); 
            toggleVerticalCollapse()}})}
        />}
        <div className={"main-actions-menu"}>
          <Menu
            inlineCollapsed={collapsed}
            onClick={onClick}
            style={{ width: collapsed ? 72 : 256 }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={createFixedMenuItems()}
          />
          <div className={!expandedMenu ? "flex flex-col gap-1 w-full " : "flex flex-col gap-1 w-full items-start"} >
            <button className="toggle-vertical-collapse" onClick={() => {expandedMenu ? closeMenu() : openMenu(); toggleVerticalCollapse();}}>
              <ArrowsAltOutlined className={!expandedMenu ? "collapsed" : "expanded"}/>
            </button>
            <div className="w-16 fixed overflow-hidden right-1 top-0 cursor-pointer p-2 logo-div" onClick={() => transition('Home')}><img src="assets/logo-no-text.svg" alt="habit/fract"/></div>
          </div>
        </div>
    </nav>
  );
};

export default Nav;
