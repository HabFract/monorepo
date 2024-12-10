import { useStateTransition } from '../../hooks/useStateTransition';
import { MODEL_DISPLAY_VALUES } from '../../constants';
import './common.css'
import { getIconSvg, HeaderAction } from 'habit-fract-design-system';
import { memo, useCallback } from 'react';

interface FormLayoutProps {
  children: React.ReactNode;
  type: string;
}

const FormLayout = memo(({ children, type }: FormLayoutProps) => {
  const [_, transition, params, __, goBack] = useStateTransition();
    
  const routeBack = useCallback(() => {
    if (!goBack()) {
      transition("Home");
    }
  }, [goBack, transition]);

  const title = `${params.editMode ? "Update" : "Add"} ${MODEL_DISPLAY_VALUES[type.toLowerCase()]}`;

  return (
    <div className="form-layout">
      <div className="header-action">
        <HeaderAction
          title={title}
          icon1={getIconSvg('back')}
          icon2={null}
          handlePrimaryAction={routeBack}
        />
      </div>
      <div className="form-content">
        {children}
      </div>
    </div>
  );
});

FormLayout.displayName = 'FormLayout';
export default FormLayout;