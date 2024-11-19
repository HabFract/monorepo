import { useStateTransition } from '../../hooks/useStateTransition';
import { MODEL_DISPLAY_VALUES } from '../../constants';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';
import { ListGroup } from 'flowbite-react';

function ListLayout({ children, type }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  return (
    <div className="list-layout">
      <div className="header-action">
        <HeaderAction
          title={`${MODEL_DISPLAY_VALUES[type]}s`}
          icon1={getIconSvg('back')}
          icon2={getIconSvg('more')}
          handlePrimaryAction={() => transition("Home")}
          secondaryActionPopoverElement={<ListGroup className="no-auto-focus list-group-override w-32">
            <ListGroup.Item  onClick={() => console.log("Clicked 1")} icon={getIconSvg('pencil')}>Edit</ListGroup.Item>
            <span className="list-item-danger text-danger">
              <ListGroup.Item onClick={() => console.log("Clicked 2")} icon={getIconSvg('trash')}>Delete</ListGroup.Item>
            </span>
          </ListGroup>}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default ListLayout;
