
import React from 'react';
import './common.css';
import { Button as FBButton } from 'flowbite-react';
import { darkThemeButton } from '../darkTheme';

export type ButtonProps = {
  type: "onboarding" | "primary" | "secondary";
  children?: any,
  icon?: any,
  onClick: () => {}
}

const Button: React.FC<ButtonProps> = ({ children, type, icon }: ButtonProps) => {

  return (
    <FBButton type={type == "onboarding" ? "submit" : "button"} className={type ? `btn btn-${type}` : "btn"}>
      {children}
    </FBButton>
  )
}

export default Button;