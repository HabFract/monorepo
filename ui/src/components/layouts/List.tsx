import { useStateTransition } from '../../hooks/useStateTransition';
import { MODEL_DISPLAY_VALUES } from '../../constants';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';

function ListLayout({ children, type }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  return (
    <div className="list-layout">
      <div className="header-action">
        <HeaderAction
          title={`${MODEL_DISPLAY_VALUES[type]}s`}
          icon1={getIconSvg('back')}
          icon2={null}
          handlePrimaryAction={() => transition("Home")}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default ListLayout;
