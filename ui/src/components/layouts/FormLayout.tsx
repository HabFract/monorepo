import { useStateTransition } from '../../hooks/useStateTransition';
import { MODEL_DISPLAY_VALUES } from '../../constants';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';

function FormLayout({ children, type }: any) {
  const [_, transition, params, __, goBack] = useStateTransition(); // Top level state machine and routing
    
  const routeBack = () => {
    if (!goBack()) {
      transition("Home");
    }
  };
  return (
    <div className="form-layout">
      <div className="header-action">
        <HeaderAction
          title={`${params.editMode ? "Update" : "Add"} ${MODEL_DISPLAY_VALUES[type.toLowerCase()]}`}
          icon1={getIconSvg('back')}
          icon2={null}
          handlePrimaryAction={routeBack}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default FormLayout;
