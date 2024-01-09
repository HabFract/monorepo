import "./style.css";

import { DashboardFilled, UnorderedListOutlined, PieChartFilled, PlusCircleFilled, ArrowsAltOutlined } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useEffect, useRef, useState } from "react";
import { SphereConnection, SphereEdge, useGetSpheresQuery } from "../graphql/generated";
import { DarkThemeToggle } from "flowbite-react";

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

function createFixedMenuItems() {
  return [
    getItem('List Spheres', 'list-spheres', <UnorderedListOutlined />),
    getItem('Dashboard', 'dash', <DashboardFilled />),
    getItem('Visualise', 'vis', <PieChartFilled />),
  ]  
}

function createSphereMenuItems({ spheres, onClick }: { spheres: SphereConnection, onClick: () => void}) {
  return [...spheres.edges!.map((sphere: SphereEdge, _idx: number) => {
    return getItem(`${sphere.node.name}`, sphere.node.id, <img src={sphere.node.metadata!.image as string} />,
    [ 
      getItem('Orbit List', 'list-orbits-' + sphere.node.id, null),
        getItem('Create Orbit', 'add-orbit-' + sphere.node.eH, null),//, [getItem('Option 3', '1c'), getItem('Option 4', '1d')], 'group'
      ])
  }),
  getItem('New Sphere', 'add-sphere', <PlusCircleFilled />)] 
}

export interface INav {
  transition: (newState: string, params?: object) => void;
  toggleVerticalCollapse: () => void;
  verticalCollapse: boolean;
}

const Nav: React.FC<INav> = ({ transition, verticalCollapse, toggleVerticalCollapse } : INav) => {
  const ref = useRef(null);
  const { loading, error, data: spheres } = useGetSpheresQuery();
  

  const [selectedItemName, setSelectedItemName] = useState<string>();
  const [collapsed, setCollapsed] = useState(true);
  const closeMenu = () => {
    setCollapsed(true);
  };
  const openMenu = () => {
    setCollapsed(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && (event.target.tagName == 'NAV')) {
        openMenu();
      } else if(!(ref as any).current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const onClick: MenuProps['onClick'] = (e) => {
    setSelectedItemName(e.key)
    console.log('selectedItemName :>> ', selectedItemName);
    switch (true) {
      case e.key == 'vis':
        const visSphereEh = e.key.split('vis-')[1];
        transition('Vis', { sphereEh: visSphereEh })
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
        transition('ListOrbits', { sphereHash: sphereId })
        break;

      default:
        transition('Home')
        break;
    }
  };

  return (
    <nav ref={ref} className={verticalCollapse ? "collaped-vertical side-nav" : "side-nav"}>
      {loading || !spheres ? "Loading" :
        <Menu
          inlineCollapsed={collapsed}
          onClick={onClick}
          style={{ width: collapsed ? 72 : 256 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={createSphereMenuItems({spheres: spheres.spheres as any, onClick: () => {debugger;closeMenu()}})}
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
          <div className="flex flex-col gap-1">
            <button className="toggle-vertical-collapse" onClick={() => toggleVerticalCollapse()}>
              <ArrowsAltOutlined className={verticalCollapse ? "collapsed" : "expanded"}/>
            </button>
            <div className="w-16 fixed overflow-hidden right-1 top-0 cursor-pointer p-2 logo-div" onClick={() => transition('Home')}><img src="assets/logo-no-text.svg" alt="habit/fract"/></div>
          </div>
        </div>
    </nav>
  );
};

export default Nav;
