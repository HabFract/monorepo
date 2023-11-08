import { useQuery } from "@apollo/client";
import GET_SPHERES from '../graphql/queries/sphere/getSpheres.graphql';

import { MailOutlined, AppstoreOutlined } from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { Sphere, SphereConnection, SphereEdge } from "../graphql/mocks/generated";

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
  return [getItem('S1', '2', <MailOutlined />),getItem('S1', '3', <MailOutlined />)]  
}

function createSphereMenuItems({ spheres }: { spheres: SphereConnection }) {
  console.log('spheres :>> ', spheres);
  return spheres.edges!.map((sphere: SphereEdge) => {
    return getItem('S1', sphere.node.id, <MailOutlined />, [
    getItem('Item 1', 'g1', null, [getItem('Option 1', '1'), getItem('Option 2', '2')], 'group'),
    getItem('Item 2', 'g2', null, [getItem('Option 3', '3'), getItem('Option 4', '4')], 'group'),
  ])}) 
}


const Nav: React.FC = ({children, transition} : any) => {
  const { loading, error, data: spheres } = useQuery(GET_SPHERES);

  const onClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case '2':
        transition('About')
        break;
    
      case '3':
        transition('ListSpheres')
        break;
    
      default:
        transition('Home')
        break;
    }
  };

  return (
    <>
      <nav className={"fixed inset-y-0 left-0 z-10"}>
        {error && "Error"}
        {loading ? "Loading" :
          <Menu
            onClick={onClick}
            style={{ width: 256 }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={[...createSphereMenuItems(spheres), ...createFixedMenuItems()]}
          />}
      </nav>
      <main className={"fixed w-full h-full inset-y-0 left-0"}>{children}</main>
    </>
  );
};

export default Nav;