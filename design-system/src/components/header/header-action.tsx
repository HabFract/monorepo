import "./common.css";
import { Button } from "../buttons";
import { ComponentProps, FC, ReactElement, ReactNode } from "react";
import { Popover } from "flowbite-react";

export interface HeaderActionProps {
  title: String,
  icon1: FC<ComponentProps<"svg">> | null
  icon2: FC<ComponentProps<"svg">> | null
  handlePrimaryAction?: () => void,
  secondaryActionPopoverElement?: ReactNode,
}

const HeaderAction: React.FC<HeaderActionProps> = ({
  title,
  icon1,
  icon2,
  handlePrimaryAction,
  secondaryActionPopoverElement
}: HeaderActionProps) => {
  return (
    <div className={`header-action-container`}>
        {!!icon1 && <Button ariaLabel="Go back" onClick={() => handlePrimaryAction?.()} type="button" variant="icon" icon={icon1({}) as ReactElement<any>}></Button>}
        <h1>{title}</h1>
        {!!icon2 && <Popover
          content={secondaryActionPopoverElement}
        >
          <Button type="button" variant="icon" icon={icon2({}) as ReactElement<any>}></Button>
        </Popover>}
    </div>
  );
};

export default HeaderAction;