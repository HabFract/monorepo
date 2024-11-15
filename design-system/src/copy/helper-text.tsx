import { ReactNode, useState } from "react";
import "./common.css";
import { getIconSvg } from "../icons/icons";
import VisModal from "../modals/VisModal";

export interface HelperTextProps {
  onClickInfo?: () => any;
  children: React.ReactNode;
  title?: string;
  withInfo?: boolean;
  titleIcon?: React.ReactNode;
} 

const HelperText: React.FC<HelperTextProps> = ({
  children,
  title,
  titleIcon,
  withInfo = true,
  onClickInfo = () => ({ body: "Test tooltip content" }),
}: HelperTextProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="helper-text">
      {title ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span>{titleIcon}</span>
            <span className="helper-title">{title}</span>
          </div>
          <span className="helper-content">{children}</span>
        </div>
      ) : (
        <span>{onClickInfo?.()?.label}</span>
      )}
      {withInfo && (
        <>
          <div className="btn-info">
          {withInfo && (
              <>
                <button type="button" onClick={() => setTooltipVisible(true)}>
                  {getIconSvg('info')({})}
                </button>
                <VisModal modalAnnotation={onClickInfo?.()?.annotation as string} title={onClickInfo?.()?.title as string} isModalOpen={tooltipVisible} size="lg" onClose={() => setTooltipVisible(false)}>
                  {getInfoBody(onClickInfo?.()?.body)}
                </VisModal>
              </>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default HelperText;

function getInfoBody(infoId: string) : ReactNode {
  switch (infoId) {
    case 'Star':
      return <div className="flex flex-col gap-2">
      <img className="max-w-72 mx-auto" src="/assets/sun.svg"></img>
      <h1 className="text-xl text-center text-white text-opacity-100">Star</h1>
      <p>Stars are the main thrust of your plan & your guiding light in this journey. They guide your path and inspire you to reach for the stars!</p>
    </div>
    case 'Giant':
      return <div className="flex flex-col gap-2">
      <img style={{transform: "scale(1.4) translate(.25rem, .75rem)"}} className="max-w-72 mx-auto" src="/assets/planet.svg"></img>
      <h1 className="text-xl text-center text-white text-opacity-100">Giant</h1>
      <p>Giants are your big commitments, the stepping stones that bridge your dreams and daily actions. They remind you that making a promise to yourself is a giant leap towards success.</p>
    </div>
    case 'Dwarf':
      return <div className="flex flex-col gap-2">
      <img style={{transform: "translate(.25rem, 0)"}} className="max-w-72 mx-auto" src="/assets/moon.svg"></img>
      <h1 className="text-xl text-center text-white text-opacity-100">Dwarf</h1>
      <p>Dwarf plannits are your small, everyday actions. They may be tiny, but they pack a punch! These are the tasks you can tick off daily, keeping you on track and moving forward.</p>
    </div>
    default:
      return <></>
  }
}