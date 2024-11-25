import { useStateTransition } from '../../hooks/useStateTransition';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';

function SettingsLayout({ children }: any) {
  const [_, transition, params, __, goBack] = useStateTransition();
    
  const routeBack = () => {
    if (!goBack()) {
      transition("Home");
    }
  };

  return (
    <div className="settings-layout">
      <div className="header-action">
        <HeaderAction
          title={"Settings"}
          icon1={getIconSvg('back')}
          icon2={null}
          handlePrimaryAction={routeBack}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default SettingsLayout;
