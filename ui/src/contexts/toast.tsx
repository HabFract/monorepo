import React, { createContext, useContext, useState, ReactNode } from "react";

const TOOLTIP_TIMEOUT = 4500;

interface ToastContextProps {
  showToast: (text: string, options?: { 
    timeout?: number;
    bypass?: boolean;
    actionButton?: ReactNode;
  }) => void;
  hideToast: () => void;
  toastText: string;
  isToastVisible: boolean;
  actionButton?: ReactNode;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toastText, setToastText] = useState<string>("");
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [actionButton, setActionButton] = useState<ReactNode>();

  const showToast = (
    text: string,
    options?: {
      timeout?: number;
      bypass?: boolean;
      actionButton?: ReactNode;
    }
  ) => {
    if (options?.bypass) return;

    setToastText(text);
    setIsToastVisible(true);
    setActionButton(options?.actionButton);

    setTimeout(() => {
      setIsToastVisible(false);
      setActionButton(undefined);
    }, options?.timeout ?? TOOLTIP_TIMEOUT);
  };

  const hideToast = () => {
    setIsToastVisible(false);
    setActionButton(undefined);
  };

  return (
    <ToastContext.Provider
      value={{ showToast, hideToast, toastText, isToastVisible, actionButton }}
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