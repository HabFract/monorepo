import { ListGroup } from 'flowbite-react';
import { useStateTransition } from '../../hooks/useStateTransition';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';
import { Sphere } from '../../graphql/generated';
import { useCallback, useMemo } from 'react';
import { EntryHashB64 } from '@state/types';

function VisLayout({ children, title, handleDeleteSphere }: any) {
  const [_, transition, params, __, goBack, history] = useStateTransition();

  const routeToCreatePlanitt = useCallback((sphereEh: EntryHashB64) => {
    transition("CreateOrbit", { sphereEh, editMode: false });
  }, [title, transition])
  const routeToPlanittList = useCallback((currentSphereDetails: Sphere) => {
    transition("ListOrbits", { sphereAh: currentSphereDetails.id, currentSphereDetails });
  }, [title, transition])

  const routeBack = useCallback(() => {
    if (!history[0] || (history[0]?.state).match("PreloadAndCache") || (history[0]?.state).match("Onboarding") || (history[0]?.state == 'Vis') || !goBack()) {
      transition("Home");
    }
  }, [history, goBack, transition]);


  const actionMenu = useMemo(() => (
    <ListGroup className="no-auto-focus list-group-override w-48">
      <ListGroup.Item onClick={() => routeToPlanittList(params.currentSphereDetails)} icon={getIconSvg('list')}>List Planitts</ListGroup.Item>
      <ListGroup.Item onClick={() => routeToCreatePlanitt(params.currentSphereDetails.eH)} icon={getIconSvg('plus')}>Add Planitt</ListGroup.Item>
      <span className="list-item-danger text-danger">
        <ListGroup.Item onClick={handleDeleteSphere} color={"danger"} icon={getIconSvg('trash')}>Delete Space</ListGroup.Item>
      </span>
    </ListGroup>
  ), [params.currentSphereDetails, routeToPlanittList]);

  return (
    <div className="vis-layout">
      <div className="header-action">
        <HeaderAction
          title={title}
          icon1={getIconSvg('back')}
          icon2={getIconSvg('more')}
          handlePrimaryAction={routeBack}
          secondaryActionPopoverElement={actionMenu}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default VisLayout;
