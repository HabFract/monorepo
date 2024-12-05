import { ListGroup } from 'flowbite-react';
import { useStateTransition } from '../../hooks/useStateTransition';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';
import { EntryHashB64 } from '@holochain/client';
import { Sphere } from '../../graphql/generated';

function VisLayout({ children, title, handleDeleteSphere }: any) {
  const [_, transition, params, __, goBack, history] = useStateTransition();

  function routeToCreatePlanitt(sphereEh: EntryHashB64) {
    transition("CreateOrbit", { sphereEh });
  }
  function routeToPlanittList(currentSphereDetails: Sphere) {
    transition("ListOrbits", { sphereAh: currentSphereDetails.id, currentSphereDetails });
  }
  const routeBack = () => {
    if ((history[0]?.state).match("Onboarding") || (history[0]?.state == 'Vis') || !goBack()) {
      transition("Home");
    }
  };

  return (
    <div className="vis-layout">
      <div className="header-action">
        <HeaderAction
          title={title}
          icon1={getIconSvg('back')}
          icon2={getIconSvg('more')}
          handlePrimaryAction={routeBack}
          secondaryActionPopoverElement={<ListGroup className="no-auto-focus list-group-override w-48">
            <ListGroup.Item onClick={() => routeToPlanittList(params.currentSphereDetails)} icon={getIconSvg('list')}>List Planitts</ListGroup.Item>
            <ListGroup.Item onClick={() => routeToCreatePlanitt(params.currentSphereDetails.eH)} icon={getIconSvg('plus')}>Add Planitt</ListGroup.Item>
            <span className="list-item-danger text-danger">
              <ListGroup.Item onClick={handleDeleteSphere} color={"danger"} icon={getIconSvg('trash')}>Delete Space</ListGroup.Item>
            </span>
          </ListGroup>}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default VisLayout;
