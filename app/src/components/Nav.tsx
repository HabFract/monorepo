import "./style.css";

import { MenuUnfoldOutlined, MenuFoldOutlined, PlusCircleOutlined, DashboardFilled, UnorderedListOutlined, PieChartFilled } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useState } from "react";
import { SphereConnection, SphereEdge, useGetSpheresQuery } from "../graphql/generated";
import { DarkThemeToggle } from "flowbite-react";
import Icon from "@ant-design/icons/lib/components/Icon";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  console.log('label, key, type :>> ', label, key, type);
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

function createFixedMenuItems() {
  return [
    getItem('List Spheres', 'list-spheres', <UnorderedListOutlined />),
    getItem('Dashboard', 'dash', <DashboardFilled />),
    getItem('Visualise', 'vis', <PieChartFilled />),
  ]  
}

function createSphereMenuItems({ spheres }: { spheres: SphereConnection }) {
  return [...spheres.edges!.map((sphere: SphereEdge, _idx: number) => {
    return getItem(`${sphere.node.name}`, sphere.node.id, <img src={sphere.node.metadata!.image as string} />,
      [ 
        getItem('Orbit List', 'list-orbits-' + sphere.node.id, null),
        getItem('Create Orbit', 'add-orbit-' + sphere.node.eH, null),//, [getItem('Option 3', '1c'), getItem('Option 4', '1d')], 'group'
      ])
  }),
  getItem('Add Sphere', 'add-sphere', <PlusCircleOutlined />)] 
}

export interface INav {
  transition: (newState: string, params?: object) => void
}

const Nav: React.FC<INav> = ({ transition } : INav) => {
  const { loading, error, data: spheres } = useGetSpheresQuery();

  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onClick: MenuProps['onClick'] = (e) => {
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
    <nav className={"bg-dark-gray fixed inset-y-0 left-0 z-10 h-full flex justify-between flex-col"}>
      {/* {error && "Error"} */}
      {loading || !spheres ? "Loading" :
        <Menu
          inlineCollapsed={collapsed}
          onClick={onClick}
          style={{ width: collapsed ? 72 : 256 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={createSphereMenuItems(spheres)}
        />}
        <div className={"flex flex-col items-center mb-4 gap-2"}>
          {collapsed ? <MenuUnfoldOutlined onClick={toggleCollapsed}/> : <MenuFoldOutlined onClick={toggleCollapsed}/>}
          <Menu
            inlineCollapsed={collapsed}
            onClick={onClick}
            style={{ width: collapsed ? 72 : 256 }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={createFixedMenuItems()}
          />
          <DarkThemeToggle />
        </div>
    </nav>
  );
};

export default Nav;
