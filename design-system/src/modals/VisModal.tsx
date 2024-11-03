import { Modal } from "flowbite-react";
import "./common.css";
import { darkThemeModal } from "../../src/darkTheme";

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
        theme={darkThemeModal}
        dismissible
        size={size}
        position={"center"}
        show={isModalOpen}
        onClose={onClose as any}
      >
        <Modal.Header>
          {children}
        </Modal.Header>
        <Modal.Body>
        </Modal.Body>
        <Modal.Footer>
          {modalAnnotation}
        </Modal.Footer>
      </Modal>
  )
}

export default VisModal;