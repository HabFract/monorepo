import { ListGroup } from 'flowbite-react';
import { useStateTransition } from '../../hooks/useStateTransition';
import './common.css'
import { Button, getIconSvg, HeaderAction } from 'habit-fract-design-system';
import { EntryHashB64 } from '@holochain/client';
import { Sphere } from '../../graphql/generated';
import { currentSphereHasCachedNodesAtom, store } from '../../state';
import { useToast } from '../../contexts/toast';
import { useEffect } from 'react';

function VisLayout({ children, title, handleDeleteSphere }: any) {
  const [_, transition, params, __, goBack, history] = useStateTransition();

  function routeToCreatePlannit(sphereEh: EntryHashB64) {
    transition("CreateOrbit", { sphereEh });
  }
  function routeToPlannitList(currentSphereDetails: Sphere) {
    transition("ListOrbits", { sphereAh: currentSphereDetails.id, currentSphereDetails });
  }
  const routeBack = () => {
    if ((history[0]?.state).match("Onboarding") || !goBack()) {
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
            <ListGroup.Item onClick={() => routeToPlannitList(params.currentSphereDetails)} icon={getIconSvg('list')}>List Plannits</ListGroup.Item>
            <ListGroup.Item onClick={() => routeToCreatePlannit(params.currentSphereDetails.eH)} icon={getIconSvg('plus')}>Add Plannit</ListGroup.Item>
            <span className="list-item-danger text-danger">
              <ListGroup.Item onClick={handleDeleteSphere} icon={getIconSvg('trash')}>Delete Space</ListGroup.Item>
            </span>
          </ListGroup>}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default VisLayout;
