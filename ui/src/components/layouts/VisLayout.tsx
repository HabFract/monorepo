import { useStateTransition } from '../../hooks/useStateTransition';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';

function VisLayout({ children, currentSphereName }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing
  return (
    <div className="vis-layout">
      <div className="header-action">
        <HeaderAction
          title={currentSphereName}
          icon1={getIconSvg('back')}
          icon2={getIconSvg('more')}
          handlePrimaryAction={() => transition("Home")}
          handleSecondaryAction={() => transition("LisSpheres")}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default VisLayout;
