import { Breadcrumb } from "antd";
import { useStateTransition } from "../hooks/useStateTransition";
import { HomeOutlined } from "@ant-design/icons";
import { Sphere } from "../graphql/generated";

function Breadcrumbs({ currentSphere }: any) {
  const [state, transition] = useStateTransition(); // Top level state machine and routing

  return (
    <Breadcrumb
      items={[
        {
          onClick: (e) => { transition("Home") },
          title: <HomeOutlined />
        },
        {
          onClick: (e) => { transition('ListOrbits', { sphereAh: currentSphere.id }) },
          title: (
            <>
              <span>{(currentSphere as Sphere)?.name}</span>
            </>
          ),
        },
        {
          title: getPageName(state),
        },
      ]}
    />
  )
}

function getPageName(state) {
  switch (state) {
    case 'Vis':
      return "vis page-container"
    case 'CreateSphere':
      return "Create a Sphere"
    case 'CreateOrbit':
      return "Create an Orbit"
    case 'ListOrbits':
      return "Orbits Breakdown"
    case 'ListSpheres':
      return "Sphere Breakdown"
    default:
      return "---"
  }

}

export default Breadcrumbs
