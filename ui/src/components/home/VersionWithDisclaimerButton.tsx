import React, { FC } from "react";
import { Button } from "habit-fract-design-system";
import { AlertOutlined } from "@ant-design/icons";
import { NODE_ENV } from "../../constants";
import { isSmallScreen } from "../vis/helpers";

interface VersionDisclaimerProps {
  currentVersion: string | undefined;
  open: () => void;
}

const VersionDisclaimer: FC<VersionDisclaimerProps> = ({
  currentVersion,
  open
}) => {
  return (
    <div
      className={"app-version-disclaimer"}
    >
      {NODE_ENV !== "dev" && (
        <div className="version-number">v{currentVersion}</div>
      )}
      <Button type={"button"} variant={"secondary"} onClick={open}>
        {isSmallScreen() ? <AlertOutlined className="text-text dark:text-text-dark" /> : "Disclaimer"}
      </Button>
    </div>
  );
};

export default VersionDisclaimer;
