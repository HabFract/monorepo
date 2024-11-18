import React, { ReactNode } from "react";
import "./common.css";
import "../common.css";
import "../buttons/common.css";
import { Button } from "..";

export type ActionCardVariant = "default" | "icon" | "button";

export type ActionCardProps = {
  title: string;
  body?: string;
  runAction?: () => void;
  variant?: ActionCardVariant;
  icon?: ReactNode;
  button?: ReactNode;
};

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  body,
  runAction,
  variant = "default",
  icon,
  button,
}: ActionCardProps) => {
  return (
    <div className={`card action-card action-card-${variant}`}>
      {variant === "icon" ? (
        <div className="action-card-icon-content">
          <div>
            <header>{title}</header>
            {body && <div className="action-card-body">{body}</div>}
          </div>
          <Button 
            variant="circle-icon btn-neutral" 
            icon={icon} 
            onClick={runAction}
          ></Button>
        </div>
      ) : variant === "button" ? (
        <div className="action-card-button-content">
          <header>{title}</header>
          {body && <div className="action-card-body">{body}</div>}
          <div className="mt-4">
            {button}
          </div>
        </div>
      ) : (
        <>
          <header>{title}</header>
          <div className="action-card-body">{body}</div>
        </>
      )}
    </div>
  );
};

export default ActionCard;