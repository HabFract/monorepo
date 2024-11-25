import { useStateTransition } from '../../hooks/useStateTransition';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';

function SettingsLayout({ children }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing
  return (
    <div className="settings-layout">
      <div className="header-action">
        <HeaderAction
          title={"Settings"}
          icon1={getIconSvg('back')}
          icon2={null}
          handlePrimaryAction={() => transition("Home")}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default SettingsLayout;
