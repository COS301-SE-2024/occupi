import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Modal,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Chip,
  ModalContent,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import {
  FaRegBuilding,
  FaRegUser,
  FaRegComments,
  FaFilter,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import { AddRoomModal, EditRoomModal, FeedBackModal, TopNav } from "@components/index";
import { uploadRoomImage, getImageUrl } from 'Api';
import axios from "axios";

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

interface ApiResponse {
  data: Room[];
  message: string;
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  status: number;
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filterCriteria, setFilterCriteria] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [roomToDisable, setRoomToDisable] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [rooms, filterCriteria]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/view-rooms?filter={}");
      setRooms(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filterCriteria === "all") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) => room.floorNo === filterCriteria);
      setFilteredRooms(filtered);
    }
  };

  const uploadImage = async () => {
    if (!imageFile || !selectedRoom) return;

    try {
      const response = await uploadRoomImage(imageFile, selectedRoom.roomId);
      if (response.status === 200) {
        const updatedRoom = {
          ...selectedRoom,
          imageUrl: response.data.id,
        };
        setRooms(rooms.map(r => r.roomId === selectedRoom.roomId ? updatedRoom : r));
        setFilteredRooms(filteredRooms.map(r => r.roomId === selectedRoom.roomId ? updatedRoom : r));
        setIsUploadModalOpen(false);
        setSelectedRoom(null);
        setImageFile(null);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleDisable = (room: Room) => {
    setRoomToDisable(room);
    setIsFeedbackModalOpen(true);
  };

  const confirmDisable = async () => {
    if (!roomToDisable) return;

    try {
      // Make an API call to toggle the room's disabled state
      // await axios.post(`/api/toggle-room-state/${roomToDisable.roomId}`);

      // Update the state
      const updatedRoom = {
        ...roomToDisable,
        isDisabled: !roomToDisable.isDisabled,
      };

      setRooms(rooms.map((r) => (r.roomId === roomToDisable.roomId ? updatedRoom : r)));
      setFilteredRooms(filteredRooms.map((r) => (r.roomId === roomToDisable.roomId ? updatedRoom : r)));

      setIsFeedbackModalOpen(false);
      setRoomToDisable(null);
    } catch (error) {
      console.error("Error toggling room state:", error);
    }
  };

  const handleSaveRoom = async (updatedRoom: Room) => {
    try {
      await axios.put(`/api/update-room/${updatedRoom.roomId}`, updatedRoom);
      setRooms(rooms.map((r) => (r.roomId === updatedRoom.roomId ? updatedRoom : r)));
      setFilteredRooms(filteredRooms.map((r) => (r.roomId === updatedRoom.roomId ? updatedRoom : r)));
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleAddRoom = async (newRoom: Room) => {
    try {
      const response = await axios.put("/api/add-room", newRoom);
      if (response.data.status === 200) {
        setRooms([...rooms, newRoom]);
        setFilteredRooms([...filteredRooms, newRoom]);
        setIsAddRoomModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Rooms
            <span className="block text-sm opacity-65 text-text_col_secondary_alt">
              Update And Edit Available rooms in the Building
            </span>
          </div>
        }
        searchQuery={""}
        onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
          console.log(e.target.value);
        }}
      />

      <div className="flex items-center justify-between mb-4 mt-2">
        <h2 className="text-text_col text-2xl font-bold"></h2>
        <Button
          className="text-text_col_alt font-semibold bg-secondary_alt"
          onPress={() => setIsAddRoomModalOpen(true)}
        >
          <FaPlus className="mr-2" />
          Add New Room
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Button className="text-text_col_alt font-semibold bg-secondary_alt">
              <FaFilter className="mr-2 " />
              Filter by Floor
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem onPress={() => setFilterCriteria("all")}>All</DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("1")}>Floor 1</DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("2")}>Floor 2</DropdownItem>
            <DropdownItem onPress={() => setFilterCriteria("3")}>Floor 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-48 bg-secondary rounded-lg" />
            ))
          : filteredRooms.map((room) => (
              <motion.div
                key={room.roomId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4 relative"
              >
                <Card className="w-full bg-secondary mx-4 relative">
                  {room.isDisabled && (
                    <Chip color="danger" className="absolute top-2 right-2">
                      Disabled
                    </Chip>
                  )}
                  <div className="p-4 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
                      {room.imageUrl ? (
                        <Image
                          src={getImageUrl(room.imageUrl)}
                          alt={room.roomName}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                      <Button
                        className="mt-2 text-text_col_alt font-semibold bg-secondary_alt"
                        onPress={() => {
                          setSelectedRoom(room);
                          setIsUploadModalOpen(true);
                        }}
                      >
                        <FaUpload className="mr-2" />
                        Upload Image
                      </Button>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col">
                      <h4 className="text-text_col text-xl font-bold mb-2">{room.roomName}</h4>
                      <p className="text-text_col mb-2 flex-grow">{room.description}</p>
                      <div className="flex items-center mb-1">
                        <FaRegBuilding className="mr-2" />
                        <p className="text-text_col">Floor: {room.floorNo}</p>
                      </div>
                      <div className="flex items-center mb-1">
                        <FaRegUser className="mr-2" />
                        <p className="text-text_col">
                          Capacity: {room.minOccupancy} - {room.maxOccupancy}
                        </p>
                      </div>
                      <div className="flex items-center mb-4">
                        <FaRegComments className="mr-2" />
                        <p className="text-text_col">Room No: {room.roomNo}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          className="text-text_col_alt font-semibold bg-secondary_alt mr-2"
                          onPress={() => handleEdit(room)}
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          className="text-text_col_alt font-semibold bg-secondary_alt"
                          onPress={() => handleDisable(room)}
                        >
                          <FaTrashAlt className="mr-2" />
                          {room.isDisabled ? "Enable" : "Disable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <Modal
        backdrop="blur"
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedRoom(null);
          setImageFile(null);
        }}
        motionProps={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
        }}
      >
        <ModalContent>
          <ModalHeader className="text-text_col flex flex-col gap-1">
            <h3 className="text-text_col text-lg font-bold">Upload Room Image</h3>
          </ModalHeader>
          <ModalBody>
            <Input
              type="file"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setImageFile(files[0]);
                }
              }}
              accept="image/*"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={uploadImage}>
              Upload Image
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRoom}
        room={selectedRoom}
      />

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSave={handleAddRoom}
      />

      <FeedBackModal
        title="Confirm Action"
        message={`Are you sure you want to ${roomToDisable?.isDisabled ? 'enable' : 'disable'} this room?`}
        closeButtonLabel="Cancel"
        actionButtonLabel="Confirm"
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setRoomToDisable(null);
        }}
        onAction={confirmDisable}
      />
    </div>
  );
};

export default Rooms;