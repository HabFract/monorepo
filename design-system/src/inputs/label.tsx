import { Label } from "flowbite-react";
import "./common.css";
import { useState } from "react";
import { getIconSvg } from "../icons/icons";
import VisModal from "../modals/VisModal";

export interface LabelProps {
  id: string;
  labelValue: string;
  isListItem?: boolean;
  required?: boolean;
  withInfo?: boolean;
  onClickInfo?: () => { title: string, body: string };
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
          isListItem
            ? "flex justify-end gap-2 h-6 w-6 mb-2"
            : "flex justify-between h-6 mb-2"
        }
      ><div className="flex justify-between gap-1">
          <Label
            className={isListItem ? "pt-1" : ""}
            htmlFor={id}
            value={labelValue}
          />
          {required ? <span className="reqd">*</span> : null}
        </div>

        <div className="flex justify-between gap-2">
          {withInfo && (
              <div>
                <button onClick={() => setTooltipVisible(true)}>
                  {getIconSvg('info')({})}
                </button>
                <VisModal modalAnnotation="" title={onClickInfo?.()?.title as string} isModalOpen={tooltipVisible} size="lg" onClose={() => setTooltipVisible(false)}>
                  {onClickInfo?.()?.body.split("//").map((para, idx) => <p key={idx}>{para}</p>)}
                </VisModal>
              </div>
          )}
        </div>

      </div>
      {children}

    </div>
  );
};

export default withLabel;
