import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Sphere } from "../../graphql/generated";
import { BreadcrumbItemType, BreadcrumbSeparatorType } from "antd/es/breadcrumb/Breadcrumb";

function Breadcrumbs({ currentSphere, state, transition, isFormEditMode }: any) {
  function getItemsForPage() : Partial<BreadcrumbItemType & BreadcrumbSeparatorType>[] {
    const baseBreadcrumbs = [
      {
        onClick: (e) => { transition("Home") },
        title: <HomeOutlined />
      },
      {
        title: getPageName(state, isFormEditMode)
      },
    ];
    switch (state) {
      case 'PreloadAndCache':
        return [
        ]
      case 'Home':
        return [
          baseBreadcrumbs[0]
        ]
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

function getPageName(state, isFormEditMode) {
  switch (state) {
    case 'Vis':
      return "Visualise"
    case 'CreateSphere':
      return isFormEditMode ? "Edit Sphere" : "Create a Sphere"
    case 'CreateOrbit':
      return isFormEditMode ? "Edit Orbit" : "Create an Orbit"
    case 'ListOrbits':
      return "Orbit Breakdown"
    case 'ListSpheres':
      return "Sphere Breakdown"
    default:
      return "---"
  }

}

export default Breadcrumbs
