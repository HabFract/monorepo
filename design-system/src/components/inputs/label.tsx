import { Label } from "flowbite-react";
import "./common.css";
import "../buttons/common.css";
import { useState } from "react";
import { getIconSvg } from "../icons/icons";
import Modal from "../modals/Modal";

export interface LabelProps {
  id: string;
  labelValue: string;
  isListItem?: boolean;
  required?: boolean;
  withInfo?: boolean;
  onClickInfo?: () => { title: string, body: string, footer?: string };
  children: React.ReactNode;
}

const withLabel: React.FC<LabelProps> = ({
  children,
  id,
  labelValue,
  required,
  withInfo,
  onClickInfo,
  isListItem = false,
}: LabelProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div
      className={isListItem ? "max-w-md flex gap-2 items-center" : "max-w-md"}
      style={{ flexGrow: 9 }}
    >
      <div
        className={
          labelValue == "" ? "hidden"
            : isListItem
              ? "flex justify-end gap-2 h-8 w-4"
              : "flex justify-between h-8"
        }
      ><div className="flex justify-between gap-1">
          <Label
            className={isListItem ? "pt-1" : ""}
            htmlFor={id}
            value={labelValue}
          />
          {required ? <span className="reqd">*</span> : null}
        </div>

        <div className="btn-info">
          {withInfo && (
            <>
              <button onClick={() => setTooltipVisible(true)} type="button">
                {getIconSvg('info')({})}
              </button>
              <Modal footerElement={onClickInfo?.()?.footer && <p>{onClickInfo().footer as string}</p>} title={onClickInfo?.()?.title as string} isModalOpen={tooltipVisible} size="sm" onClose={() => setTooltipVisible(false)}>
                {onClickInfo?.()?.body.split("//").map((para, idx) => <p key={idx}>{para}</p>)}
              </Modal>
            </>
          )}
        </div>

      </div>
      {children}

    </div>
  );
};

export default withLabel;
