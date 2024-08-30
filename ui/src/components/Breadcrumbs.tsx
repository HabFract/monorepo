import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Sphere } from "../graphql/generated";
import { BreadcrumbItemType, BreadcrumbSeparatorType } from "antd/es/breadcrumb/Breadcrumb";

function Breadcrumbs({ currentSphere, state, transition }: any) {
  function getItemsForPage() : Partial<BreadcrumbItemType & BreadcrumbSeparatorType>[] {
    const baseBreadcrumbs = [
      {
        onClick: (e) => { transition("Home") },
        title: <HomeOutlined />
      },
      {
        title: getPageName(state)
      },
    ];
    switch (state) {
      case 'Home':
        return [
          baseBreadcrumbs[0]
        ]
      case 'Vis':
        return baseBreadcrumbs
      case 'CreateSphere':
        return baseBreadcrumbs
      case 'ListSpheres':
        return baseBreadcrumbs
      default:
        return [
          baseBreadcrumbs[0],
          {
            onClick: (e) => { transition('ListOrbits', { sphereAh: currentSphere.id }) },
            title: (
              <>
                <span>{(currentSphere as Sphere)?.name}</span>
              </>
            ),
          },
          baseBreadcrumbs[1]
        ]
    }
  
  }
  
  return (
    <Breadcrumb
      items={getItemsForPage()}
    />
  )
}

function getPageName(state) {
  switch (state) {
    case 'Vis':
      return "Visualise"
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
