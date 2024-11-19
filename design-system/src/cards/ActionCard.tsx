import React, { ReactNode } from "react";
import "./common.css";
import "../common.css";
import "../buttons/common.css";
import { Button, getIconSvg, ImageUploadInput } from "..";
import { Field, Form } from "formik";

export type ActionCardVariant = "avatar" | "icon" | "button";

export type ActionCardProps = {
  title: string;
  body?: string;
  runAction?: () => void;
  variant?: ActionCardVariant;
  icon?: ReactNode;
  button?: ReactNode;
  secondaryAction?: () => void;
  name?: string;
  fieldName?: string;
  onImageRemove?: () => void;
  hasImage?: boolean;
};

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  body,
  runAction,
  variant = "button",
  icon,
  name,
  fieldName = "avatar",
  button,
  secondaryAction,
  hasImage,
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
      ) : variant === "avatar" ? (
          <div className="action-card-avatar-content">
            <Field
              component={ImageUploadInput}
              name={fieldName}
              values={{ name }}
              uploadButton={
                <Button 
                  variant="primary responsive" 
                  onClick={runAction}
                >
                  Choose Picture
                </Button>
              }
              clearButton={
                hasImage ? (
                  <Button 
                    variant="circle-icon btn-danger outlined nohover" 
                    icon={getIconSvg('trash')({})}
                  />
                ) : <></>
              }
          />
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