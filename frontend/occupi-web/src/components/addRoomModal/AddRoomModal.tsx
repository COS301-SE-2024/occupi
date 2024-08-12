import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ModalContent,
} from "@nextui-org/react";

interface Room {
  roomId: string;
  roomNo: string;
  floorNo: string;
  minOccupancy: number;
  maxOccupancy: number;
  description: string;
  resources: string[];
  roomName: string;
  isDisabled: boolean;
}

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRoom: Room) => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newRoom, setNewRoom] = useState<Room>({
    roomId: "",
    roomNo: "",
    floorNo: "",
    minOccupancy: 1,
    maxOccupancy: 1,
    description: "",
    resources: [],
    roomName: "",
    isDisabled: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(newRoom);
    setNewRoom({
      roomId: "",
      roomNo: "",
      floorNo: "",
      minOccupancy: 1,
      maxOccupancy: 1,
      description: "",
      resources: [],
      roomName: "",
      isDisabled: false,
    });
  };

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
       <ModalContent>
      <ModalHeader className="text-text_col flex flex-col gap-1">Add New Room</ModalHeader>
      <ModalBody>
        <Input
          label="Room ID"
          name="roomId"
          value={newRoom.roomId}
          onChange={handleInputChange}
          placeholder="RM000"
        />
        <Input
          label="Room Number"
          name="roomNo"
          value={newRoom.roomNo}
          onChange={handleInputChange}
          placeholder="1"
        />
        <Input
          label="Floor Number"
          name="floorNo"
          value={newRoom.floorNo}
          onChange={handleInputChange}
          placeholder="3"
        />
        <Input
          label="Min Occupancy"
          name="minOccupancy"
          type="number"
          value={newRoom.minOccupancy.toString()}
          onChange={handleInputChange}
        />
        <Input
          label="Max Occupancy"
          name="maxOccupancy"
          type="number"
          value={newRoom.maxOccupancy.toString()}
          onChange={handleInputChange}
        />
        <Input
          label="Description"
          name="description"
          value={newRoom.description}
          onChange={handleInputChange}
        />
        <Input
          label="Room Name"
          name="roomName"
          value={newRoom.roomName}
          onChange={handleInputChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onPress={handleSave}>
          Add Room
        </Button>
        <Button color="secondary" onPress={onClose}>
          Cancel
        </Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddRoomModal;