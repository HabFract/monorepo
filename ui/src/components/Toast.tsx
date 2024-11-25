import React from "react";
import { useToast } from "../contexts/toast";
import { WarningOutlined } from "@ant-design/icons";

const Toast: React.FC = () => {
  const { toastText, isToastVisible, hideToast, actionButton } = useToast();
  
  if (!isToastVisible) return null;

  return (
    <div
      className="toast left-2 top-2 right-2 z-100 rounded-xl dark:bg-surface-top-dark fixed flex gap-2 p-2 m-2"
      style={{ zIndex: 200, maxWidth: "24rem" }}
    >
      <div className="shrink-0 bg-secondary dark:bg-secondary-500 dark:text-gray-500 text-title flex items-center justify-center w-8 h-8 rounded-lg">
        <WarningOutlined className="place-content-center grid w-6 h-6" />
      </div>
      <div className="toast-text">{toastText}</div>
      <div className="flex items-center gap-2 ml-auto">
        {actionButton}
        <button
          onClick={hideToast}
          className="toast-close hover:text-primary text-text dark:text-text-dark flex text-3xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;