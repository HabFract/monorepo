import React from "react";
import { useToast } from "../contexts/toast";
import { WarningOutlined } from "@ant-design/icons";

const Toast: React.FC = () => {
  const { toastText, isToastVisible, hideToast } = useToast();
  if (!isToastVisible) return null;

  return (
    <div
      className="toast left-2 flex m-2 p-2 gap-2 fixed top-2 right-2 z-100 rounded-xl bg-menu-bg"
      style={{ zIndex: 200, maxWidth: "24rem" }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-title">
        <WarningOutlined className="h-6 w-6 grid place-content-center" />
      </div>
      <div className="toast-text">{toastText}</div>
      <button
        onClick={hideToast}
        className="toast-close text-3xl mr-4 hover:text-primary"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;
