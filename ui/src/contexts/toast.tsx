import React, { createContext, useContext, useState, ReactNode } from "react";

const TOOLTIP_TIMEOUT = 4500;

interface ToastContextProps {
  showToast: (text: string, timeout?: number, bypass?: boolean) => void;
  hideToast: () => void;
  toastText: string;
  isToastVisible: boolean;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toastText, setToastText] = useState<string>("");
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const showToast = (
    text: string,
    timeout: number = TOOLTIP_TIMEOUT,
    bypass?: boolean,
  ) => {
    if (bypass) return;

    setToastText(text);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, timeout);
  };

  const hideToast = () => {
    setIsToastVisible(false);
  };

  return (
    <ToastContext.Provider
      value={{ showToast, hideToast, toastText, isToastVisible }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
