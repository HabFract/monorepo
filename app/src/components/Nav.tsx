import "./style.css";
import { useQuery } from "@apollo/client";
import GET_SPHERES from '../graphql/queries/sphere/getSpheres.graphql';

import { MenuUnfoldOutlined, MenuFoldOutlined, PlusCircleOutlined, DashboardFilled, UnorderedListOutlined, PieChartFilled } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { useState } from "react";
import { SphereConnection, SphereEdge } from "../graphql/generated";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
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
    return getItem(`${sphere.node.name}`, sphere.node.id, null,
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
  const { loading, error, data: spheres } = useQuery(GET_SPHERES);

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
        transition('ListOrbits', { sphereEh: sphereId, sphereId })
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
          <Menu
            inlineCollapsed={collapsed}
            onClick={onClick}
            style={{ width: 72 }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={createFixedMenuItems()}
          />
          {collapsed ? <MenuUnfoldOutlined onClick={toggleCollapsed}/> : <MenuFoldOutlined onClick={toggleCollapsed}/>}
        </div>
    </nav>
  );
};

export default Nav;
