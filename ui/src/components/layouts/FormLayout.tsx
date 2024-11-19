import { useStateTransition } from '../../hooks/useStateTransition';
import { MODEL_DISPLAY_VALUES } from '../../constants';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';

function FormLayout({ children, type }: any) {
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  return (
    <div className="form-layout">
      <div className="header-action">
        <HeaderAction
          title={`Create New ${MODEL_DISPLAY_VALUES[type.toLowerCase()]}`}
          icon1={getIconSvg('back')}
          icon2={null}
          handlePrimaryAction={() => transition("Home")}
        ></HeaderAction>
      </div>
      {children}
    </div>
  );
}

export default FormLayout;
