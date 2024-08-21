import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";

// In EditRoomModal.tsx
interface Room {
  description: string;
  floorNo: string;
  maxOccupancy: number;
  minOccupancy: number;
  roomId: string;
  roomName: string;
  roomNo: string;
  imageUrl?: string;
  isDisabled: boolean;
}
// In EditRoomModal.tsx
interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRoom: Room) => Promise<void>;
  room: Room | null;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ isOpen, onClose, onSave, room }) => {
  const [editedRoom, setEditedRoom] = React.useState<Room | null>(room);

  React.useEffect(() => {
    setEditedRoom(room);
  }, [room]);

  const handleInputChange = (field: keyof Room, value: string | number) => {
    if (editedRoom) {
      setEditedRoom({ ...editedRoom, [field]: value });
    }
  };

  const handleSave = () => {
    if (editedRoom) {
      onSave(editedRoom);
    }
    onClose();
  };

  if (!editedRoom) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="text-text_col flex flex-col gap-1">Edit Room</ModalHeader>
        <ModalBody>
          <Input
            label="Room Name"
            value={editedRoom.roomName}
            onChange={(e) => handleInputChange("roomName", e.target.value)}
          />
          <Input
            label="Description"
            value={editedRoom.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <Input
            label="Floor No"
            value={editedRoom.floorNo}
            onChange={(e) => handleInputChange("floorNo", e.target.value)}
          />
          <Input
            label="Min Occupancy"
            type="number"
            value={editedRoom.minOccupancy.toString()}
            onChange={(e) => handleInputChange("minOccupancy", parseInt(e.target.value))}
          />
          <Input
            label="Max Occupancy"
            type="number"
            value={editedRoom.maxOccupancy.toString()}
            onChange={(e) => handleInputChange("maxOccupancy", parseInt(e.target.value))}
          />
          <Input
            label="Room No"
            value={editedRoom.roomNo}
            onChange={(e) => handleInputChange("roomNo", e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button className="bg-secondary_alt text-text_col_alt" onPress={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditRoomModal;