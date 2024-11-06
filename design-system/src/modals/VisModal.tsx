import { Modal } from "flowbite-react";
import "./common.css";
import { darkThemeModal } from "../darkTheme";

export interface VisModalProps {
  isModalOpen: boolean;
  title: string;
  modalAnnotation: string;
  size: "sm" | "md" | "lg";
  onClose: (e: any) => void;
  children: React.ReactNode
}

const VisModal: React.FC<VisModalProps> = ({
  isModalOpen,
  onClose,
  title,
  size,
  modalAnnotation,
  children
}: VisModalProps) => {
  return (
    <Modal
      dismissible
      
      // theme={darkThemeModal} // Due to a bug in propagating themes in React Flowbite, see common.css for class overrides
      size={size}
      position={"center"}
      show={isModalOpen}
      onClose={onClose as any}
    >
      <Modal.Header
        className={!title ? "hide-title" : ""}
        theme={darkThemeModal?.header}>
        {title}
      </Modal.Header>
      <Modal.Body
        className={!modalAnnotation ? "hide-footer" : ""}
        theme={darkThemeModal?.body}>
        {children}
      </Modal.Body>
      <Modal.Footer
        theme={darkThemeModal?.footer}>
        {modalAnnotation}
      </Modal.Footer>
    </Modal>
  )
}

export default VisModal;