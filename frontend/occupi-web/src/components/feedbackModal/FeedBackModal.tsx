import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

interface FeedBackModalProps {
  title: string;
  message: string;
  closeButtonLabel?: string;
  actionButtonLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onAction?: () => void; // Add this line
}

const FeedBackModal: React.FC<FeedBackModalProps> = ({ title, message, closeButtonLabel, actionButtonLabel, isOpen, onClose, onAction }) => {
  const backdrop = 'blur';

  return (
    <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <>
          <ModalHeader className="text-text_col flex flex-col gap-1">{title}</ModalHeader>
          <ModalBody>
            <p className="text-text_col">{message}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              disabled={!closeButtonLabel}
            >
              {closeButtonLabel || "Close"}
            </Button>
            <Button
              className="bg-secondary_alt text-text_col_alt"
              onPress={() => {
                if (onAction) onAction(); // Call onAction if provided
              }}
              disabled={!actionButtonLabel}
            >
              {actionButtonLabel || "Action"}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default FeedBackModal;
