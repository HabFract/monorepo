import { darkThemeInputLabel } from '../darkTheme';

export interface LabelProps {
  forId: string;

}

const Label: React.FC<LabelProps> = ({ idFor, label } : LabelProps) => {

  return <Label theme={darkThemeInputLabel} htmlFor={forId} value={value} />
}
