import { Modal as FBModal} from "flowbite-react";
import "./common.css";

export interface ModalProps {
  isModalOpen: boolean;
  title: string;
  footerElement: React.ReactNode;
  size: "sm" | "md" | "lg";
  onClose: (e: any) => void;
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isModalOpen,
  onClose,
  title,
  size,
  footerElement,
  children
}: ModalProps) => {
  return (
    <FBModal
      dismissible
      size={size}
      position={"center"}
      show={isModalOpen}
      onClose={onClose as any}
    >
      <FBModal.Header
        className={!title ? "hide-title" : ""}>
        {title}
      </FBModal.Header>
      <FBModal.Body
        className={`${size} ${!footerElement ? "hide-footer" : ""}`}>
        {children}
      </FBModal.Body>
      <FBModal.Footer>
        {footerElement}
      </FBModal.Footer>
    </FBModal>
  )
}

export default Modal;