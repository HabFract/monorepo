
import React from 'react';
import './common.css';
import { Button as FBButton } from 'flowbite-react';
import { darkThemeButton } from '../darkTheme';

export type ButtonProps = {
  type: "onboarding" | "primary" | "secondary"| "icon";
  children?: any,
  icon?: React.ReactElement,
  onClick: () => {}
}

const Button: React.FC<ButtonProps> = ({ children, type, icon }: ButtonProps) => {
  return (
    <FBButton type={type == "onboarding" ? "submit" : "button"} className={type ? `btn btn-${type}` : "btn"}>
      {icon || children}
    </FBButton>
  )
}

export default Button;