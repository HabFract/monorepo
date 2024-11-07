import "./common.css";
import { getIconSvg } from "../icons/icons";
import { Button } from "../buttons";
import { ComponentProps, FC, ReactElement } from "react";

export interface HeaderActionProps {
  title: String,
  icon1: FC<ComponentProps<"svg">> | null
  icon2: FC<ComponentProps<"svg">> | null
  handlePrimaryAction?: () => void,
  handleSecondaryAction?: () => void,
}

const HeaderAction: React.FC<HeaderActionProps> = ({
  title,
  icon1,
  icon2,
  handlePrimaryAction,
  handleSecondaryAction
}: HeaderActionProps) => {
  return (
    <div className={`header-action-container`}>
        {!!icon1 && <Button onClick={() => handlePrimaryAction?.()} type="button" variant="icon" icon={icon1({}) as ReactElement<any>}></Button>}
        <h1>{title}</h1>
        {!!icon2 && <Button onClick={() => handleSecondaryAction?.()} type="button" variant="icon" icon={icon2({}) as ReactElement<any>}></Button>}
    </div>
  );
};

export default HeaderAction;