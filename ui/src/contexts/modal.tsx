import React, { createContext, useContext, useState, ReactNode } from "react";
import { Button, Modal } from "habit-fract-design-system";

interface ModalContextProps {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
  isModalVisible: boolean;
}

interface ModalConfig {
  title?: string;
  message: string;
  withCancel?: boolean;
  withConfirm?: boolean;
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: "sm" | "md" | "lg";
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setModalConfig(null);
  };

  const handleConfirm = () => {
    modalConfig?.onConfirm?.();
    hideModal();
  };

  const handleCancel = () => {
    modalConfig?.onCancel?.();
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal, isModalVisible }}>
      <div className={!!(modalConfig?.confirmText) ? "with-confirm-dialog hidden" : "with-dialog hidden"}></div>
      {children}
      {modalConfig && (
        <Modal
          isModalOpen={isModalVisible}
          onClose={handleCancel}
          title={modalConfig.title || "Confirmation"}
          size={!!modalConfig.confirmText ? 'sm' : modalConfig.size || "md"}
          footerElement={
            <div className={"flex justify-end w-full gap-2"}>
              {modalConfig?.withCancel && <Button
                type="button"
                variant={modalConfig?.destructive ? "neutral" : "danger"}
                onClick={handleCancel}
              >
                {modalConfig.cancelText || "Cancel"}
              </Button>}
              {modalConfig?.withConfirm && <Button
                type="button"
                variant={modalConfig?.destructive ? "danger" : "primary"}
                onClick={handleConfirm}
              >
                {modalConfig.confirmText || "Confirm"}
              </Button>}
            </div>
          }
        >
          <p className="confirmation-message">{modalConfig.message}</p>
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};