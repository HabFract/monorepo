import { useStateTransition } from '../../hooks/useStateTransition';
import { MODEL_DISPLAY_VALUES } from '../../constants';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';
import { ListGroup } from 'flowbite-react';
import { memo, useCallback, useMemo } from 'react';

interface ListLayoutProps {
  children: React.ReactNode;
  type: string;
  title?: string;
  primaryMenuAction: () => void;
  secondaryMenuAction: () => void;
}

const ListLayout = memo(({ 
  children, 
  type, 
  title, 
  primaryMenuAction, 
  secondaryMenuAction 
}: ListLayoutProps) => {
  const [_, transition, params, __, goBack] = useStateTransition();

  const routeBack = useCallback(() => {
    if (!goBack()) {
      transition("Home");
    }
  }, [goBack, transition]);

  const actionMenu = useMemo(() => (
    <ListGroup className="no-auto-focus list-group-override w-32">
      <ListGroup.Item 
        disabled 
        onClick={primaryMenuAction} 
        icon={getIconSvg('pencil')}
      >
        Edit
      </ListGroup.Item>
      <span className="list-item-danger text-danger">
        <ListGroup.Item 
          color="danger" 
          onClick={secondaryMenuAction} 
          icon={getIconSvg('trash')}
        >
          Delete
        </ListGroup.Item>
      </span>
    </ListGroup>
  ), [primaryMenuAction, secondaryMenuAction]);

  const displayTitle = title || `${MODEL_DISPLAY_VALUES[type]}s`;

  return (
    <div className="list-layout">
      <div className="header-action">
        <HeaderAction
          title={displayTitle}
          icon1={getIconSvg('back')}
          icon2={getIconSvg('more')}
          handlePrimaryAction={routeBack}
          secondaryActionPopoverElement={actionMenu}
        />
      </div>
      <div className="list-content">
        {children}
      </div>
    </div>
  );
});

ListLayout.displayName = 'ListLayout';
export default ListLayout;